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

  // Fuzzy matching helper
  function findBestMatch(selVoce, db) {
    if (!db || !db.length) return null;
    const selNorm = selVoce.toLowerCase().trim();
    let match = db.find(p => p.voce === selVoce);
    if (match) return match;
    match = db.find(p => p.voce.toLowerCase().trim() === selNorm);
    if (match) return match;
    match = db.find(p => {
      const pNorm = p.voce.toLowerCase().trim();
      return pNorm.includes(selNorm) || selNorm.includes(pNorm);
    });
    if (match) return match;
    const selWords = selNorm.split(/\s+/);
    let bestScore = 0;
    let bestMatch = null;
    for (const p of db) {
      const pWords = p.voce.toLowerCase().trim().split(/\s+/);
      const common = selWords.filter(w => pWords.some(pw => pw.includes(w) || w.includes(pw)));
      const score = common.length / Math.max(selWords.length, pWords.length);
      if (score > bestScore && score >= 0.5) {
        bestScore = score;
        bestMatch = p;
      }
    }
    return bestMatch;
  }

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
            content: 'Sei un esperto di edilizia. Il tuo compito è modificare un elenco di voci di un preventivo edile in base alle istruzioni vocali del cliente. Puoi: rimuovere voci, modificare quantità, aggiungere nuove voci (solo dal database disponibile). Rispondi SOLO con un JSON array contenente TUTTE le voci finali del preventivo (sia quelle modificate che quelle invariate). Ogni elemento deve avere: "voce" (il nome ESATTO e IDENTICO copiato dal database o dalle voci attuali, senza modifiche), "quantita" (numero), "azione" (una tra "invariato", "modificato", "rimosso", "aggiunto"). Le voci con azione "rimosso" NON devono essere incluse nel risultato finale. Mantieni le voci che non sono menzionate nelle istruzioni. IMPORTANTE: il campo "voce" deve essere copiato ESATTAMENTE come appare nel database o nelle voci attuali, carattere per carattere.'
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
        const dbItem = findBestMatch(item.voce, priceDB);
        const existingItem = findBestMatch(item.voce, currentItems);
        const base = existingItem || dbItem || {};
        const qta = item.quantita || base.quantita || 1;
        return {
          ...base,
          voce: base.voce || item.voce,
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
