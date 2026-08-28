(()=>{
'use strict';
function installCloudEditSave(){
  if(typeof window.editHistoryModal!=='function'||window.__cloudEditSaveFixed)return;
  window.__cloudEditSaveFixed=true;
  const original=window.editHistoryModal;
  window.editHistoryModal=function(k){
    original(k);
    setTimeout(()=>{
      const modal=document.getElementById('historyEditModal');
      const btn=modal?.querySelector('#historyEditSave');
      if(!btn||btn.dataset.cloudFix)return;
      btn.dataset.cloudFix='1';
      btn.addEventListener('click',async e=>{
        e.preventDefault();e.stopImmediatePropagation();
        const target=data.logs?.[k];
        if(!target){alert('Registro não encontrado.');return}
        const day=String(target.day||'').split(' — ')[0], ex=workouts[day]?.ex||[];
        target.rows=target.rows||{};target.cardio=target.cardio||{};
        ex.forEach((exercise,i)=>{
          target.rows[i]=target.rows[i]||{};
          for(let s=0;s<exercise[1];s++){
            target.rows[i]['kg'+s]=modal.querySelector(`[data-e="${i}"][data-s="${s}"][data-f="kg"]`)?.value||'';
            target.rows[i]['reps'+s]=modal.querySelector(`[data-e="${i}"][data-s="${s}"][data-f="reps"]`)?.value||'';
          }
          target.rows[i].observation=modal.querySelector(`[data-obs="${i}"]`)?.value||'';
        });
        target.duration=modal.querySelector('#editDuration')?.value||'';
        target.avgBpm=modal.querySelector('#editBpm')?.value||'';
        target.calories=modal.querySelector('#editCalories')?.value||'';
        target.effort=modal.querySelector('#editEffort')?.value||'';
        target.notes=modal.querySelector('#editNotes')?.value||'';
        target.cardio.type=modal.querySelector('#editCardioType')?.value||'';
        target.cardio.duration=modal.querySelector('#editCardioDuration')?.value||'';
        target.cardio.distance=modal.querySelector('#editCardioDistance')?.value||'';
        target.cardio.calories=modal.querySelector('#editCardioCalories')?.value||'';
        target.cardio.avgBpm=modal.querySelector('#editCardioBpm')?.value||'';
        target.completed=true;
        target.tonnageKg=typeof volumeForLog==='function'?volumeForLog(target):target.tonnageKg;
        target.tonnes=(Number(target.tonnageKg)||0)/1000;
        try{
          if(!sb)throw new Error('Supabase não está conectado.');
          const sessionResult=await sb.auth.getSession();
          const session=sessionResult?.data?.session;
          if(!session?.user?.id)throw new Error('Sua sessão do Supabase não está ativa. Entre novamente em Dados.');
          user=session.user;
          btn.disabled=true;btn.textContent='SALVANDO...';
          const {error}=await sb.from('workout_logs').upsert({user_id:user.id,log_key:CLOUD_PREFIX+k,day:target.day,workout_date:target.date,payload:target,updated_at:new Date().toISOString()},{onConflict:'user_id,log_key'});
          if(error)throw error;
          data.logs[k]=clone(target);
          if(typeof persist==='function')persist();
          cloudReady=true;
          setStatus('☁ Online • salvo',true);
          modal.remove();
          if(typeof render==='function')render();
        }catch(err){
          console.error('history edit cloud save',err);
          setStatus('⚠ Não salvo na nuvem');
          alert('Não foi possível salvar no Supabase.\n\n'+(err?.message||err));
        }finally{btn.disabled=false;btn.textContent='✓ Salvar alterações'}
      },true);
    },0);
  };
}
if(typeof window.editHistoryModal==='function')installCloudEditSave();
else new MutationObserver(installCloudEditSave).observe(document.documentElement,{childList:true,subtree:true});
})();
