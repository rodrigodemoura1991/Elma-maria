(function(){
'use strict';
const KEY='meu_treino_reset_v1';
const EXDAY={Segunda:1,'Terça':2,Quarta:3,Quinta:4,Sexta:5,Sábado:6,Domingo:0};
function reps(l){return Object.values(l?.rows||{}).some(r=>{for(let s=0;s<20;s++)if(Number(r?.['kg'+s])>0&&Number(r?.['reps'+s])>0)return true;return false})}
function cardio(l){const c=l?.cardio||{};return !!(String(c.type||'').trim()||String(c.duration||'').trim()||String(c.distance||'').trim()||Number(c.calories)>0)}
function dateMatchesDay(l){const d=new Date(String(l.date)+'T12:00:00');return Number.isFinite(d.getTime())&&d.getDay()===EXDAY[String(l.day||'').split(' — ')[0]]}
function valid(l){if(!l||!l.date||l.draft||l.appleFitness?.imported)return false;if(l.completed===true)return true;return dateMatchesDay(l)&&(reps(l)||cardio(l))}
function read(){try{const d=JSON.parse(localStorage.getItem(KEY)||'{"logs":{}}');d.logs=d.logs||{};return d}catch(e){return{logs:{}}}}
function sanitize(){try{const d=read();let changed=false;Object.keys(d.logs).forEach(k=>{const l=d.logs[k];if(!valid(l)){delete d.logs[k];changed=true}else if(l.completed!==true){l.completed=true;changed=true}});if(changed){localStorage.setItem(KEY,JSON.stringify(d));if(typeof data!=='undefined')data.logs=d.logs}return d.logs}catch(e){return{}}}
function cleanHistory(){const logs=sanitize();document.querySelectorAll('.historyrow').forEach(row=>{const b=row.querySelector('button[onclick*="deleteLog"]');const m=(b?.getAttribute('onclick')||'').match(/deleteLog\(['"]([^'"]+)/);if(m&&!logs[m[1]])row.remove()})}
function removeSpotify(){document.querySelectorAll('.spotifyCard').forEach(e=>e.remove());document.querySelectorAll('[id="spotifyClientId"]').forEach(e=>e.closest('.card')?.remove())}
removeSpotify();cleanHistory();
setInterval(()=>{removeSpotify();cleanHistory()},5000);
})();