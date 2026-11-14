import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const html=readFileSync('public/index.html','utf8');
const code=html.match(/\/\* product wheel:[\s\S]*?\n\}\)\(\);/)[0];
function setup(hover=false){
 function element(id){return {dataset:{id},listeners:{},attrs:{},classList:{toggle(){}},addEventListener(type,fn){(this.listeners[type]??=[]).push(fn)},setAttribute(k,v){this.attrs[k]=v},blur(){},fire(type,event={}){for(const fn of this.listeners[type]??=[])fn({preventDefault(){},...event})}}}
 const hits=['ernaehrung','supplements','pflege','hilfsmittel','otc'].map(element);
 const svg=element();svg.querySelectorAll=selector=>selector==='.hbw-hit'?hits:[];svg.contains=el=>hits.includes(el);
 const doc=element();doc.getElementById=()=>svg;doc.activeElement=null;
 vm.runInNewContext(code,{document:doc,matchMedia:()=>({matches:hover}),setTimeout:fn=>fn()});
 return {hits,svg,doc};
}
test('Touch: focus then click opens, repeat closes, switching works, outside closes',()=>{
 const {hits,doc}=setup();const [a,b]=hits;
 a.fire('pointerenter',{pointerType:'touch'});a.fire('focus');a.fire('click',{pointerType:'touch'});
 assert.equal(a.attrs['aria-pressed'],'true');
 a.fire('click',{pointerType:'touch'});assert.equal(a.attrs['aria-pressed'],'false');
 a.fire('click',{});b.fire('click',{});assert.equal(a.attrs['aria-pressed'],'false');assert.equal(b.attrs['aria-pressed'],'true');
 doc.fire('pointerdown',{target:{}});assert.equal(b.attrs['aria-pressed'],'false');
});
test('Mobile compatibility mouse events do not cancel a tap',()=>{
 const {hits,svg}=setup();const a=hits[0];
 a.fire('pointerenter',{pointerType:'mouse'});a.fire('focus');a.fire('click',{pointerType:'mouse'});svg.fire('pointerleave',{pointerType:'mouse'});
 assert.equal(a.attrs['aria-pressed'],'true');
});
test('Mouse hover and keyboard activation',()=>{
 const {hits,svg}=setup(true);const a=hits[0];
 a.fire('pointerenter',{pointerType:'mouse'});assert.equal(a.attrs['aria-pressed'],'true');
 svg.fire('pointerleave',{pointerType:'mouse'});assert.equal(a.attrs['aria-pressed'],'false');
 a.fire('focus');a.fire('keydown',{key:'Enter'});assert.equal(a.attrs['aria-pressed'],'true');
 a.fire('keydown',{key:' '});assert.equal(a.attrs['aria-pressed'],'false');
 a.fire('keydown',{key:'Enter'});a.fire('keydown',{key:'Escape'});assert.equal(a.attrs['aria-pressed'],'false');
});
test('Updated page script remains permitted by production CSP',()=>{
 const script=html.match(/<script>([\s\S]*?)<\/script>/)[1];
 const hash=createHash('sha256').update(script).digest('base64');
 const cfg=JSON.parse(readFileSync('vercel.json','utf8'));
 assert.ok(cfg.headers[0].headers.find(h=>h.key==='Content-Security-Policy').value.includes(`'sha256-${hash}'`));
});
