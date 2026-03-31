# SuperInvestors 13F Tracker

Tracker dei movimenti dei superinvestor basato sui filing **SEC EDGAR 13F-HR**.  
Dati 100% pubblici e gratuiti — nessuna API key necessaria.

## Setup (5 minuti)

### Requisiti
- [Node.js](https://nodejs.org/) v16 o superiore

### Avvio

```bash
# 1. Entra nella cartella
cd superinvestors

# 2. Installa le dipendenze (solo la prima volta)
npm install

# 3. Avvia il server
npm start

# 4. Apri il browser
# → http://localhost:3000
```

## Come funziona

Il server Express fa da **proxy locale** verso le API pubbliche della SEC:

- `data.sec.gov/submissions/{CIK}.json` — storico filing per investitore
- `www.sec.gov/Archives/edgar/data/...` — XML del 13F-HR con i holdings

Il browser non può chiamare direttamente `sec.gov` per via del CORS,  
quindi il proxy locale risolve questo problema senza bisogno di API key esterne.

## Investitori inclusi

| Investitore | Fund | Stile |
|---|---|---|
| Warren Buffett | Berkshire Hathaway | Value |
| Bill Ackman | Pershing Square | Activist |
| Michael Burry | Scion Asset Mgmt | Contrarian |
| George Soros | Soros Fund Mgmt | Macro |
| Stanley Druckenmiller | Duquesne Family Office | Macro |
| Seth Klarman | Baupost Group | Value |
| David Einhorn | Greenlight Capital | Value/Short |
| Ken Griffin | Citadel Advisors | Quant |
| David Tepper | Appaloosa Mgmt | Macro/Value |
| Steve Cohen | Point72 Asset Mgmt | Multi-Strategy |
| Ray Dalio | Bridgewater Associates | Macro |
| Carl Icahn | Icahn Capital Mgmt | Activist |
| Israel Englander | Millennium Management | Multi-Strategy |
| John Paulson | Paulson & Co. | Event-Driven |
| Dan Loeb | Third Point | Activist |
| Jeff Yass | Susquehanna Int'l | Quant |
| Chase Coleman | Tiger Global Mgmt | Growth/Tech |
| Philippe Laffont | Coatue Management | Tech/Growth |

## Note sui dati

- I 13F vengono depositati **45 giorni dopo** la fine del quarter (limite SEC)
- I dati mostrano solo posizioni long su titoli USA quotati (no short, no derivati)
- Alcuni manager con molte posizioni (Citadel, Millennium) possono impiegare più tempo a caricare
