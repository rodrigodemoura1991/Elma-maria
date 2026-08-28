(function(){
'use strict';
function secs(v){if(v===null||v===undefined||v==='')return 0;const s=String(v).trim();if(/^\d+(?:\.\d+)?$/.test(s))return Math.round(Number(s)*60);const p=s.split(':').map(Number);if(p.some(Number.isNaN))return 0;if(p.length===3)return p[0]*3600+p[1]*60+p[2];if(p.length===2)return p[0]*60+p[1];return 0}
function fmt(t){if(!t)return '—';const h=Math.floor(t/3600),m=Math.floor(t%3600/60),s=t%60;return h?`${h}h ${m}min`:`${m}min ${s}s`}
function read(){try{return JSON.parse(localStorage.getItem('meu_treino_reset_v1')||'{"logs":{}}')}catch(e){return{logs:{}}}}
function validLogs(){return Object.values(read().logs||{}).filter(l=>l&&l.date&&!l.draft&&!l.appleFitness?.imported)}
function apply(){const pd=document.getElementById('progressDashboard');if(!pd||pd.dataset.timeFixed==='1')return;const logs=validLogs();const muscle=logs.map(l=>secs(l.duration)).filter(Boolean);const cardio=logs.map(l=>secs(l.cardio?.duration)).filter(Boolean);const avg=a=>a.length?Math.round(a.reduce((x,y)=>x+y,0)/a.length):0;const grid=pd.querySelector('.pd-grid');if(!grid)return;const cards=[...grid.children];const old=cards.find(x=>/TEMPO MÉDIO/i.test(x.textContent||''));if(!old)return;old.outerHTML=`<article><small>⏱️ MUSCULAÇÃO</small><b>${fmt(avg(muscle))}</b><em>${muscle.length} treinos com tempo salvo</em></article><article><small>🚴 CARDIO</small><b>${fmt(avg(cardio))}</b><em>${cardio.length} treinos com cardio</em></article>`;pd.dataset.timeFixed='1'}
function hook(){if(typeof window.go!=='function'||window.go.__reportTimeFix)return;const g=window.go;function wrapped(x){g(x);if(x==='Relatórios')setTimeout(apply,30)}wrapped.__reportTimeFix=true;window.go=wrapped}
window.addEventListener('load',()=>{hook();setTimeout(apply,200)});hook();setTimeout(()=>{hook();apply()},500);setTimeout(()=>{hook();apply()},1200);
})();
