export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { instruction, currentItems, priceDB } = req.body;
  if (!instruction || !currentItems) {
    return res.status(400).json({ error: 'Dati mancanti' });
  }

  const vociAttuali = currentItems.map((item, i) => (i + 1) + '. ' + item.voce + ' - Quantita: ' + item.quantita + ' ' + item.unita + ' - Prezzo: ' + item.prezzo + ' euro').join('\n');
  const vociDisponibili = priceDB ? priceDB.map(p => p.voce + ' (' + p.unita + ')').join(', ') : '';

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
            content: 'Sei un esperto di edilizia. Il tuo compito è modificare un elenco di voci di un preventivo edile in base alle istruzioni vocali del cliente. Puoi: rimuovere voci, modificare quantità, aggiungere nuove voci (solo dal database disponibile). Rispondi SOLO con un JSON array contenente TUTTE le voci finali del preventivo (sia quelle modificate che quelle invariate). Ogni elemento deve avere: "voce" (nome esatto), "quantita" (numero), "azione" (una tra "invariato", "modificato", "rimosso", "aggiunto"). Le voci con azione "rimosso" NON devono essere incluse nel risultato finale. Mantieni le voci che non sono menzionate nelle istruzioni.'
          },
          {
            role: 'user',
            content: 'VOCI ATTUALI DEL PREVENTIVO:\n' + vociAttuali + '\n\nVOCI DISPONIBILI NEL DATABASE (per eventuali aggiunte):\n' + vociDisponibili + '\n\nISTRUZIONI DI MODIFICA: "' + instruction + '"\n\nApplica le modifiche e rispondi SOLO con il JSON array delle voci finali.'
          }
        ],
        temperature: 0.2,
        max_tokens: 3000
      })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error?.message || 'Errore API OpenAI');

    let resultText = data.choices[0].message.content.trim();
    if (resultText.startsWith('```')) {
      resultText = resultText.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
    }

    const modifiedItems = JSON.parse(resultText);

    const finalItems = modifiedItems
      .filter(item => item.azione !== 'rimosso')
      .map(item => {
        const dbItem = priceDB ? priceDB.find(p => p.voce === item.voce) : null;
        const existingItem = currentItems.find(ci => ci.voce === item.voce);
        const base = existingItem || dbItem || {};
        const qta = item.quantita || base.quantita || 1;
        return {
          ...base,
          voce: item.voce,
          quantita: qta,
          prezzo: base.prezzo || 0,
          totale: qta * (base.prezzo || 0),
          unita: base.unita || 'nr'
        };
      });

    return res.status(200).json({ items: finalItems });
  } catch (error) {
    console.error('Errore modifyQuote:', error);
    return res.status(500).json({ error: 'Errore nella modifica del preventivo' });
  }
}
