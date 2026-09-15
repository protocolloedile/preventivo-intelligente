import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://tahstkmfjiktnvlkcxfw.supabase.co';
const supabaseAdmin = createClient(SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const MAX_IMAGES = 6;

const SYSTEM_PROMPT = `Sei un tecnico esperto di computi metrici estimativi dell'edilizia italiana.
Ricevi le pagine (immagini) di un computo metrico. Estrai TUTTE le voci di lavorazione, nell'ordine in cui compaiono.

Per ogni voce restituisci:
- "codice": codice articolo se presente (es. "A.01.002"), altrimenti ""
- "descrizione": descrizione della lavorazione, completa ma senza le righe di misurazione
- "unita": unità di misura normalizzata tra: mq, ml, mc, kg, cad, h, corpo
- "quantita": quantità TOTALE della voce come numero (usa il valore finale "Sommano"/"Totale"/"Quantità", non le singole righe di misura parziali)

Regole:
- Ignora completamente prezzi unitari, importi, totali in euro, subtotali di capitolo, intestazioni, piè di pagina e riepiloghi.
- "a corpo"/"a.c." diventa "corpo"; "n", "nr", "n.", "cadauno" diventano "cad"; "m" lineari diventa "ml"; "m2"/"m²" diventa "mq"; "m3"/"m³" diventa "mc"; "ore" diventa "h".
- I numeri in formato italiano (1.234,56) vanno convertiti in numero (1234.56).
- Se la quantità non è leggibile usa 1.
- Se una pagina non contiene voci di lavorazione, non inventarne.
- In "oggetto" metti il titolo dei lavori se indicato nel computo (es. "Ristrutturazione appartamento via Roma"), altrimenti "".

Rispondi SOLO con JSON: {"oggetto": "...", "voci": [{"codice": "", "descrizione": "", "unita": "", "quantita": 0}]}`;

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

  const { images } = req.body || {};
  if (!Array.isArray(images) || images.length === 0) {
    return res.status(400).json({ error: 'Nessuna pagina ricevuta' });
  }
  if (images.length > MAX_IMAGES) {
    return res.status(400).json({ error: 'Troppe pagine in una sola richiesta' });
  }
  if (images.some(img => typeof img !== 'string' || !img.startsWith('data:image/'))) {
    return res.status(400).json({ error: 'Formato pagina non valido' });
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + process.env.OPENAI_API_KEY
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        temperature: 0,
        max_tokens: 8000,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          {
            role: 'user',
            content: [
              { type: 'text', text: 'Estrai le voci da queste pagine del computo metrico.' },
              ...images.map(url => ({ type: 'image_url', image_url: { url, detail: 'high' } }))
            ]
          }
        ]
      })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error?.message || 'Errore API OpenAI');
    if (data.choices[0].finish_reason === 'length') throw new Error('Risposta troncata: troppe voci per una sola lettura');

    const parsed = JSON.parse(data.choices[0].message.content);
    const voci = (Array.isArray(parsed.voci) ? parsed.voci : [])
      .filter(v => v && typeof v.descrizione === 'string' && v.descrizione.trim())
      .map(v => ({
        codice: String(v.codice || '').trim(),
        descrizione: v.descrizione.trim(),
        unita: String(v.unita || '').trim().toLowerCase(),
        quantita: Number(v.quantita) > 0 ? Number(v.quantita) : 1
      }));

    return res.status(200).json({
      oggetto: typeof parsed.oggetto === 'string' ? parsed.oggetto.trim() : '',
      voci
    });
  } catch (error) {
    console.error('Errore extractComputo:', error);
    return res.status(500).json({ error: 'Errore nella lettura del computo' });
  }
}
