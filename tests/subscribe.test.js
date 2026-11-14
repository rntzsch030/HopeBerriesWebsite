import test from 'node:test';
import assert from 'node:assert/strict';
import handler from '../api/subscribe.js';

function request(body, extra = {}) {
  return { method: 'POST', headers: { host: 'hopeberries.test', origin: 'https://hopeberries.test', 'content-type': 'application/json' }, body, ...extra };
}
async function run(req) {
  const res = { headers: {}, setHeader(k,v) { this.headers[k]=v; }, status(n) { this.code=n; return this; }, json(data) { this.data=data; return this; } };
  await handler(req,res); return res;
}
test('API validation and Supabase boundary', async (t) => {
  const oldFetch=globalThis.fetch, oldURL=process.env.SUPABASE_URL, oldKey=process.env.SUPABASE_SECRET_KEY;
  t.after(()=>{globalThis.fetch=oldFetch; for(const [k,v] of [['SUPABASE_URL',oldURL],['SUPABASE_SECRET_KEY',oldKey]]){if(v===undefined)delete process.env[k];else process.env[k]=v;}});
  let calls=[];
  globalThis.fetch=async (...args)=>{calls.push(args); return {ok:true};};
  assert.equal((await run(request({}, {method:'GET'}))).code,405);
  assert.equal((await run(request({email:'bad',consent:true}))).code,400);
  assert.equal((await run(request({email:'a@b.de',consent:false}))).code,400);
  assert.equal((await run(request({}, {headers:{origin:'https://evil.test',host:'hopeberries.test','content-type':'application/json'}}))).code,403);
  assert.equal(calls.length,0);
  delete process.env.SUPABASE_URL; delete process.env.SUPABASE_SECRET_KEY;
  assert.equal((await run(request({email:'a@b.de',consent:true}))).code,503);
  process.env.SUPABASE_URL='https://example.supabase.co';process.env.SUPABASE_SECRET_KEY='sb_secret_test';
  assert.equal((await run(request({email:'a@b.de',consent:true,finder:'sensitive'}))).code,400);
  const body={email:' A@B.DE ',consent:true};
  for(let i=0;i<2;i++)assert.equal((await run(request(body))).code,200);
  assert.deepEqual(JSON.parse(calls[0][1].body),{email:'a@b.de',consent_version:'launch-2026-11-14'});
  assert.match(calls[0][1].headers.Prefer,/ignore-duplicates/);
  globalThis.fetch=async()=>({ok:false});
  const failure=await run(request(body)); assert.equal(failure.code,502);assert.doesNotMatch(JSON.stringify(failure.data),/sb_secret/);
  globalThis.fetch=async()=>{throw new Error('offline')};
  assert.equal((await run(request(body))).code,502);
});
