export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Methode nicht erlaubt.' });
  }
  const origin = req.headers.origin;
  if (origin) {
    try {
      if (new URL(origin).host !== req.headers.host) return res.status(403).json({ error: 'Ungültiger Ursprung.' });
    } catch { return res.status(403).json({ error: 'Ungültiger Ursprung.' }); }
  }
  if (!req.headers['content-type']?.startsWith('application/json')) return res.status(415).json({ error: 'JSON erforderlich.' });
  let body = req.body;
  if (typeof body === 'string') {
    if (Buffer.byteLength(body) > 2048) return res.status(413).json({ error: 'Anfrage zu groß.' });
    try { body = JSON.parse(body); } catch { return res.status(400).json({ error: 'Ungültige Anfrage.' }); }
  }
  if (!body || typeof body !== 'object' || Array.isArray(body)) return res.status(400).json({ error: 'Ungültige Anfrage.' });
  if (Object.keys(body).some(key => !['email', 'consent', 'website'].includes(key))) return res.status(400).json({ error: 'Ungültige Anfrage.' });
  if (body.website) return res.status(200).json({ ok: true });
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || body.consent !== true) return res.status(400).json({ error: 'E-Mail und Einwilligung erforderlich.' });
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) return res.status(503).json({ error: 'Anmeldung derzeit nicht verfügbar.' });
  try {
    const response = await fetch(`${url.replace(/\/$/, '')}/rest/v1/launch_signups?on_conflict=email`, {
      method: 'POST',
      headers: { apikey: key, 'Content-Type': 'application/json', Prefer: 'resolution=ignore-duplicates,return=minimal' },
      body: JSON.stringify({ email, consent_version: 'launch-2026-11-14' }),
      signal: AbortSignal.timeout(8000)
    });
    if (!response.ok) return res.status(502).json({ error: 'Speicherung derzeit nicht möglich.' });
    return res.status(200).json({ ok: true });
  } catch { return res.status(502).json({ error: 'Speicherung derzeit nicht möglich.' }); }
}
