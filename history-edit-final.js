(()=>{'use strict';
const DAYS=['Domingo','Segunda','Terça','Quarta','Quinta','Sexta','Sábado'];
const dayFromDate=date=>{const d=new Date(String(date)+'T12:00:00');return Number.isNaN(d.getTime())?'':DAYS[d.getDay()]};
const cloneLog=x=>JSON.parse(JSON.stringify(x));
function target(btn){
 const oc=btn.getAttribute('onclick')||'';
 const m=oc.match(/(?:editLog|editWorkout)\s*\(\s*['"]([^'"]+)['"]\s*\)/i);
 if(m&&data?.logs?.[m[1]])return m[1];
 let el=btn;
 for(let i=0;i<20&&el;i++,el=el.parentElement){
  const txt=(el.innerText||el.textContent||'').replace(/\s+/g,' ');
  const hit=txt.match(/(Domingo|Segunda|Terça|Quarta|Quinta|Sexta|Sábado)\D{0,120}(\d{2})\/(\d{2})\/(\d{4})/i);
  if(hit){const k=key(hit[1],`${hit[4]}-${hit[3]}-${hit[2]}`);if(data?.logs?.[k])return k}
  const dh=txt.match(/(\d{2})\/(\d{2})\/(\d{4})/);
  if(dh){const date=`${dh[3]}-${dh[2]}-${dh[1]}`,day=dayFromDate(date),k=day?key(day,date):'';if(k&&data?.logs?.[k])return k}
 }
 return '';
}
function openExact(k){
 const log=data?.logs?.[k];if(!log)return false;
 try{if(typeof stopGeneralTimer==='function')stopGeneralTimer(false)}catch(e){}
 Object.keys(drafts||{}).forEach(x=>{if(x!==k)delete drafts[x]});
 drafts[k]=cloneLog(log);
 const day=String(log.day),date=String(log.date);
 window.__historyEditingKey=k;window.__historyEditingDay=day;window.__historyEditingDate=date;window.__historyEditing=true;
 current=day;editDate=date;
 render();
 setTimeout(()=>{if(window.__historyEditingKey===k){current=day;editDate=date;render()}},0);
 return true;
}
function capture(ev){
 const btn=ev.target?.closest?.('button,a,[role="button"]');if(!btn)return;
 const label=(btn.innerText||btn.textContent||btn.getAttribute('aria-label')||'').trim(),oc=btn.getAttribute('onclick')||'';
 if(!/editar/i.test(label)&&!/(editLog|editWorkout)\s*\(/i.test(oc))return;
 const k=target(btn);if(!k)return;
 ev.preventDefault();ev.stopPropagation();if(ev.stopImmediatePropagation)ev.stopImmediatePropagation();
 openExact(k);
}
['pointerdown','pointerup','touchstart','click'].forEach(t=>document.addEventListener(t,capture,true));
// Impede que a navegação normal troque o dia enquanto a edição acabou de ser aberta.
const originalGo=window.go;
if(typeof originalGo==='function')window.go=function(x){
 if(window.__historyEditing&&window.__historyEditingKey&&x!==window.__historyEditingDay)return;
 return originalGo.apply(this,arguments);
};
window.editLog=function(k){return openExact(k)};
})();