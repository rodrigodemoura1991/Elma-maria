(function(){
  'use strict';
  function esc2(s){return String(s??'').replace(/[&<>\"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[m]))}
  function blankLog(day,date){return {day,date,rows:{},notes:'',duration:'',avgBpm:'',calories:'',effort:'',cardio:{type:'',duration:'',distance:'',calories:'',avgBpm:''},draft:true}}

  const originalCloudSave=window.cloudSave;
  if(typeof originalCloudSave==='function'){
    window.cloudSave=async function(k){
      const l=data.logs?.[k];
      if(!l || l.completed!==true) return;
      return originalCloudSave(k);
    };
  }

  window.saveWorkout = async function(k){
    const l=data.logs[k];
    if(!l)return;
    if(l.timerStartedAt && typeof stopWorkout==='function') stopWorkout();
    const snapshot=JSON.parse(JSON.stringify(l));
    snapshot.draft=false;
    snapshot.completed=true;
    snapshot.completedAt=new Date().toISOString();
    data.logs[k]=snapshot;
    localSave();
    try{if(typeof cloudSave==='function' && user && sb) await cloudSave(k)}catch(e){console.error('completed workout cloud save',e)}
    const draftKey=k+'|draft';
    data.logs[draftKey]=blankLog(snapshot.day,snapshot.date);
    localSave();
    if(user&&sb){try{await cloudSave(draftKey)}catch(e){console.error('draft save',e)}}
    if(typeof stopWorkout==='function') stopWorkout();
    render();
    setTimeout(()=>alert('Treino salvo no histórico. O treino atual foi limpo.'),50);
  };

  document.addEventListener('click',function(e){
    const btn=e.target.closest('button'); if(!btn)return;
    const text=(btn.textContent||'').replace(/\s+/g,' ').trim();
    if(text!=='✓ Salvar treino')return;
    const raw=btn.getAttribute('onclick')||'';
    const m=raw.match(/save(['\"]([^'\"]+)['\"])/); if(!m)return;
    e.preventDefault(); e.stopImmediatePropagation(); window.saveWorkout(m[2]);
  },true);

  function addEditButtons(){
    document.querySelectorAll('.historyrow').forEach(row=>{
      if(row.querySelector('.edit-history-btn'))return;
      const del=row.querySelector('.smallbtn'); if(!del)return;
      const onclick=del.getAttribute('onclick')||'';
      const m=onclick.match(/deleteLog\(['\"]([^'\"]+)['\"]\)/); if(!m)return;
      const k=m[1];
      if(data.logs[k]?.draft || k.endsWith('|draft')){row.style.display='none';return}
      const b=document.createElement('button'); b.type='button'; b.className='secondary smallbtn edit-history-btn'; b.textContent='✏️ Editar'; b.onclick=()=>window.editHistory(k);
      del.parentNode.insertBefore(b,del);
    });
  }

  window.editHistory=function(k){
    const l=data.logs[k]; if(!l)return;
    const day=l.day?.split(' — ')[0]||l.day, ex=workouts[day]?.ex||[];
    const c=l.cardio||{};
    const cardioTypesLocal=typeof cardioTypes!=='undefined'?cardioTypes:['Bicicleta','Esteira / caminhada','Corrida','Elíptico','Outro'];
    const cardioOptions=cardioTypesLocal.map(t=>`<option value="${esc2(t)}" ${String(c.type||'')===String(t)?'selected':''}>${esc2(t)}</option>`).join('');
    const modal=document.createElement('div'); modal.id='historyEditModal';
    modal.innerHTML=`<div class="history-edit-backdrop"></div><div class="history-edit-modal"><div class="history-edit-head"><div><span>EDITAR REGISTRO</span><h2>${esc2(l.day||day)}</h2><small>${esc2(l.date||'')}</small></div><button type="button" class="secondary" id="historyEditClose">Fechar</button></div><div class="history-edit-body">${ex.map((e,i)=>{const r=l.rows?.[i]||{};return `<section class="history-edit-ex"><h3>${i+1}. ${esc2(e[0])}</h3><p>${e[1]} séries • ${esc2(e[2])} reps</p>${Array.from({length:e[1]},(_,s)=>`<div class="history-edit-set"><b>${s+1}</b><input type="number" step="0.5" data-e="${i}" data-s="${s}" data-f="kg" value="${esc2(r['kg'+s]??'')}" placeholder="kg"><input type="number" data-e="${i}" data-s="${s}" data-f="reps" value="${esc2(r['reps'+s]??'')}" placeholder="reps"></div>`).join('')}<textarea data-obs="${i}" placeholder="Observação">${esc2(r.observation||'')}</textarea></section>`}).join('')}<section class="history-edit-ex"><h3>📊 Métricas</h3><div class="history-edit-metrics"><label>Tempo<input id="editDuration" value="${esc2(l.duration||'')}"></label><label>BPM médio<input type="number" id="editBpm" value="${esc2(l.avgBpm||'')}"></label><label>Calorias<input type="number" id="editCalories" value="${esc2(l.calories||'')}"></label><label>RPE<select id="editEffort"><option value="">RPE</option>${Array.from({length:10},(_,i)=>`<option value="${i+1}" ${String(l.effort)===String(i+1)?'selected':''}>${i+1}/10</option>`).join('')}</select></div><h3 class="history-edit-subtitle">🚴 Cardio</h3><div class="history-edit-cardio"><label>Tipo<select id="editCardioType"><option value="">Sem cardio</option>${cardioOptions}</select></label><label>Duração<input id="editCardioDuration" value="${esc2(c.duration||'')}" placeholder="ex.: 20 min"></label><label>Distância<input id="editCardioDistance" value="${esc2(c.distance||'')}" placeholder="ex.: 5 km"></label><label>Calorias<input type="number" id="editCardioCalories" value="${esc2(c.calories||'')}" placeholder="kcal"></label><label>BPM médio<input type="number" id="editCardioBpm" value="${esc2(c.avgBpm||'')}" placeholder="bpm"></label></div><textarea id="editNotes" placeholder="Observações gerais">${esc2(l.notes||'')}</textarea></section></div><div class="history-edit-actions"><button type="button" class="secondary" id="historyEditCancel">Cancelar</button><button type="button" class="primary" id="historyEditSave">✓ Salvar alterações</button></div></div>`;
    document.body.appendChild(modal);
    const close=()=>modal.remove(); modal.querySelector('#historyEditClose').onclick=close; modal.querySelector('#historyEditCancel').onclick=close; modal.querySelector('.history-edit-backdrop').onclick=close;
    modal.querySelector('#historyEditSave').onclick=()=>{
      const target=data.logs[k]; if(!target)return; target.rows=target.rows||{}; target.cardio=target.cardio||{};
      ex.forEach((e,i)=>{target.rows[i]=target.rows[i]||{};for(let s=0;s<e[1];s++){const kg=modal.querySelector(`[data-e="${i}"][data-s="${s}"][data-f="kg"]`),reps=modal.querySelector(`[data-e="${i}"][data-s="${s}"][data-f="reps"]`);target.rows[i]['kg'+s]=kg?.value||'';target.rows[i]['reps'+s]=reps?.value||''}const obs=modal.querySelector(`[data-obs="${i}"]`);target.rows[i].observation=obs?.value||''});
      target.duration=modal.querySelector('#editDuration').value;target.avgBpm=modal.querySelector('#editBpm').value;target.calories=modal.querySelector('#editCalories').value;target.effort=modal.querySelector('#editEffort').value;target.notes=modal.querySelector('#editNotes').value;
      target.cardio.type=modal.querySelector('#editCardioType').value;target.cardio.duration=modal.querySelector('#editCardioDuration').value;target.cardio.distance=modal.querySelector('#editCardioDistance').value;target.cardio.calories=modal.querySelector('#editCardioCalories').value;target.cardio.avgBpm=modal.querySelector('#editCardioBpm').value;
      target.draft=false;target.completed=true;localSave();if(typeof queueSave==='function')queueSave(k);close();render();
    };
  };

  const oldRender=window.render;
  if(typeof oldRender==='function'){window.render=function(){oldRender.apply(this,arguments);setTimeout(addEditButtons,0)}}
  else setTimeout(addEditButtons,0);

  const style=document.createElement('style');style.textContent=`.edit-history-btn{margin-right:6px!important}#historyEditModal{position:fixed;inset:0;z-index:9999}.history-edit-backdrop{position:absolute;inset:0;background:rgba(0,0,0,.62);backdrop-filter:blur(4px)}.history-edit-modal{position:absolute;left:50%;top:4%;transform:translateX(-50%);width:min(94vw,760px);max-height:92vh;display:flex;flex-direction:column;background:#fff;border-radius:22px;box-shadow:0 20px 60px rgba(0,0,0,.35);overflow:hidden;color:#17202a}.history-edit-head{padding:18px 20px;border-bottom:1px solid #e6e9ee;display:flex;justify-content:space-between;align-items:center}.history-edit-head span{font-size:11px;font-weight:800;color:#6b7280}.history-edit-head h2{margin:3px 0;font-size:20px}.history-edit-head small{color:#6b7280}.history-edit-body{overflow:auto;padding:14px}.history-edit-ex{border:1px solid #e5e7eb;border-radius:14px;padding:12px;margin-bottom:12px}.history-edit-ex h3{margin:0 0 3px;font-size:15px}.history-edit-ex p{margin:0 0 10px;color:#6b7280;font-size:12px}.history-edit-set{display:grid;grid-template-columns:28px 1fr 1fr;gap:8px;align-items:center;margin:6px 0}.history-edit-set b{text-align:center}.history-edit-set input,.history-edit-ex textarea,.history-edit-metrics input,.history-edit-metrics select{width:100%;box-sizing:border-box;border:1px solid #d9dde4;border-radius:9px;padding:9px;background:#fff;color:#17202a}.history-edit-ex textarea{min-height:52px;margin-top:8px;resize:vertical}.history-edit-metrics{display:grid;grid-template-columns:repeat(2,1fr);gap:8px}.history-edit-metrics label{font-size:11px;font-weight:700;color:#6b7280}.history-edit-cardio{display:grid;grid-template-columns:repeat(2,1fr);gap:8px;margin:8px 0}.history-edit-cardio label{font-size:11px;font-weight:700;color:#6b7280}.history-edit-cardio input,.history-edit-cardio select{width:100%;box-sizing:border-box;border:1px solid #d9dde4;border-radius:9px;padding:9px;background:#fff;color:#17202a}.history-edit-subtitle{margin:16px 0 8px!important;font-size:15px!important}.history-edit-actions{padding:12px 14px;border-top:1px solid #e6e9ee;display:flex;justify-content:flex-end;gap:8px}.history-edit-actions button{padding:11px 14px;border-radius:10px;border:0}.history-edit-actions .primary{background:#111827;color:#fff}`;document.head.appendChild(style);
})();