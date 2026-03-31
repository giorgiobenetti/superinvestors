const express = require("express");
const fetch = require("node-fetch");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.static(path.join(__dirname, "public")));

const SEC_HEADERS = {
  "User-Agent": "SuperinvestorTracker research@example.com",
  "Accept-Encoding": "gzip, deflate",
  Accept: "application/json, text/html, text/xml, */*",
};

const DELAY_MS = 125;
let lastReq = 0;
async function rateLimitedFetch(url, method = "GET") {
  const now = Date.now();
  const wait = DELAY_MS - (now - lastReq);
  if (wait > 0) await new Promise((r) => setTimeout(r, wait));
  lastReq = Date.now();
  return fetch(url, { method, headers: SEC_HEADERS });
}

app.get("/api/test", async (req, res) => {
  try {
    const r = await fetch(
      "https://data.sec.gov/submissions/CIK0001067983.json",
      { headers: SEC_HEADERS },
    );
    const d = await r.json();
    res.json({ ok: true, name: d.name, status: r.status });
  } catch (e) {
    res.json({ ok: false, error: e.message });
  }
});

app.get("/api/sec", async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).json({ error: "Missing url param" });
  if (
    !url.startsWith("https://data.sec.gov/") &&
    !url.startsWith("https://www.sec.gov/")
  ) {
    return res.status(403).json({ error: "Only SEC URLs allowed" });
  }
  console.log(`→ ${url.replace("https://", "")}`);
  try {
    const secRes = await rateLimitedFetch(url);
    const contentType = secRes.headers.get("content-type") || "text/plain";
    res.set("Content-Type", contentType);
    const body = await secRes.buffer();
    res.status(secRes.status).send(body);
  } catch (e) {
    console.error("Error:", e.message);
    res.status(500).json({ error: e.message });
  }
});

app.head("/api/sec", async (req, res) => {
  const { url } = req.query;
  if (
    !url ||
    (!url.startsWith("https://data.sec.gov/") &&
      !url.startsWith("https://www.sec.gov/"))
  ) {
    return res.status(403).end();
  }
  try {
    const secRes = await rateLimitedFetch(url, "HEAD");
    res.status(secRes.status).end();
  } catch {
    res.status(500).end();
  }
});

app.listen(PORT, () => {
  console.log(`\n✅  SuperInvestors → http://localhost:${PORT}`);
  console.log(`    Test:         http://localhost:${PORT}/api/test\n`);
});
