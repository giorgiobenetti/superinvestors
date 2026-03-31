const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

const SEC_HEADERS = {
  'User-Agent': 'SuperinvestorTracker research@example.com',
  'Accept-Encoding': 'gzip, deflate',
  'Accept': 'application/json, text/html, text/xml, */*',
};

const DELAY_MS = 150;
let lastReq = 0;
async function rateLimitedFetch(url, method = 'GET') {
  const now = Date.now();
  const wait = DELAY_MS - (now - lastReq);
  if (wait > 0) await new Promise(r => setTimeout(r, wait));
  lastReq = Date.now();
  return fetch(url, { method, headers: SEC_HEADERS });
}

app.get('/api/sec', async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).json({ error: 'Missing url' });
  if (!url.startsWith('https://data.sec.gov/') && !url.startsWith('https://www.sec.gov/')) {
    return res.status(403).json({ error: 'Only SEC URLs allowed' });
  }
  console.log('SEC ->', url.replace('https://','').substring(0, 80));
  try {
    const r = await rateLimitedFetch(url);
    const ct = r.headers.get('content-type') || 'text/plain';
    res.set('Content-Type', ct);
    const body = await r.buffer();
    res.status(r.status).send(body);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.head('/api/sec', async (req, res) => {
  const { url } = req.query;
  if (!url || (!url.startsWith('https://data.sec.gov/') && !url.startsWith('https://www.sec.gov/'))) {
    return res.status(403).end();
  }
  try {
    const r = await rateLimitedFetch(url, 'HEAD');
    res.status(r.status).end();
  } catch { res.status(500).end(); }
});

app.get('/api/logo', async (req, res) => {
  const { domain } = req.query;
  if (!domain) return res.status(400).end();
  try {
    const r = await fetch(`https://logo.clearbit.com/${domain}`);
    if (!r.ok) return res.status(404).end();
    const ct = r.headers.get('content-type') || 'image/png';
    res.set('Content-Type', ct);
    res.set('Cache-Control', 'public, max-age=86400');
    const buf = await r.buffer();
    res.send(buf);
  } catch { res.status(404).end(); }
});

app.get('/api/test', async (req, res) => {
  try {
    const r = await fetch('https://data.sec.gov/submissions/CIK0001067983.json', { headers: SEC_HEADERS });
    const d = await r.json();
    res.json({ ok: true, name: d.name });
  } catch (e) {
    res.json({ ok: false, error: e.message });
  }
});

app.listen(PORT, () => {
  console.log(`\n✅ SuperInvestors -> http://localhost:${PORT}\n`);
});
