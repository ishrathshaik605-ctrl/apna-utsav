/**
 * server.js - Apna Utsav Backend Proxy & Static Server
 * Zero external dependencies: uses built-in Node.js HTTP/HTTPS/Crypto/FS
 * Features:
 * - Serves static files with strict MIME types & Security Headers (CSP, X-Content-Type-Options)
 * - Proxies requests to Gemini API securely with environment variables
 * - Rate limiting (in-memory sliding window)
 * - Input validation & prompt-injection sanitization
 * - Fallback deterministic mock generator if no GEMINI_API_KEY is configured
 */

import http from 'node:http';
import https from 'node:https';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Simple .env parser without external packages
function loadEnv() {
  const envPath = path.join(__dirname, '.env');
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf-8').split('\n');
    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line || line.startsWith('#')) continue;
      const eqIdx = line.indexOf('=');
      if (eqIdx !== -1) {
        const key = line.slice(0, eqIdx).trim();
        let val = line.slice(eqIdx + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  }
}
loadEnv();

const PORT = parseInt(process.env.PORT || '3000', 10);
const HOST = process.env.HOST || '0.0.0.0';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

// Rate Limiter: max 30 requests per minute per IP
const rateLimitMap = new Map();
function isRateLimited(ip) {
  const now = Date.now();
  const windowMs = 60 * 1000;
  const maxReqs = 30;

  if (!rateLimitMap.has(ip)) {
    rateLimitMap.set(ip, [now]);
    return false;
  }
  const timestamps = rateLimitMap.get(ip).filter(ts => now - ts < windowMs);
  timestamps.push(now);
  rateLimitMap.set(ip, timestamps);
  return timestamps.length > maxReqs;
}

// Clean up stale rate limit entries periodically
const cleanupTimer = setInterval(() => {
  const now = Date.now();
  for (const [ip, timestamps] of rateLimitMap.entries()) {
    const fresh = timestamps.filter(ts => now - ts < 60000);
    if (fresh.length === 0) rateLimitMap.delete(ip);
    else rateLimitMap.set(ip, fresh);
  }
}, 60000);
if (cleanupTimer.unref) cleanupTimer.unref();

// MIME types for static server
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
  '.ttf': 'font/ttf',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.webmanifest': 'application/manifest+json'
};

// System prompt loader
let systemPrompt = '';
try {
  systemPrompt = fs.readFileSync(path.join(__dirname, 'prompts', 'system.txt'), 'utf-8');
} catch {
  systemPrompt = 'You are Apna Utsav, a warm, practical, culturally aware celebration and event planner for India.';
}

// JSON Schema loader
let responseSchemaObj = null;
try {
  responseSchemaObj = JSON.parse(fs.readFileSync(path.join(__dirname, 'schema', 'response.json'), 'utf-8'));
} catch (e) {
  console.warn('Could not parse schema/response.json:', e.message);
}

// Sanitization & injection hygiene
function sanitizePromptInput(input) {
  if (typeof input !== 'string') return '';
  // Truncate to 2000 chars as per specs
  let sanitized = input.slice(0, 2000);
  // Neutralize common prompt injection delimiters
  sanitized = sanitized.replace(/<\/?(system|rules|instruction|prompt)[^>]*>/gi, '');
  return sanitized.trim();
}

/**
 * Deterministic fallback generator when Gemini API Key is missing or rate-limited.
 * Ensures the app is 100% testable and runnable offline out of the box!
 */
function generateFallbackResponse(userPrompt, planContext) {
  const lang = planContext?.language || 'en';
  const type = planContext?.type || 'wedding';
  const budget = planContext?.totalBudget || 100000;
  const guestCount = planContext?.guestCount || 100;
  const city = planContext?.city || 'Hyderabad';

  const isHindi = lang === 'hi';
  const isTelugu = lang === 'te';
  const isTamil = lang === 'ta';
  const isKannada = lang === 'kn';

  let msg = `Here is your customized celebration plan for ${type} in ${city} for ${guestCount} guests!`;
  if (isHindi) msg = `${city} में ${guestCount} मेहमानों के लिए आपके ${type} की पूरी योजना तैयार है!`;
  if (isTelugu) msg = `${city} లో ${guestCount} మంది అతిథుల కోసం మీ ${type} ప్రణాళిక సిద్ధంగా ఉంది!`;
  if (isTamil) msg = `${city} இல் ${guestCount} விருந்தினர்களுக்கான உங்கள் ${type} திட்டம் இதோ!`;
  if (isKannada) msg = `${city} ನಲ್ಲಿ ${guestCount} ಅತಿಥಿಗಳಿಗಾಗಿ ನಿಮ್ಮ ${type} ಯೋಜನೆಯ ವಿವರಗಳು ಇಲ್ಲಿವೆ!`;

  let categories = [];
  if (type === 'wedding') {
    categories = [
      { name: 'Venue & Accommodation', percent: 28, reason: 'Covers mandap, rooms for family & guests' },
      { name: 'Catering & Dining', percent: 27, reason: 'Multi-course regional feasts & live counters' },
      { name: 'Decor & Florals', percent: 14, reason: 'Traditional marigold, jasmine & stage lighting' },
      { name: 'Photography & Cinema', percent: 10, reason: 'Candid photo, traditional video & drone coverage' },
      { name: 'Bridal & Groom Attire', percent: 8, reason: 'Outfits, jewelry rental, makeup & mehendi' },
      { name: 'Invitations & Gifts', percent: 3, reason: 'Eco-friendly invites & thoughtful return hampers' },
      { name: 'Contingency Reserve', percent: 10, reason: 'Mandatory 10% safety cushion for unexpected surge' }
    ];
  } else if (type === 'birthday') {
    categories = [
      { name: 'Venue / Hall Booking', percent: 22, reason: 'Indoor banqueting or party lawn' },
      { name: 'Food, Cake & Drinks', percent: 35, reason: 'Custom themed cake, snacks & main buffet' },
      { name: 'Themed Decor & Balloons', percent: 18, reason: 'Backdrop, balloon arch, welcome banner' },
      { name: 'Entertainment & Games', percent: 10, reason: 'Game host, emcee, magic show or mascot' },
      { name: 'Return Gifts & Favors', percent: 7, reason: 'Curated goodie bags for kids' },
      { name: 'Contingency Reserve', percent: 8, reason: '8% reserve for sudden guest arrivals or extras' }
    ];
  } else {
    categories = [
      { name: 'Pandal / Venue & Stage', percent: 32, reason: 'Main stage, sound setup and seating' },
      { name: 'Prasadam & Community Food', percent: 30, reason: 'Community feast/annadanam or high tea' },
      { name: 'Puja Samagri & Idol/Items', percent: 12, reason: 'Priest honorarium, flowers, sacred items' },
      { name: 'Sound, Lights & GenSet', percent: 12, reason: 'Sound permits, backup generator, lighting' },
      { name: 'Printing, Banners & Ops', percent: 5, reason: 'Flex banners, badges, waste management' },
      { name: 'Contingency Reserve', percent: 9, reason: 'Safety buffer for weather or electrical adjustments' }
    ];
  }

  // Tasks
  const tasks = [
    { title: 'Lock & book event venue', dueOffsetDays: -60, category: 'Venue', priority: 'high' },
    { title: 'Finalize menu tasting & food caterer', dueOffsetDays: -45, category: 'Catering', priority: 'high' },
    { title: 'Confirm photographer & video deliverables', dueOffsetDays: -30, category: 'Photography', priority: 'medium' },
    { title: 'Finalize theme mood board & floral decor', dueOffsetDays: -20, category: 'Decor', priority: 'medium' },
    { title: 'Send digital/printed invitations with RSVP link', dueOffsetDays: -15, category: 'Invitations', priority: 'high' },
    { title: 'Final count check with caterer & seating chart', dueOffsetDays: -3, category: 'Catering', priority: 'high' },
    { title: 'Run-of-show schedule briefing with emcee & family', dueOffsetDays: -1, category: 'General', priority: 'high' }
  ];

  // Ideas
  const ideas = [
    { title: 'Live Regional Chai & Jalebi Counter', description: 'Interactive kulhad chai and hot jalebi station loved by all age groups.', estCostLevel: 'low' },
    { title: 'Eco-Friendly Seed Paper Invites', description: 'Plantable invitations embedded with marigold and basil seeds.', estCostLevel: 'low' },
    { title: 'Personalized Family Memory Wall', description: 'Fairy lights and polaroid clips celebrating the family journey.', estCostLevel: 'low' },
    { title: 'Brass Urli & Floating Jasmine Welcome Decor', description: 'Traditional fragrance and aesthetic greeting right at the entrance gate.', estCostLevel: 'medium' }
  ];

  return {
    message: msg,
    assumptions: [
      `Assumed guest count of ${guestCount} in ${city}`,
      'Preserved standard contingency reserve of 8-10%',
      'Catering quotes tailored for standard multi-course regional menu'
    ],
    actions: [
      { type: 'SET_BUDGET_SPLIT', payload: { categories } },
      { type: 'ADD_TASKS', payload: { tasks } },
      { type: 'ADD_IDEAS', payload: { ideas } }
    ],
    warnings: [
      budget < 20000 && type === 'wedding' ? 'Budget is very tight for a wedding; focus on home or community hall celebration.' : null
    ].filter(Boolean)
  };
}

/**
 * Call Gemini REST API via native Node HTTPS
 */
async function callGemini(userMessage, planContext) {
  if (!GEMINI_API_KEY) {
    // Graceful deterministic fallback
    return generateFallbackResponse(userMessage, planContext);
  }

  const promptText = `
Context of the current plan:
${JSON.stringify(planContext, null, 2)}

User request:
${userMessage}

Ensure the response strictly complies with the system prompt rules and returns valid JSON matching the schema.
`;

  const requestBody = JSON.stringify({
    contents: [
      {
        role: 'user',
        parts: [{ text: systemPrompt + '\n\n' + promptText }]
      }
    ],
    generationConfig: {
      temperature: 0.3,
      responseMimeType: 'application/json'
    }
  });

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

  return new Promise((resolve, reject) => {
    const req = https.request(
      url,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(requestBody)
        },
        timeout: 15000
      },
      res => {
        let data = '';
        res.on('data', chunk => { data += chunk; });
        res.on('end', () => {
          if (res.statusCode < 200 || res.statusCode >= 300) {
            console.error('Gemini API Error Response:', data);
            // Fall back gracefully rather than crashing
            return resolve(generateFallbackResponse(userMessage, planContext));
          }
          try {
            const parsed = JSON.parse(data);
            const rawText = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
            if (!rawText) {
              return resolve(generateFallbackResponse(userMessage, planContext));
            }
            const structured = JSON.parse(rawText);
            resolve(structured);
          } catch (e) {
            console.error('Error parsing Gemini output:', e.message);
            resolve(generateFallbackResponse(userMessage, planContext));
          }
        });
      }
    );

    req.on('timeout', () => {
      req.destroy();
      console.warn('Gemini API timed out after 15s. Using deterministic fallback.');
      resolve(generateFallbackResponse(userMessage, planContext));
    });

    req.on('error', err => {
      console.error('Gemini API Network Error:', err.message);
      resolve(generateFallbackResponse(userMessage, planContext));
    });

    req.write(requestBody);
    req.end();
  });
}

// HTTP Server
const server = http.createServer(async (req, res) => {
  const ip = req.socket.remoteAddress || '127.0.0.1';

  // Apply Security Headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self';"
  );

  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = parsedUrl.pathname;

  // API endpoint: /api/chat
  if (req.method === 'POST' && pathname === '/api/chat') {
    if (isRateLimited(ip)) {
      res.writeHead(429, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Too many requests. Please slow down and try again.' }));
      return;
    }

    let body = '';
    req.on('data', chunk => {
      body += chunk;
      if (body.length > 50000) { // Protect against large payload DDOS
        req.destroy();
      }
    });

    req.on('end', async () => {
      try {
        const payload = JSON.parse(body || '{}');
        const userMessage = sanitizePromptInput(payload.message || '');
        const planContext = payload.context || {};

        if (!userMessage) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Message cannot be empty' }));
          return;
        }

        const result = await callGemini(userMessage, planContext);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(result));
      } catch (err) {
        console.error('Internal API error:', err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          error: 'An internal error occurred while processing your request. Please try again.',
          fallback: generateFallbackResponse('', {})
        }));
      }
    });
    return;
  }

  // API endpoint: /api/config
  if (req.method === 'GET' && pathname === '/api/config') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      appName: process.env.APP_NAME || 'Apna Utsav',
      hasApiKey: Boolean(GEMINI_API_KEY && GEMINI_API_KEY !== 'your_gemini_api_key_here'),
      model: GEMINI_MODEL
    }));
    return;
  }

  // Static file serving from /public directory
  if (req.method === 'GET' || req.method === 'HEAD') {
    let safePath = path.normalize(pathname).replace(/^(\.\.[/\\])+/, '');
    if (safePath === '/' || safePath === '\\') {
      safePath = '/index.html';
    }

    const filePath = path.join(__dirname, 'public', safePath);

    // Ensure path doesn't escape public dir
    if (!filePath.startsWith(path.join(__dirname, 'public'))) {
      res.writeHead(403, { 'Content-Type': 'text/plain' });
      res.end('403 Forbidden');
      return;
    }

    fs.stat(filePath, (err, stats) => {
      if (err || !stats.isFile()) {
        // Fallback to index.html for SPA client-side routing
        const indexPath = path.join(__dirname, 'public', 'index.html');
        fs.readFile(indexPath, (indexErr, indexData) => {
          if (indexErr) {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('404 Not Found');
          } else {
            res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end(indexData);
          }
        });
        return;
      }

      const ext = path.extname(filePath).toLowerCase();
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';

      // Cache headers: no-cache for html and service worker so updates are instant
      if (ext === '.html' || filePath.endsWith('sw.js')) {
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      } else {
        res.setHeader('Cache-Control', 'public, max-age=86400');
      }

      res.writeHead(200, { 'Content-Type': contentType });
      if (req.method === 'HEAD') {
        res.end();
      } else {
        fs.createReadStream(filePath).pipe(res);
      }
    });
    return;
  }

  // Method not allowed
  res.writeHead(405, { 'Content-Type': 'text/plain' });
  res.end('405 Method Not Allowed');
});

if (!process.env.VERCEL) {
  server.listen(PORT, HOST, () => {
    console.log(`\n======================================================`);
    console.log(`🎉  Apna Utsav Server running at http://${HOST}:${PORT}`);
    console.log(`🔒  Gemini API Key configured: ${Boolean(GEMINI_API_KEY && GEMINI_API_KEY !== 'your_gemini_api_key_here')}`);
    console.log(`📱  Mobile-First Celebration Planner ready`);
    console.log(`======================================================\n`);
  });
}

export default server;
