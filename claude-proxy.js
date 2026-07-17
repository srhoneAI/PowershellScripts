{\rtf1\ansi\ansicpg1252\cocoartf2822
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fswiss\fcharset0 Helvetica;}
{\colortbl;\red255\green255\blue255;}
{\*\expandedcolortbl;;}
\margl1440\margr1440\vieww11520\viewh8400\viewkind0
\pard\tx720\tx1440\tx2160\tx2880\tx3600\tx4320\tx5040\tx5760\tx6480\tx7200\tx7920\tx8640\pardirnatural\partightenfactor0

\f0\fs24 \cf0 const http = require('http');\
const https = require('https');\
const fs = require('fs');\
const path = require('path');\
\
const LOG_DIR = path.join(__dirname, 'claude-logs');\
if (!fs.existsSync(LOG_DIR)) fs.mkdirSync(LOG_DIR);\
\
const PORT = 8787;\
const UPSTREAM = 'api.anthropic.com';\
\
http.createServer((req, res) => \{\
  const chunks = [];\
  req.on('data', c => chunks.push(c));\
  req.on('end', () => \{\
    const body = Buffer.concat(chunks).toString('utf8');\
    const ts = new Date().toISOString().replace(/[:.]/g, '-');\
    const logPath = path.join(LOG_DIR, `$\{ts\}-$\{req.method\}-request.json`);\
\
    // Log the request - try to pretty-print JSON\
    try \{\
      const parsed = JSON.parse(body);\
      fs.writeFileSync(logPath, JSON.stringify(\{\
        method: req.method,\
        url: req.url,\
        headers: req.headers,\
        body: parsed\
      \}, null, 2));\
    \} catch \{\
      fs.writeFileSync(logPath, JSON.stringify(\{\
        method: req.method,\
        url: req.url,\
        headers: req.headers,\
        body\
      \}, null, 2));\
    \}\
\
    // Forward to real Anthropic API\
    const upstreamReq = https.request(\{\
      hostname: UPSTREAM,\
      port: 443,\
      path: req.url,\
      method: req.method,\
      headers: \{ ...req.headers, host: UPSTREAM \}\
    \}, upstreamRes => \{\
      res.writeHead(upstreamRes.statusCode, upstreamRes.headers);\
      upstreamRes.pipe(res);\
    \});\
\
    upstreamReq.on('error', err => \{\
      console.error('Upstream error:', err);\
      res.writeHead(502);\
      res.end(JSON.stringify(\{ error: err.message \}));\
    \});\
\
    upstreamReq.write(body);\
    upstreamReq.end();\
  \});\
\}).listen(PORT, () => \{\
  console.log(`Proxy listening on http://localhost:$\{PORT\}`);\
  console.log(`Logs going to: $\{LOG_DIR\}`);\
\});}