/* Meu Treino — final behavior fix 2026-08-24 */
(function(){
  'use strict';
  const DRAFT='|draft';
  let activeDraftKey=null;
  let timerLoop=null;
  const pad=n=>String(Math.max(0,Math.floor(Number(n)||0))).padStart(2,'0');
  const fmt=s=>{s=Math.max(0,Math.round(Number(s)||0));return Math.floor(s/3600)+':'+pad((s%3600)/60)+':'+pad(s%60)};
  const normalKey=(day,date)=>day+'|'+date;
  const todayLocal=()=>{const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')};
  const currentNormal=()=>normalKey(typeof current==='string'?current:'Segunda',todayLocal());
  function blank(day,date){return {day,date,rows:{},notes:'',duration:'',avgBpm:'',calories:'',effort:'',cardio:{type:'',duration:'',distance:'',calories:'',avgBpm:''},draft:true,completed:false};}
  function setupDraft(){if(typeof data==='undefined'||!data.logs)return;const k=currentNormal();if(activeDraftKey===k+DRAFT)return;const normal=data.logs[k],dk=k+DRAFT;if(normal?.completed===true){if(!data.logs[dk])data.logs[dk]=blank(normal.day||current,normal.date||todayLocal());activeDraftKey=dk}else if(data.logs[dk]?.draft)activeDraftKey=dk;else activeDraftKey=null;}
  function activeKey(k){return activeDraftKey&&k===currentNormal()?activeDraftKey:k}
  function activeLog(){const k=currentNormal(),ak=activeKey(k);if(!data.logs[ak])data.logs[ak]=blank(current,todayLocal());return data.logs[ak]}
  function elapsed(l){if(!l)return 0;const base=Number(l.timerAccumulatedSeconds)||0,started=Number(l.timerStartedAt)||0;return Math.max(0,Math.round(base+(started?Math.max(0,(Date.now()-started)/1000):0)))}
  function updateClock(){const l=activeLog(),s=elapsed(l);document.querySelectorAll('#workoutClock').forEach(e=>e.textContent=fmt(s));const summary=document.getElementById('summaryDuration');if(summary&&l.duration)summary.textContent=l.duration}
  function startTimer(){const l=activeLog();if(l.timerStartedAt)return;l.timerAccumulatedSeconds=Number(l.timerAccumulatedSeconds)||0;l.timerStartedAt=Date.now();l.duration='';try{localSave()}catch(e){}clearInterval(timerLoop);timerLoop=setInterval(updateClock,1000);updateClock();const small=document.querySelector('.workoutTimer small');if(small)small.textContent='Treino em andamento'}
  function stopTimer(){const l=activeLog(),s=elapsed(l);if(l.timerStartedAt||l.timerAccumulatedSeconds){l.timerAccumulatedSeconds=s;l.duration=fmt(s);delete l.timerStartedAt}clearInterval(timerLoop);timerLoop=null;try{localSave()}catch(e){}updateClock();const small=document.querySelector('.workoutTimer small');if(small)small.textContent='Cronômetro finalizado';return s}
  window.advanceField=function(){};
  window.startWorkout=startTimer;
  window.stopWorkout=stopTimer;
  const originalRender=window.render;
  if(typeof originalRender==='function'&&!window.__finalFixRender){window.render=function(){setupDraft();const k=currentNormal(),dk=activeDraftKey;let moved=false,normalValue;if(dk&&k!==dk&&data.logs[k]){normalValue=data.logs[k];data.logs[k]=data.logs[dk];moved=true}try{return originalRender.apply(this,arguments)}finally{if(moved){data.logs[dk]=data.logs[k];data.logs[k]=normalValue}setTimeout(()=>{setupDraft();if(activeDraftKey)startLoopIfNeeded()},0)}};window.__finalFixRender=true}
  function startLoopIfNeeded(){const l=activeLog();if(l.timerStartedAt){clearInterval(timerLoop);timerLoop=setInterval(updateClock,1000);updateClock()}}
  ['setVal','setObs','setMetric','setCardio','setNotes'].forEach(name=>{const original=window[name];if(typeof original!=='function')return;const mark='__finalFix_'+name;if(window[mark])return;window[name]=function(k){const args=[...arguments];if(k===currentNormal()&&activeDraftKey)args[0]=activeDraftKey;return original.apply(this,args)};window[mark]=true});
  document.addEventListener('input',function(e){const el=e.target;if(!(el instanceof HTMLInputElement))return;if(el.dataset.kind==='kg'&&String(el.value||'').trim()!==''&&!activeLog().timerStartedAt)startTimer()},true);
  document.addEventListener('click',function(e){const btn=e.target.closest('.timerBtns button');if(!btn)return;e.preventDefault();e.stopImmediatePropagation();if(/START/i.test(btn.textContent||''))startTimer();else if(/STOP/i.test(btn.textContent||''))stopTimer()},true);
  window.saveWorkout=async function(k){const normal=k||currentNormal(),sourceKey=(activeDraftKey&&normal===currentNormal())?activeDraftKey:normal,source=data.logs[sourceKey];if(!source){alert('Nenhum treino para salvar.');return}stopTimer();const snapshot=JSON.parse(JSON.stringify(source));snapshot.draft=false;snapshot.completed=true;snapshot.completedAt=new Date().toISOString();delete snapshot.timerStartedAt;delete snapshot.timerAccumulatedSeconds;data.logs[normal]=snapshot;const dk=normal+DRAFT;data.logs[dk]=blank(snapshot.day||current,snapshot.date||todayLocal());activeDraftKey=dk;localSave();try{if(typeof cloudSave==='function'&&user&&sb)await cloudSave(normal)}catch(e){console.error(e)}render();setTimeout(()=>alert('Treino salvo no histórico. O treino atual foi zerado e está pronto para o próximo treino.'),80)};
  function boot(){setupDraft();startLoopIfNeeded()}
  setTimeout(boot,50);setTimeout(boot,400);setTimeout(boot,1200);
})();
