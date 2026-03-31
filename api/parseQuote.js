export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { transcript, priceDB } = req.body;
  if (!transcript || !priceDB || !priceDB.length) {
    return res.status(400).json({ error: 'Dati mancanti' });
  }

  const vociDisponibili = priceDB.map(p => p.voce + ' (' + p.unita + ')').join(', ');

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + process.env.OPENAI_API_KEY
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'Sei un esperto di edilizia e ristrutturazioni in Italia. Il tuo compito è analizzare la descrizione vocale di un lavoro edile e selezionare le voci di costo appropriate dal database prezzi del cliente. Rispondi SOLO con un JSON array. Ogni elemento deve avere: "voce" (il nome esatto dal database), "quantita" (numero stimato in base alla descrizione). Se la descrizione menziona metrature, usale per calcolare le quantità. Se non sono specificate, usa stime ragionevoli per un intervento standard. Seleziona SOLO voci che esistono nel database fornito. Non inventare voci nuove.'
          },
          {
            role: 'user',
            content: 'Descrizione lavoro: "' + transcript + '"\n\nVoci disponibili nel database: ' + vociDisponibili + '\n\nSeleziona le voci appropriate e stima le quantità. Rispondi SOLO con il JSON array, senza altro testo.'
          }
        ],
        temperature: 0.3,
        max_tokens: 2000
      })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error?.message || 'Errore API OpenAI');

    let resultText = data.choices[0].message.content.trim();
    if (resultText.startsWith('```')) {
      resultText = resultText.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
    }

    const selectedItems = JSON.parse(resultText);

    const matchedItems = selectedItems.map(sel => {
      const dbItem = priceDB.find(p => p.voce === sel.voce);
      if (!dbItem) return null;
      const qta = sel.quantita || 1;
      return {
        ...dbItem,
        quantita: qta,
        totale: qta * dbItem.prezzo
      };
    }).filter(Boolean);

    return res.status(200).json({ items: matchedItems });
  } catch (error) {
    console.error('Errore parseQuote:', error);
    return res.status(500).json({ error: 'Errore nella selezione materiali' });
  }
}
