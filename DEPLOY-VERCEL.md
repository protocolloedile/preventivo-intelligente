# Deploy su Vercel — Preventivo Intelligente

## Opzione 1: Deploy diretto (più veloce)

1. Vai su https://vercel.com e accedi con GitHub (o crea un account gratuito)
2. Vai su https://vercel.com/new
3. Clicca "Upload" (in basso) e trascina la cartella `preventivo-app`
4. Vercel rileva automaticamente che è un progetto Vite + React
5. Clicca "Deploy" — in 1-2 minuti il sito è online!
6. Riceverai un URL tipo: `preventivo-intelligente-xxx.vercel.app`

## Opzione 2: Deploy via GitHub (consigliato per aggiornamenti futuri)

### Passo 1: Carica su GitHub
1. Vai su https://github.com/new
2. Crea un repository (es. "preventivo-intelligente"), lascia tutto di default
3. Apri il terminale nella cartella `preventivo-app` e scrivi:

```bash
git init
git add .
git commit -m "Initial commit - Preventivo Intelligente"
git branch -M main
git remote add origin https://github.com/TUO-USERNAME/preventivo-intelligente.git
git push -u origin main
```

### Passo 2: Collega a Vercel
1. Vai su https://vercel.com/new
2. Seleziona "Import Git Repository"
3. Scegli il repo "preventivo-intelligente"
4. Le impostazioni vengono rilevate automaticamente (Framework: Vite)
5. Clicca "Deploy"

### Passo 3: Dominio personalizzato (opzionale)
1. Vai nelle impostazioni del progetto su Vercel
2. Sezione "Domains"
3. Aggiungi il tuo dominio (es. preventivi.protocolloedile.it)
4. Segui le istruzioni per configurare il DNS

## Test in locale (opzionale)

```bash
cd preventivo-app
npm install
npm run dev
```

Apri http://localhost:5173 nel browser.

## Aggiornamenti futuri

Se hai usato GitHub (Opzione 2), ogni volta che fai un push:
```bash
git add .
git commit -m "Descrizione modifica"
git push
```
Vercel ri-deploya automaticamente in 1-2 minuti!
