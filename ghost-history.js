/* Meu Treino — fantasma universal das últimas cargas/reps */
(function(){
'use strict';
const KEY='meu_treino_reset_v1';
const DAYS=['Segunda','Terça','Quarta','Quinta','Sexta','Sábado','Domingo'];
let timer=0;
function read(){try{return JSON.parse(localStorage.getItem(KEY)||'{"logs":{}}')||{logs:{}}}catch(e){return {logs:{}}}}
function dayName(v){return String(v||'').split(' — ')[0].trim()}
function dateNum(v){const s=String(v||'').slice(0,10);return s?new Date(s+'T12:00:00').getTime():0}
function allLogs(){const source=(typeof data!=='undefined'&&data?.logs)?data.logs:read().logs;return Object.values(source||{}).filter(l=>l&&l.date&&!l.draft&&l.completed!==false).sort((a,b)=>dateNum(b.date)-dateNum(a.date))}
function exList(day){try{return (typeof workouts!=='undefined'&&workouts[day]?.ex)||[]}catch(e){return []}}
function exerciseIndex(day,name){return exList(day).findIndex(x=>x[0]===name)}
function rowHas(r){for(let s=0;s<15;s++)if(String(r?.['kg'+s]??'').trim()||String(r?.['reps'+s]??'').trim())return true;return false}
function findRow(name,day,excludeDate){
  const same=[],any=[];
  for(const l of allLogs()){
    if(String(l.date)===String(excludeDate))continue;
    const d=dayName(l.day),idx=exerciseIndex(d,name),r=l.rows?.[idx];
    if(idx<0||!r||!rowHas(r))continue;
    if(d===day)same.push(r); else any.push(r);
  }
  return same[0]||any[0]||null;
}
function val(v){return v===undefined||v===null||String(v).trim()===''?'':String(v).trim().replace(/\.0+$/,'')}
function applyGhost(input,value,kind){
  if(!input.dataset.ghostOriginal)input.dataset.ghostOriginal=input.getAttribute('placeholder')||kind;
  if(input.value){input.classList.remove('ghost-history');return}
  input.setAttribute('placeholder',value||input.dataset.ghostOriginal||kind);
  if(value){input.setAttribute('title','Último treino: '+value+' '+(kind==='kg'?'kg':'reps'));input.setAttribute('data-ghost','1');input.classList.add('ghost-history')}
  else{input.removeAttribute('title');input.removeAttribute('data-ghost');input.classList.remove('ghost-history')}
}
function decorate(){
  if(typeof current==='undefined'||!DAYS.includes(current))return;
  const ex=exList(current),today=typeof window.today==='function'?window.today():new Date().toISOString().slice(0,10);
  const inputs=[...document.querySelectorAll('input')].filter(i=>{const p=(i.getAttribute('placeholder')||'').trim().toLowerCase();return p==='kg'||p==='reps'||i.dataset.kind==='kg'||i.dataset.kind==='reps'||i.classList.contains('field')});
  if(!inputs.length)return;
  let cursor=0;
  for(const e of ex){
    const name=e[0],sets=Number(e[1])||0,row=findRow(name,current,today);
    for(let s=0;s<sets;s++){
      const kg=inputs[cursor++],reps=inputs[cursor++];
      if(kg)applyGhost(kg,val(row?.['kg'+s]),'kg');
      if(reps)applyGhost(reps,val(row?.['reps'+s]),'reps');
    }
  }
}
function run(){clearTimeout(timer);timer=setTimeout(decorate,180)}
window.addEventListener('load',()=>{run();setTimeout(run,300);setTimeout(run,1000);setTimeout(run,2500)});
document.addEventListener('input',e=>{if(e.target.matches('input'))run()},true);
document.addEventListener('focusin',e=>{if(e.target.matches('input'))run()},true);
setTimeout(()=>{if(typeof window.render==='function'){const original=window.render;window.render=function(){const r=original.apply(this,arguments);run();return r}}},1000);
new MutationObserver(run).observe(document.body,{childList:true,subtree:true});
})();
