// CF Pages Function — deployed at yissian.tendrid.us/lookup
export async function onRequestPost({ request, env }) {
  // env.ANTHROPIC_API_KEY must be set in CF Pages env vars
  const { name } = await request.json();
  if (!name || name.length > 100) return new Response(JSON.stringify({ found: false }), { headers: { 'Content-Type': 'application/json' } });

  const prompt = `You are a pharmacology reference. Return ONLY a valid JSON object for the drug: "${name.replace(/"/g, "'")}"
{
  "found": true,
  "name": "Official drug name",
  "genericName": "generic name",
  "category": "drug class",
  "halfLifeBase": <number: typical adult elimination half-life in hours>,
  "halfLifeRange": "e.g. 2-4 hrs",
  "minTherapeuticPct": <number 0-100>,
  "maxTherapeuticPct": <number 0-100>,
  "notes": "1-2 sentences on key PK characteristics"
}
If not a real pharmaceutical or research compound with known PK data, return: {"found":false}`;

  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({ model: 'claude-haiku-4-5-20251001', max_tokens: 400, messages: [{ role: 'user', content: prompt }] })
  });
  if (!r.ok) return new Response(JSON.stringify({ found: false }), { status: 502, headers: { 'Content-Type': 'application/json' } });
  const data = await r.json();
  const text = (data.content || []).map(b => b.text || '').join('');
  try {
    const parsed = JSON.parse(text.replace(/```json|```/g, '').trim());
    return new Response(JSON.stringify(parsed), { headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } });
  } catch {
    return new Response(JSON.stringify({ found: false }), { headers: { 'Content-Type': 'application/json' } });
  }
}

export async function onRequestOptions() {
  return new Response(null, { headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' } });
}
