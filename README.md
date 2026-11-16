# URL Shortener (Node.js)

A simple URL shortener built with Node.js and Express. Shorten links from the
web UI or the API, use optional custom codes, and check click counts.

## Features

- Shorten any `http(s)` URL, with optional custom codes
- Click tracking and a stats endpoint
- Minimal web UI included
- Zero database — links live in memory

## How to run

```bash
npm install
npm start
# open http://localhost:3000
```

## API

```bash
# Shorten a link
curl -X POST http://localhost:3000/api/shorten \
  -H 'Content-Type: application/json' \
  -d '{"url": "https://example.com", "custom": "demo"}'

# Stats for a code
curl http://localhost:3000/api/stats/demo

# Redirect
curl -L http://localhost:3000/demo
```

## Honest note

Links are stored in memory only — restarting the server wipes them. For
production use, swap the `Map` for a database.

Built by @khuzaima.tech
