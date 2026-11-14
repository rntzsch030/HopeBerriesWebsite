import test from 'node:test';
import assert from 'node:assert/strict';
import handler from '../api/contact.js';
const payload={id:'9b2a9304-35f6-4a91-8db9-08ce144813f1',name:'Test',email:'test@example.invalid',subject:'Technischer Test',message:'Dies ist eine technische Testnachricht.',website:''};
async function run(body,extra={}){
 const req={method:'POST',headers:{host:'hopeberries.test',origin:'https://hopeberries.test','content-type':'application/json'},body,...extra};
 const res={setHeader(){},status(n){this.code=n;return this},json(body){this.body=body;return this}};
 await handler(req,res);return res;
}
test('Contact validation, data boundaries, idempotent retries and failures',async t=>{
 const oldFetch=globalThis.fetch,oldURL=process.env.SUPABASE_URL,oldKey=process.env.SUPABASE_SECRET_KEY;
 t.after(()=>{globalThis.fetch=oldFetch;for(const[k,v]of[['SUPABASE_URL',oldURL],['SUPABASE_SECRET_KEY',oldKey]]){if(v===undefined)delete process.env[k];else process.env[k]=v}});
 const calls=[];globalThis.fetch=async(...args)=>{calls.push(args);return{ok:true}};
 assert.equal((await run(payload,{method:'GET'})).code,405);
 assert.equal((await run({...payload,email:'bad'})).code,400);
 assert.equal((await run({...payload,message:'short'})).code,400);
 assert.equal((await run({...payload,message:'a'.repeat(5001)})).code,400);
 assert.equal((await run({...payload,finder:'must-not-pass'})).code,400);
 assert.equal((await run(payload,{headers:{origin:'https://evil.test',host:'hopeberries.test'}})).code,403);
 assert.equal((await run({...payload,website:'spam'})).code,200);
 assert.equal(calls.length,0);
 delete process.env.SUPABASE_URL;delete process.env.SUPABASE_SECRET_KEY;assert.equal((await run(payload)).code,503);
 process.env.SUPABASE_URL='https://test.supabase.co';process.env.SUPABASE_SECRET_KEY='test-secret';
 for(let i=0;i<2;i++)assert.equal((await run(payload)).code,200);
 assert.match(calls[0][0],/contact_messages\?on_conflict=id$/);
 const data=JSON.parse(calls[0][1].body);assert.equal(data.message,payload.message);assert.equal(data.id,JSON.parse(calls[1][1].body).id);assert.equal(data.website,undefined);
 globalThis.fetch=async()=>({ok:false});assert.equal((await run(payload)).code,502);
 globalThis.fetch=async()=>{throw new Error('private backend details')};const failure=await run(payload);assert.equal(failure.code,502);assert.doesNotMatch(JSON.stringify(failure.body),/private backend|test-secret/);
});
