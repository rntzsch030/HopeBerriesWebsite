import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import vm from 'node:vm';
const html=readFileSync('public/finder.html','utf8');
const code=html.match(/<script>([\s\S]*?)<\/script>/)[1];

test('Finder isolation and network deny rules match reviewed script',()=>{
 const main=readFileSync('public/index.html','utf8');
 assert.match(main,/sandbox="allow-scripts"/);
 assert.doesNotMatch(main,/finderVal|pickedChips|setAud\(st\./);
 assert.doesNotMatch(code,/fetch\(|XMLHttpRequest|sendBeacon|WebSocket|localStorage|sessionStorage|document.cookie|console\.|location\./);
 assert.match(html,/connect-src 'none'/);
 assert.match(html,/form-action 'none'/);
 const hash=createHash('sha256').update(code).digest('base64');
 assert.ok(html.includes(`'sha256-${hash}'`));
 const cfg=JSON.parse(readFileSync('vercel.json','utf8'));
 assert.ok(cfg.headers[1].headers[0].value.includes(`'sha256-${hash}'`));
 assert.match(cfg.headers[1].headers[0].value,/sandbox allow-scripts/);
 assert.doesNotMatch(main,/https:\/\/fonts\./);
});

test('All 378 existing answer combinations retain recommendations; reset erases state',()=>{
 const button={focus(){}};
 const el={innerHTML:'',style:{},querySelector(){return button},querySelectorAll(){return []}};
 const messages=[];
 const context={matchMedia:()=>({matches:true}),document:{getElementById:()=>el,addEventListener(){}},addEventListener(){},parent:{postMessage:(...args)=>messages.push(args)}};
 const injected=code.replace(/\}\)\(\);\s*$/, 'globalThis.audit={Q,NEEDS,render,reset,toSignup,set(s){started=true;st=s},state(){return st}};})();');
 vm.runInNewContext(injected,context);
 const a=context.audit;
 assert.equal(a.Q.length,3);assert.equal(a.Q[0].o.length,6);assert.equal(a.Q[1].o.length,2);assert.equal(a.Q[2].o.length,3);
 for(let mask=1;mask<64;mask++)for(const who of a.Q[1].o)for(const phase of a.Q[2].o){
  const needs=Array.from(a.Q[0].o).filter((_,i)=>mask&(1<<i));
  a.set({step:3,needs:[...needs],who,phase});a.render();
  const expected=needs.map(n=>a.NEEDS[n]);if(phase==='In Therapie')expected.push('Nur Produkte ohne bekannte Wechselwirkungen');
  for(const value of expected.slice(0,4))assert.ok(el.innerHTML.includes(value));
  a.reset();assert.equal(a.state().needs.length,0);assert.equal(a.state().who,null);assert.equal(a.state().phase,null);
  assert.doesNotMatch(el.innerHTML,/Ihr Ergebnis/);
 }
 a.set({step:3,needs:['Übelkeit'],who:'Für mich',phase:'In Therapie'});a.toSignup();
 assert.deepEqual(messages,[['hopeberries:open-signup','*']]);assert.equal(a.state().needs.length,0);
});
