import { createClient } from '@supabase/supabase-js';
import { gunzipSync } from 'zlib';

const SUPABASE_URL = 'https://tahstkmfjiktnvlkcxfw.supabase.co';
const supabaseAdmin = createClient(SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

// Solo questi account possono aggiornare i prezzari: sono dati condivisi da tutti gli utenti.
const ADMIN_EMAILS = ['protocolloedile@gmail.com', 'andreawii.ai@gmail.com'];

// Regione -> cartella dei dati in /public/prezzari
const CARTELLE = { Lombardia: 'lombardia-2026' };

const BATCH = 500;

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
  if (!ADMIN_EMAILS.includes((userData.user.email || '').toLowerCase())) {
    return res.status(403).json({ error: 'Solo l\'amministratore puo\' aggiornare i prezzari' });
  }

  try {
    const { regione, parte } = req.body || {};
    const cartella = CARTELLE[regione];
    if (!cartella) return res.status(400).json({ error: 'Regione non disponibile' });

    const base = 'https://' + req.headers.host + '/prezzari/' + cartella + '/';
    const indice = await fetch(base + 'indice.json').then(r => r.json());

    // Senza "parte" restituisce solo le informazioni sul prezzario da importare.
    if (!parte) return res.status(200).json({ indice });

    const buf = await fetch(base + 'parte-' + String(parte).padStart(2, '0') + '.json.gz')
      .then(r => r.arrayBuffer());
    const voci = JSON.parse(gunzipSync(Buffer.from(buf)).toString('utf8'));

    const righe = voci.map(v => ({
      regione: indice.regione,
      edizione: indice.edizione,
      codice: v.codice,
      tipologia: v.tipologia,
      capitolo: v.capitolo,
      descrizione: v.descrizione,
      unita: v.unita,
      prezzo: v.prezzo,
    }));

    for (let i = 0; i < righe.length; i += BATCH) {
      const { error } = await supabaseAdmin
        .from('prezzari_regionali')
        .upsert(righe.slice(i, i + BATCH), { onConflict: 'regione,edizione,codice' });
      if (error) throw new Error(error.message);
    }

    // Ultima parte: elimina le edizioni precedenti e aggiorna la data mostrata nell'app.
    if (Number(parte) >= Number(indice.parti)) {
      await supabaseAdmin.from('prezzari_regionali')
        .delete().eq('regione', indice.regione).neq('edizione', indice.edizione);
      const { count } = await supabaseAdmin.from('prezzari_regionali')
        .select('id', { count: 'exact', head: true })
        .eq('regione', indice.regione).eq('edizione', indice.edizione);
      const { error } = await supabaseAdmin.from('prezzari_versioni').upsert({
        regione: indice.regione,
        edizione: indice.edizione,
        fonte: indice.fonte,
        voci: count || righe.length,
        aggiornato_il: new Date().toISOString(),
      }, { onConflict: 'regione' });
      if (error) throw new Error(error.message);
      return res.status(200).json({ parte: Number(parte), parti: indice.parti, importate: righe.length, completato: true, voci: count });
    }

    res.status(200).json({ parte: Number(parte), parti: indice.parti, importate: righe.length, completato: false });
  } catch (err) {
    console.error('Import prezzario:', err);
    res.status(500).json({ error: err.message });
  }
}
