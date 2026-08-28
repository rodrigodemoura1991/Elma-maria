/* MEU TREINO — RECOVERY CLEAN 2026-08-26
   Core-only compatibility layer. Uses the app's global lexical state directly.
*/
(function(){
'use strict';

function escX(s){return String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
function todayX(){const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')}
function localOnly(){try{localSave()}catch(e){}}

/* Remove Spotify from the rendered structure and its persisted state. */
function purgeSpotify(){
  try{Object.keys(localStorage).filter(k=>/spotify/i.test(k)).forEach(k=>localStorage.removeItem(k))}catch(e){}
  document.querySelectorAll('[id*="spotify" i],[class*="spotify" i],[data-spotify],script[src*="spotify" i],link[href*="spotify" i]').forEach(e=>e.remove());
  document.querySelectorAll('#app a,#app button,#app section,#app div,#app article,#app header').forEach(e=>{
    const t=(e.textContent||'').replace(/\s+/g,' ').trim();
    if(/spotify/i.test(t)&&t.length<220)e.remove();
  });
}
purgeSpotify();
new MutationObserver(()=>purgeSpotify()).observe(document.documentElement,{subtree:true,childList:true});

/* Remove the old automatic cloud-save path. */
window.queueSave=function(){return Promise.resolve(false)};
window.save=function(k){localOnly();return Promise.resolve(false)};

/* Explicit Save Workout is the only cloud write. */
window.cloudSave=async function(k){
  const l=data?.logs?.[k];
  if(!user||!sb||!l||l.draft===true||l.completed!==true)return false;
  try{
    const {error}=await sb.from('workout_logs').upsert({user_id:user.id,log_key:CLOUD_PREFIX+k,day:l.day,workout_date:l.date,payload:l,updated_at:new Date().toISOString()},{onConflict:'user_id,log_key'});
    if(error)throw error;
    cloudReady=true;setStatus('☁ Online • treino salvo',true);return true;
  }catch(e){console.error('cloudSave',e);cloudReady=false;setStatus('⚠ Não confirmado na nuvem',false);return false}
};
window.saveWorkout=async function(k){
  const l=data?.logs?.[k];if(!l)return false;
  if(l.timerStartedAt&&typeof stopWorkout==='function')stopWorkout();
  const snapshot=JSON.parse(JSON.stringify(l));
  snapshot.draft=false;snapshot.completed=true;snapshot.completedAt=new Date().toISOString();
  const normal=(snapshot.day||current)+'|'+(snapshot.date||todayX());
  data.logs[normal]=snapshot;if(k!==normal)delete data.logs[k];localOnly();
  const ok=user&&sb?await cloudSave(normal):false;
  data.logs[normal+'|draft']={day:snapshot.day,date:snapshot.date,rows:{},notes:'',duration:'',avgBpm:'',calories:'',effort:'',cardio:{type:'',duration:'',distance:'',calories:'',avgBpm:''},draft:true,completed:false};
  localOnly();render();
  setTimeout(()=>alert(user&&sb?(ok?'Treino salvo no histórico e no Supabase.':'Treino salvo neste aparelho, mas NÃO foi confirmado no Supabase.'):'Treino salvo neste aparelho. Entre na conta para sincronizar.'),40);
  return ok;
};

/* Turn the visible Save button into the explicit save action. */
function wireSaveButton(){
  document.querySelectorAll('.actions button').forEach(btn=>{
    if(/Salvar treino/i.test(btn.textContent||'')){
      const m=(btn.getAttribute('onclick')||'').match(/save\(['"]([^'"]+)/);
      const k=m?.[1]||key(current,todayX());
      btn.onclick=()=>saveWorkout(k);
    }
  });
  purgeSpotify();
}

/* Keep the official Wednesday program without pelvic raise. */
try{workouts.Quarta.ex=workouts.Quarta.ex.filter(e=>String(e?.[0]).toLowerCase()!=='elevação pélvica')}catch(e){}

/* Rest: entering reps starts the corresponding exercise rest timer. */
window.setVal=function(k,i,s,f,v){
  const l=ensure(k,current,todayX());l.rows[i]??={};l.rows[i][f+s]=v;localOnly();
  const ex=workouts?.[current]?.ex?.[i];
  if(f==='kg'&&Number(v)>0&&!l.timerStartedAt&&typeof startWorkout==='function')setTimeout(()=>startWorkout(),30);
  if(f==='reps'&&String(v??'').trim()!==''&&ex)setTimeout(()=>autoRest(i),40);
};
window.setObs=function(k,i,v){const l=ensure(k,current,todayX());l.rows[i]??={};l.rows[i].observation=v;localOnly()};
window.setMetric=function(k,f,v){const l=ensure(k,current,todayX());l[f]=v;localOnly();if(typeof updateWorkoutSummary==='function')updateWorkoutSummary()};
window.setCardio=function(k,f,v){const l=ensure(k,current,todayX());l.cardio??={};l.cardio[f]=v;localOnly()};
window.setNotes=function(k,v){const l=ensure(k,current,todayX());l.notes=v;localOnly()};

/* Enter always moves to the next visible editable field. */
document.addEventListener('keydown',function(e){
  if(e.key!=='Enter')return;
  const el=e.target;if(!el.matches?.('input,textarea,select'))return;
  e.preventDefault();e.stopImmediatePropagation();
  const fields=[...document.querySelectorAll('input:not([disabled]):not([type="hidden"]),textarea:not([disabled]),select:not([disabled])')].filter(x=>x.offsetParent!==null);
  const i=fields.indexOf(el);if(fields[i+1]){fields[i+1].focus();fields[i+1].select?.()}
},true);

/* Only completed records with at least two exercise rows appear in history. */
const originalHistory=window.history;
function cleanLocalHistory(){
  for(const k of Object.keys(data.logs||{})){
    const l=data.logs[k];
    if(!l||l.draft===true||l.completed!==true||k.endsWith('|draft'))continue;
    const count=Object.values(l.rows||{}).filter(r=>Object.values(r||{}).some(v=>String(v??'').trim()!=='')).length;
    if(count<=1)delete data.logs[k];
  }
  localOnly();
}
cleanLocalHistory();
const originalLoadCloud=window.loadCloud;
window.loadCloud=async function(){
  if(!user||!sb)return;
  try{
    const {data:rows,error}=await sb.from('workout_logs').select('log_key,payload').like('log_key',CLOUD_PREFIX+'%').order('workout_date',{ascending:false});
    if(error)throw error;
    cloudReady=true;
    for(const r of rows||[]){const p=r.payload;if(p?.completed===true&&p?.draft!==true){const count=Object.values(p.rows||{}).filter(x=>Object.values(x||{}).some(v=>String(v??'').trim()!=='')).length;if(count>1)data.logs[r.log_key.replace(CLOUD_PREFIX,'')]=p}}
    for(const k of Object.keys(data.logs)){const l=data.logs[k];if(l?.completed!==true&&l?.draft!==true&&String(k).includes('|'))delete data.logs[k]}
    cleanLocalHistory();render();
  }catch(e){console.error('clean cloud load',e);cloudReady=false;setStatus('⚠ Nuvem indisponível • local salvo',false)}
};

/* Per-exercise next-session guidance in History. */
function adviceFor(ex,r){
  const m=String(ex?.[2]||'').match(/(\d+)\s*[–-]\s*(\d+)/);if(!m)return ['MANTER CARGA','Mantenha a carga atual.'];
  const lo=+m[1],hi=+m[2],sets=[];
  for(let s=0;s<+ex[1];s++){const kg=+r?.['kg'+s],reps=+r?.['reps'+s];if(kg>0&&reps>0)sets.push({kg,reps})}
  if(!sets.length)return ['MANTER CARGA','Registre as séries para avaliar a progressão.'];
  if(sets.length>=+ex[1]&&sets.every(x=>x.reps>=hi))return ['AUMENTAR CARGA','Você atingiu o topo da faixa em todas as séries.'];
  if(sets.some(x=>x.reps<lo))return ['AUMENTAR REP','Mantenha a carga e aumente as repetições.'];
  return ['AUMENTAR REP','Mantenha a carga e tente chegar ao topo da faixa.'];
}
function historyKey(row){const m=(row.querySelector('.smallbtn')?.getAttribute('onclick')||'').match(/deleteLog\(['"]([^'"]+)/);return m?.[1]}
function injectAdvice(){
  document.querySelectorAll('.historyrow').forEach(row=>{
    if(row.querySelector('.ai-exercise-advice'))return;
    const k=historyKey(row),l=k?data.logs[k]:null;if(!l||l.completed!==true||l.draft===true)return;
    const day=String(l.day||'').split(' — ')[0],ex=workouts?.[day]?.ex||[];if(!ex.length)return;
    const p=document.createElement('div');p.className='ai-exercise-advice';
    p.innerHTML='<div class="ai-advice-title">🤖 ORIENTAÇÃO PARA O PRÓXIMO TREINO</div>'+ex.map((e,i)=>{const a=adviceFor(e,l.rows?.[i]||{});return `<div class="ai-advice-row"><strong>${escX(e[0])}</strong><b>${a[0]}</b><small>${escX(a[1])}</small></div>`}).join('');
    row.parentNode.insertBefore(p,row);
  });
}
const r0=window.render;
if(typeof r0==='function')window.render=function(){r0.apply(this,arguments);setTimeout(()=>{wireSaveButton();injectAdvice();purgeSpotify()},20)};
const st=document.createElement('style');st.textContent='.ai-exercise-advice{margin:8px 0;padding:12px;border:1px solid #ddd;border-radius:12px;background:#fafafa}.ai-advice-title{font-weight:900;font-size:11px;margin-bottom:7px}.ai-advice-row{display:grid;grid-template-columns:1.5fr auto 2fr;gap:8px;padding:7px 0;border-top:1px solid #eee}.ai-advice-row small{color:#666}@media(max-width:650px){.ai-advice-row{grid-template-columns:1fr auto}.ai-advice-row small{grid-column:1/-1}}';document.head.appendChild(st);
setTimeout(()=>{wireSaveButton();injectAdvice();purgeSpotify()},500);
})();
