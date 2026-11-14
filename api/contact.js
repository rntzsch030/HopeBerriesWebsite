export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return res.status(405).json({error:'Methode nicht erlaubt.'}); }
  if (req.headers.origin) {
    try { if (new URL(req.headers.origin).host !== req.headers.host) return res.status(403).json({error:'Ungültiger Ursprung.'}); }
    catch { return res.status(403).json({error:'Ungültiger Ursprung.'}); }
  }
  if (!req.headers['content-type']?.startsWith('application/json')) return res.status(415).json({error:'JSON erforderlich.'});
  let body=req.body;
  try {
    const raw=typeof body==='string'?body:JSON.stringify(body);
    if (!raw || Buffer.byteLength(raw)>24000) return res.status(413).json({error:'Anfrage zu groß.'});
    if (typeof body==='string') body=JSON.parse(body);
  } catch { return res.status(400).json({error:'Ungültige Anfrage.'}); }
  if (!body || typeof body!=='object' || Array.isArray(body) || Object.keys(body).some(k=>!['id','name','email','subject','message','website'].includes(k))) return res.status(400).json({error:'Ungültige Anfrage.'});
  if (body.website) return res.status(200).json({ok:true});
  const id=body.id;
  const name=typeof body.name==='string'?body.name.trim():'';
  const email=typeof body.email==='string'?body.email.trim().toLowerCase():'';
  const subject=typeof body.subject==='string'?body.subject.trim():'';
  const message=typeof body.message==='string'?body.message.trim():'';
  if (typeof id!=='string'||! /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id) || name.length>120 || subject.length>160 || email.length>254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || message.length<10 || message.length>5000) return res.status(400).json({error:'Bitte prüfen Sie Ihre Eingaben.'});
  const url=process.env.SUPABASE_URL,key=process.env.SUPABASE_SECRET_KEY;
  if (!url||!key) return res.status(503).json({error:'Kontaktformular derzeit nicht verfügbar.'});
  try {
    const response=await fetch(`${url.replace(/\/$/,'')}/rest/v1/contact_messages?on_conflict=id`,{
      method:'POST',headers:{apikey:key,'Content-Type':'application/json',Prefer:'resolution=ignore-duplicates,return=minimal'},
      body:JSON.stringify({id,name:name||null,email,subject:subject||null,message,privacy_version:'contact-2026-11-14'}),signal:AbortSignal.timeout(8000)
    });
    if (!response.ok) return res.status(502).json({error:'Nachricht derzeit nicht speicherbar.'});
    return res.status(200).json({ok:true});
  } catch { return res.status(502).json({error:'Nachricht derzeit nicht speicherbar.'}); }
}
