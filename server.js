// url-shortener-node — a tiny in-memory URL shortener with Express.
// Data lives in memory only: restarting the server clears all links.

const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const links = new Map(); // code -> { url, clicks, createdAt }

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

function randomCode(length = 6) {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < length; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

function isValidUrl(value) {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

// Create a short link: POST /api/shorten { "url": "https://example.com" }
app.post("/api/shorten", (req, res) => {
  const { url, custom } = req.body || {};
  if (!url || !isValidUrl(url)) {
    return res.status(400).json({ error: "Provide a valid http(s) URL." });
  }
  let code = (custom || "").trim();
  if (code) {
    if (!/^[A-Za-z0-9_-]{3,30}$/.test(code)) {
      return res.status(400).json({ error: "Custom code must be 3-30 letters, digits, - or _." });
    }
    if (links.has(code)) {
      return res.status(409).json({ error: "That code is already taken." });
    }
  } else {
    do {
      code = randomCode();
    } while (links.has(code));
  }
  links.set(code, { url, clicks: 0, createdAt: new Date().toISOString() });
  const shortUrl = `${req.protocol}://${req.get("host")}/${code}`;
  res.status(201).json({ code, shortUrl, url });
});

// Stats: GET /api/stats/:code
app.get("/api/stats/:code", (req, res) => {
  const link = links.get(req.params.code);
  if (!link) return res.status(404).json({ error: "Unknown code." });
  res.json({ code: req.params.code, ...link });
});

// Redirect: GET /:code
app.get("/:code", (req, res) => {
  const link = links.get(req.params.code);
  if (!link) return res.status(404).send("Short link not found.");
  link.clicks += 1;
  res.redirect(link.url);
});

app.listen(PORT, () => {
  console.log(`URL shortener running at http://localhost:${PORT}`);
});
