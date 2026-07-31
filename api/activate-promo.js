import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://tahstkmfjiktnvlkcxfw.supabase.co';

const PROMO_CODES = {
  PROVA14: 14,
  PROVA30: 30,
  TEST2026: 30,
  ANNO365GRATIS: 365,
};

const supabaseAdmin = createClient(SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const token = (req.headers.authorization || '').replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Non autenticato' });

  const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);
  if (userError || !userData?.user) {
    return res.status(401).json({ error: 'Sessione non valida' });
  }
  const userId = userData.user.id;

  const { promoCode } = req.body || {};

  let trialDays = 14;
  if (promoCode) {
    const days = PROMO_CODES[promoCode.toUpperCase()];
    if (!days) {
      return res.status(400).json({ error: 'Codice promo non valido' });
    }
    trialDays = days;
  }

  try {
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('subscription_status')
      .eq('id', userId)
      .single();
    if (profileError) throw profileError;

    if (profile && (profile.subscription_status === 'trialing' || profile.subscription_status === 'active')) {
      return res.status(400).json({ error: 'Hai già utilizzato un codice promozionale o hai un abbonamento attivo.' });
    }

    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({
        subscription_status: 'trialing',
        trial_end: new Date(Date.now() + trialDays * 86400000).toISOString(),
      })
      .eq('id', userId);
    if (updateError) throw updateError;

    return res.status(200).json({ success: true, trialDays });
  } catch (err) {
    console.error('Errore activate-promo:', err);
    return res.status(500).json({ error: err.message || 'Errore attivazione prova' });
  }
}
