export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { descrizione } = req.body;
  
  if (!descrizione || !descrizione.trim()) {
    return res.status(400).json({ error: 'Descrizione mancante' });
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `Sei un assistente specializzato nella redazione di preventivi edili professionali in italiano.
Il tuo compito e' riformulare descrizioni di lavori edili in modo professionale, chiaro e completo.

REGOLE:
- Mantieni TUTTI i dettagli tecnici, le misure e le quantita' presenti nel testo originale
- Usa terminologia tecnica edile corretta
- Scrivi in modo professionale ma comprensibile
- Non aggiungere lavori o dettagli non menzionati nel testo originale
- Struttura il testo in modo ordinato
- Usa frasi complete e ben costruite
- Non usare elenchi puntati, scrivi in forma discorsiva
- Mantieni il testo conciso e adatto a un preventivo
- Rispondi SOLO con il testo riformulato, senza commenti o spiegazioni aggiuntive`
          },
          {
            role: 'user',
            content: `Riformula questa descrizione di lavori edili in modo professionale per un preventivo:\n\n${descrizione.trim()}`
          }
        ],
        temperature: 0.3,
        max_tokens: 1000
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error?.message || 'Errore API OpenAI');
    }

    const result = data.choices[0].message.content.trim();
    return res.status(200).json({ result });
  } catch (error) {
    console.error('Errore reformulate:', error);
    return res.status(500).json({ error: 'Errore nella riformulazione' });
  }
}
