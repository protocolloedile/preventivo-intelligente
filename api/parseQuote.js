export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { transcript, priceDB, pastQuotes } = req.body;
  if (!transcript || !priceDB || !priceDB.length) {
    return res.status(400).json({ error: 'Dati mancanti' });
  }

  const vociDisponibili = priceDB.map(p => p.voce + ' (' + p.unita + ')').join(', ');

  // Build past quotes context for AI learning
  let pastQuotesContext = '';
  if (pastQuotes && pastQuotes.length > 0) {
    const examples = pastQuotes.slice(0, 5).map((q, i) => {
      const itemsList = (q.items || [])
        .filter(item => !item._meta)
        .map(item => '  - ' + item.voce + ' (qta: ' + item.quantita + ', unita: ' + item.unita + ')')
        .join('\n');
      return 'Preventivo ' + (i + 1) + ':\nDescrizione: "' + (q.descrizione || '').substring(0, 200) + '"\nVoci selezionate:\n' + itemsList;
    }).join('\n\n');
    
    pastQuotesContext = '\n\nECCO ALCUNI PREVENTIVI GIA\' COMPLETATI DA QUESTO UTENTE. Usa questi come riferimento per capire il suo stile, quali voci seleziona tipicamente e come stima le quantita\'. Cerca di essere coerente con le sue scelte precedenti:\n\n' + examples + '\n\n';
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
            content: 'Sei un esperto di edilizia e ristrutturazioni in Italia. Il tuo compito e\' analizzare la descrizione vocale di un lavoro edile e selezionare le voci di costo appropriate dal database prezzi del cliente. Rispondi SOLO con un JSON array. Ogni elemento deve avere: "voce" (il nome ESATTO e IDENTICO copiato dal database, senza modifiche), "quantita" (numero stimato in base alla descrizione).' + pastQuotesContext
          },
          {
            role: 'user',
            content: 'Descrizione lavoro: "' + transcript + '"\n\nVoci disponibili nel database: ' + vociDisponibili + '\n\nSeleziona le voci appropriate e stima le quantita\' . Rispondi SOLO con il JSON array, senza altro testo.'
          }
        ],
        temperature: 0.3,
        max_tokens: 2000
      })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error?.message || 'Errore API OpenAI');

    let resultText = data.choices[0].message.content.trim();
    if (resultText.startsWith('\`\`\`')) {
      resultText = resultText.replace(/^\`\`\`(?:json)?\n?/, '').replace(/\n?\`\`\`$/, '');
    }

    const selectedItems = JSON.parse(resultText);

    // Fuzzy matching: try exact, then case-insensitive, then includes
    function findBestMatch(selVoce, db) {
      const selNorm = selVoce.toLowerCase().trim();
      // 1. Exact match
      let match = db.find(p => p.voce === selVoce);
      if (match) return match;
      // 2. Case-insensitive trimmed match
      match = db.find(p => p.voce.toLowerCase().trim() === selNorm);
      if (match) return match;
      // 3. One contains the other
      match = db.find(p => {
        const pNorm = p.voce.toLowerCase().trim();
        return pNorm.includes(selNorm) || selNorm.includes(pNorm);
      });
      if (match) return match;
      // 4. Word overlap scoring
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

    const matchedItems = selectedItems.map(sel => {
      const dbItem = findBestMatch(sel.voce, priceDB);
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
