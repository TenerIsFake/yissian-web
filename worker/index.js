const STRIP_RE = /<(head|script|style|nav|footer|header)[\s\S]*?<\/\1>/gi;
const BLOCK_RE = /<(h[1-3]|p|li|blockquote|td|th)[^>]*>([\s\S]*?)<\/\1>/gi;
const ENTITY_MAP = {
  '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"',
  '&#39;': "'", '&nbsp;': ' ', '&apos;': "'",
};

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Content-Type': 'application/json',
};

function isBlockedUrl(raw) {
  let u;
  try { u = new URL(raw); } catch { return true; }
  if (!['http:', 'https:'].includes(u.protocol)) return true;
  const h = u.hostname;
  if (h === 'localhost' || h.endsWith('.local') || h === '0.0.0.0') return true;
  const p = h.split('.').map(Number);
  if (p.length === 4 && p.every(n => !isNaN(n))) {
    if (p[0] === 10) return true;
    if (p[0] === 172 && p[1] >= 16 && p[1] <= 31) return true;
    if (p[0] === 192 && p[1] === 168) return true;
    if (p[0] === 127) return true;
  }
  return false;
}

function decodeEntities(s) {
  return s.replace(/&[a-zA-Z]+;|&#\d+;/g, m => ENTITY_MAP[m] ?? ' ');
}

function extractBlocks(html) {
  const stripped = html.replace(STRIP_RE, '');
  const blocks = [];
  for (const m of stripped.matchAll(BLOCK_RE)) {
    const inner = m[2].replace(/<br\s*\/?>/gi, ' ').replace(/<[^>]+>/g, ' ');
    const text = decodeEntities(inner).replace(/\s+/g, ' ').trim();
    if (text.length > 15) blocks.push({ tag: m[1].toLowerCase(), text });
  }
  return blocks;
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: CORS });
}

export default {
  async fetch(request) {
    if (request.method === 'OPTIONS') return new Response(null, { headers: CORS });

    const { searchParams } = new URL(request.url);
    const target = searchParams.get('url');

    if (!target) return json({ error: 'Missing ?url= parameter' }, 400);

    let decoded;
    try { decoded = decodeURIComponent(target); } catch {
      return json({ error: 'Invalid URL encoding' }, 400);
    }

    if (!decoded.startsWith('http')) decoded = 'https://' + decoded;
    if (isBlockedUrl(decoded)) return json({ error: 'URL not allowed' }, 403);

    let res;
    try {
      res = await fetch(decoded, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
        },
        redirect: 'follow',
        cf: { cacheEverything: true, cacheTtl: 300 },
      });
    } catch (e) {
      return json({ error: `Fetch failed: ${e.message}` }, 502);
    }

    if (!res.ok) return json({ error: `HTTP ${res.status}`, status: res.status }, res.status);

    const ct = res.headers.get('content-type') ?? '';
    if (!ct.includes('html')) return json({ error: 'Not an HTML page' }, 422);

    const html = await res.text();
    const blocks = extractBlocks(html);

    return json({ blocks, url: decoded });
  },
};
