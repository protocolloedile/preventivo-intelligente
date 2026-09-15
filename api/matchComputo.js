import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://tahstkmfjiktnvlkcxfw.supabase.co';
const supabaseAdmin = createClient(SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const BATCH_SIZE = 40;
const MAX_VOCI = 600;
const MAX_ESEMPI = 30;

const UNIT_ALIASES = {
  mq: 'mq', m2: 'mq', 'm²': 'mq',
  mc: 'mc', m3: 'mc', 'm³': 'mc',
  ml: 'ml', m: 'ml', mt: 'ml',
  kg: 'kg',
  cad: 'cad', n: 'cad', nr: 'cad', pz: 'cad', cadauno: 'cad',
  h: 'h', ore: 'h', ora: 'h',
  corpo: 'corpo', acorpo: 'corpo', ac: 'corpo'
};

function normalizeUnit(unit) {
  return UNIT_ALIASES[String(unit || '').toLowerCase().replace(/[^a-z²³0-9]/g, '')] || '';
}

function truncate(text, max) {
  const clean = String(text || '').replace(/\s+/g, ' ').trim();
  return clean.length > max ? clean.slice(0, max - 1) + '…' : clean;
}

// Deve restare identica a normalizeDescrizione in src/App.jsx: e' la chiave della memoria abbinamenti.
function normalizeDescrizione(text) {
  return String(text || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .slice(0, 500);
}

const SYSTEM_PROMPT = `Sei un esperto di edilizia italiana. Devi abbinare ogni voce di un computo metrico alla voce più adatta del listino prezzi di un'impresa.

Regole:
- Abbina solo se la lavorazione è davvero la stessa o equivalente (stesso tipo di lavoro e di materiale) e l'unità di misura è compatibile.
- Se nessuna voce del listino corrisponde, usa null. Non forzare abbinamenti approssimativi.
- Più voci del computo possono essere abbinate alla stessa voce del listino.
- Se ricevi esempi di abbinamenti confermati dall'impresa, seguili: descrizioni simili vanno abbinate allo stesso modo.
- Restituisci un elemento per ogni voce del computo ricevuta, usando i numeri indicati.

Rispondi SOLO con JSON: {"abbinamenti": [{"computo": <numero voce computo>, "listino": <numero voce listino oppure null>}]}`;

async function matchBatch(listinoText, esempiText, entries) {
  const vociText = entries
    .map(({ index, voce }) => `${index} | ${truncate(voce.descrizione, 400)} | ${voce.unita || '-'}`)
    .join('\n');

  const esempi = esempiText
    ? `ESEMPI DI ABBINAMENTI CONFERMATI DALL'IMPRESA (descrizione computo -> voce listino):\n${esempiText}\n\n`
    : '';

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + process.env.OPENAI_API_KEY
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      temperature: 0,
      max_tokens: 4000,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        {
          role: 'user',
          content: `LISTINO (numero | voce | unità | categoria | note):\n${listinoText}\n\n${esempi}VOCI COMPUTO (numero | descrizione | unità):\n${vociText}`
        }
      ]
    })
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.error?.message || 'Errore API OpenAI');
  const parsed = JSON.parse(data.choices[0].message.content);
  return Array.isArray(parsed.abbinamenti) ? parsed.abbinamenti : [];
}

async function loadMemoria(userId) {
  const { data, error } = await supabaseAdmin
    .from('computo_memoria')
    .select('descrizione_norm, descrizione, voce')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })
    .limit(1000);
  if (error) {
    console.error('Memoria abbinamenti non disponibile:', error.message);
    return [];
  }
  return data || [];
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const token = (req.headers.authorization || '').replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Non autenticato' });
  const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);
  if (userError || !userData?.user) return res.status(401).json({ error: 'Sessione non valida' });

  const { voci, priceDB } = req.body || {};
  if (!Array.isArray(voci) || voci.length === 0) {
    return res.status(400).json({ error: 'Nessuna voce da abbinare' });
  }
  if (voci.length > MAX_VOCI) {
    return res.status(400).json({ error: `Il computo supera il limite di ${MAX_VOCI} voci` });
  }
  const listino = (Array.isArray(priceDB) ? priceDB : []).filter(p => p && p.voce);
  if (listino.length === 0) {
    return res.status(400).json({ error: 'Il database prezzi è vuoto' });
  }

  const listinoText = listino
    .map((p, i) => `${i} | ${truncate(p.voce, 200)} | ${p.unita || '-'} | ${p.categoria || '-'} | ${truncate(p.note, 120) || '-'}`)
    .join('\n');
  const listinoPerVoce = new Map(listino.map((p, i) => [String(p.voce).trim().toLowerCase(), i]));

  try {
    const memoria = (await loadMemoria(userData.user.id))
      .filter(m => listinoPerVoce.has(String(m.voce).trim().toLowerCase()));
    const memoriaPerDescrizione = new Map(memoria.map(m => [m.descrizione_norm, m]));

    const abbinamenti = new Map();
    const confermati = new Set();
    const daAbbinare = [];

    voci.forEach((voce, index) => {
      const ricordo = memoriaPerDescrizione.get(normalizeDescrizione(truncate(voce.descrizione, 300)));
      if (ricordo) {
        abbinamenti.set(index, listinoPerVoce.get(String(ricordo.voce).trim().toLowerCase()));
        confermati.add(index);
      } else {
        daAbbinare.push({ index, voce });
      }
    });

    const esempiText = memoria
      .slice(0, MAX_ESEMPI)
      .map(m => `- "${truncate(m.descrizione, 200)}" -> "${truncate(m.voce, 200)}"`)
      .join('\n');

    const batches = [];
    for (let start = 0; start < daAbbinare.length; start += BATCH_SIZE) {
      batches.push(daAbbinare.slice(start, start + BATCH_SIZE));
    }
    const indiciDaAbbinare = new Set(daAbbinare.map(e => e.index));
    const results = await Promise.all(batches.map(batch => matchBatch(listinoText, esempiText, batch)));

    results.flat().forEach(a => {
      if (a && indiciDaAbbinare.has(a.computo) && Number.isInteger(a.listino) && a.listino >= 0 && a.listino < listino.length) {
        abbinamenti.set(a.computo, a.listino);
      }
    });

    const items = voci.map((v, i) => {
      const quantita = Number(v.quantita) > 0 ? Number(v.quantita) : 1;
      const descrizioneComputo = truncate(v.descrizione, 300);
      const unitaComputo = normalizeUnit(v.unita);
      const prezzoListino = abbinamenti.has(i) ? listino[abbinamenti.get(i)] : null;
      const unitaListino = prezzoListino ? normalizeUnit(prezzoListino.unita) : '';
      const unitaCompatibili = confermati.has(i) || !unitaComputo || !unitaListino || unitaComputo === unitaListino;

      if (prezzoListino && unitaCompatibili) {
        const prezzo = Number(prezzoListino.prezzo) || 0;
        return {
          voce: prezzoListino.voce,
          categoria: prezzoListino.categoria || 'Listino',
          unita: prezzoListino.unita,
          quantita,
          prezzo,
          costoInterno: Number(prezzoListino.costoInterno) || 0,
          iva: prezzoListino.iva ?? 22,
          totale: quantita * prezzo,
          descrizioneComputo
        };
      }

      return {
        voce: truncate((v.codice ? v.codice + ' - ' : '') + v.descrizione, 200),
        categoria: 'Personalizzata',
        unita: unitaComputo || 'cad',
        quantita,
        prezzo: 0,
        costoInterno: 0,
        iva: 22,
        totale: 0,
        daPrezzare: true,
        descrizioneComputo
      };
    });

    return res.status(200).json({ items, daMemoria: confermati.size });
  } catch (error) {
    console.error('Errore matchComputo:', error);
    return res.status(500).json({ error: "Errore nell'abbinamento delle voci al listino" });
  }
}
