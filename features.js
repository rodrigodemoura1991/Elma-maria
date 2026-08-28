(function(){
'use strict';

function fmtDuration(v){
  if(!v)return '—';
  const m=String(v).match(/(\d+)\s*:\s*(\d+)(?::(\d+))?/);
  if(!m)return String(v);
  if(m[3])return `${m[1]}h ${m[2]}min`;
  return `${m[1]}min ${m[2]}s`;
}
function num(v){const n=Number(v);return Number.isFinite(n)?n:0}
function allLogs(){return Object.entries(window.data?.logs||{}).map(([k,l])=>({k,l})).filter(x=>x.l&&x.l.date).sort((a,b)=>String(b.l.date).localeCompare(String(a.l.date)))}
function volume(l){let total=0;Object.values(l?.rows||{}).forEach(r=>{for(let s=0;s<12;s++){const kg=num(r?.['kg'+s]),reps=num(r?.['reps'+s]);if(kg>0&&reps>0)total+=kg*reps}});return total}
function durationSec(v){if(!v)return 0;const p=String(v).split(':').map(Number);if(p.some(Number.isNaN))return 0;if(p.length===3)return p[0]*3600+p[1]*60+p[2];if(p.length===2)return p[0]*60+p[1];return 0}
function esc(s){return String(s??'').replace(/[&<>\"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[m]))}
function exerciseRecords(){
  const map={};
  allLogs().forEach(({l})=>{
    const day=String(l.day||'').split(' — ')[0];
    const ex=window.workouts?.[day]?.ex||[];
    ex.forEach((e,i)=>{
      const name=e[0], r=l.rows?.[i]; if(!r)return;
      for(let s=0;s<e[1];s++){
        const kg=num(r['kg'+s]), reps=num(r['reps'+s]);
        if(kg<=0||reps<=0)continue;
        const score=kg*reps;
        if(!map[name]||kg>map[name].kg||score>map[name].score)map[name]={name,kg,reps,score,date:l.date};
      }
    });
  });
  return Object.values(map).sort((a,b)=>b.score-a.score);
}
function streak(){
  const dates=new Set(allLogs().map(x=>x.l.date));
  let d=new Date(); let count=0;
  for(let i=0;i<370;i++){
    const iso=d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
    if(dates.has(iso)){count++;d.setDate(d.getDate()-1)}else break;
  }
  return count;
}
function inject(){
  if(window.current!=='Relatórios')return;
  const app=document.getElementById('app'); if(!app)return;
  if(document.getElementById('progressPanel'))return;
  const logs=allLogs();
  const total=logs.length;
  const totalVol=logs.reduce((a,x)=>a+volume(x.l),0);
  const durations=logs.map(x=>durationSec(x.l.duration)).filter(Boolean);
  const avg=durations.length?Math.round(durations.reduce((a,b)=>a+b,0)/durations.length):0;
  const rec=exerciseRecords().slice(0,8);
  const weekAgo=new Date();weekAgo.setDate(weekAgo.getDate()-6);
  const recent=logs.filter(x=>new Date(x.l.date+'T12:00:00')>=weekAgo).length;
  const html=`<section id="progressPanel" class="progress-panel">
    <div class="progress-head"><div><span>📈 EVOLUÇÃO</span><h2>Seu progresso</h2><p>Resumo automático dos treinos salvos.</p></div><button type="button" id="progressRefresh">↻ Atualizar</button></div>
    <div class="progress-grid">
      <div class="progress-card"><small>🏋️ TREINOS</small><b>${total}</b><span>${recent} nos últimos 7 dias</span></div>
      <div class="progress-card"><small>⚖️ VOLUME TOTAL</small><b>${totalVol?Math.round(totalVol).toLocaleString('pt-BR'):'—'}</b><span>kg × reps acumulados</span></div>
      <div class="progress-card"><small>⏱️ DURAÇÃO MÉDIA</small><b>${avg?fmtDuration(Math.floor(avg/60)+':'+String(avg%60).padStart(2,'0')):'—'}</b><span>dos treinos com tempo salvo</span></div>
      <div class="progress-card"><small>🔥 SEQUÊNCIA</small><b>${streak()}</b><span>dias consecutivos registrados</span></div>
    </div>
    <div class="progress-section"><h3>🏆 Recordes pessoais</h3><p class="muted">Melhores combinações de carga × repetições registradas por exercício.</p>${rec.length?'<div class="record-list">'+rec.map((r,i)=>`<div class="record-row"><strong>${i+1}</strong><div><b>${esc(r.name)}</b><small>${r.kg.toLocaleString('pt-BR')} kg × ${r.reps} reps • ${new Date(r.date+'T12:00:00').toLocaleDateString('pt-BR')}</small></div><em>${Math.round(r.score).toLocaleString('pt-BR')} kg</em></div>`).join('')+'</div>':'<div class="empty-record">Salve alguns treinos para começar a construir seus recordes.</div>'}</div>
    <div class="progress-section"><h3>📅 Consistência</h3><div class="week-dots">${Array.from({length:7},(_,i)=>{const d=new Date();d.setDate(d.getDate()-(6-i));const iso=d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');const ok=logs.some(x=>x.l.date===iso);return `<div class="week-day ${ok?'done':''}"><b>${d.toLocaleDateString('pt-BR',{weekday:'short'}).replace('.','')}</b><span>${ok?'✓':'·'}</span></div>`}).join('')}</div></div>
  </section>`;
  app.insertAdjacentHTML('beforeend',html);
  document.getElementById('progressRefresh')?.addEventListener('click',()=>{document.getElementById('progressPanel')?.remove();inject()});
}
const style=document.createElement('style');
style.textContent=`
.progress-panel{margin:18px 0 110px;background:var(--card,#fff);border:1px solid rgba(120,140,160,.2);border-radius:22px;padding:20px;box-shadow:0 8px 28px rgba(0,0,0,.06);color:var(--text,#17202a)}
.progress-head{display:flex;justify-content:space-between;gap:14px;align-items:flex-start;margin-bottom:16px}.progress-head span{font-size:13px;font-weight:900;letter-spacing:3px;color:#e56c27}.progress-head h2{margin:5px 0 2px;font-size:26px}.progress-head p,.muted{margin:0;color:#718096}.progress-head button{border:1px solid #d5dde5;background:transparent;border-radius:12px;padding:10px 13px;font-weight:800;cursor:pointer;color:inherit}
.progress-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:10px}.progress-card{border:1px solid #dce3e9;border-radius:16px;padding:14px;background:rgba(127,145,160,.05)}.progress-card small{display:block;color:#718096;font-weight:900;letter-spacing:1px}.progress-card b{display:block;font-size:26px;margin:7px 0 3px}.progress-card span{font-size:12px;color:#718096}
.progress-section{margin-top:18px;border-top:1px solid #e3e8ed;padding-top:16px}.progress-section h3{margin:0 0 4px;font-size:19px}.record-list{margin-top:12px;display:grid;gap:7px}.record-row{display:grid;grid-template-columns:30px 1fr auto;gap:10px;align-items:center;border:1px solid #e1e7ec;border-radius:13px;padding:10px 12px}.record-row>strong{width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:#eef2f5}.record-row b{display:block}.record-row small{display:block;color:#718096;margin-top:2px}.record-row em{font-style:normal;font-weight:900}.empty-record{margin-top:10px;padding:16px;border-radius:13px;background:#f4f6f8;color:#718096}.week-dots{display:grid;grid-template-columns:repeat(7,1fr);gap:8px;margin-top:12px}.week-day{border:1px solid #dce3e9;border-radius:13px;text-align:center;padding:10px 4px;color:#718096}.week-day b{display:block;font-size:11px;text-transform:uppercase}.week-day span{display:block;font-size:22px;margin-top:4px}.week-day.done{background:#eef8d8;border-color:#b8e450;color:#3c5810}.week-day.done span{font-weight:900}
@media(max-width:700px){.progress-panel{padding:16px}.progress-grid{grid-template-columns:repeat(2,1fr)}.progress-head h2{font-size:22px}.record-row{grid-template-columns:28px 1fr}.record-row em{grid-column:2}.week-dots{gap:5px}}
`;
document.head.appendChild(style);
const observer=new MutationObserver(()=>setTimeout(inject,50));
observer.observe(document.body,{childList:true,subtree:true});
setInterval(inject,800);
window.addEventListener('load',()=>setTimeout(inject,500));
})();
