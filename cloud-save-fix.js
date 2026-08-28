/* CORREÇÃO DE SALVAMENTO / EDIÇÃO
   - Edição sempre fica salva localmente primeiro.
   - Tenta recuperar a sessão do Supabase antes de enviar a alteração.
   - Se a nuvem estiver indisponível, não transforma o salvamento local em erro.
   - Quando a sessão volta, os próximos salvamentos usam a nuvem normalmente.
*/
(function(){
  'use strict';

  function localStatus(){
    if(typeof setStatus==='function') setStatus('☁ Salvo neste aparelho',false);
  }

  async function recoverSession(){
    try{
      if(typeof sb==='undefined' || !sb || !sb.auth) return false;
      const r=await sb.auth.getSession();
      const s=r&&r.data&&r.data.session;
      if(s&&s.user){
        user=s.user;
        return true;
      }
    }catch(e){ console.warn('sessão Supabase',e); }
    return false;
  }

  async function fixedCloudSave(k){
    if(typeof data==='undefined' || !data.logs || !data.logs[k]) return;
    if(typeof sb==='undefined' || !sb){ localStatus(); return; }

    if(!user){
      const ok=await recoverSession();
      if(!ok){ localStatus(); return; }
    }

    try{
      const l=data.logs[k];
      const r=await sb.from('workout_logs').upsert({
        user_id:user.id,
        log_key:(typeof CLOUD_PREFIX!=='undefined'?CLOUD_PREFIX:'resetv1|')+k,
        day:l.day,
        workout_date:l.date,
        payload:l,
        updated_at:new Date().toISOString()
      },{onConflict:'user_id,log_key'});
      if(r.error) throw r.error;
      cloudReady=true;
      if(typeof setStatus==='function') setStatus('☁ Online • salvo',true);
    }catch(e){
      console.warn('cloud save',e);
      cloudReady=false;
      localStatus();
    }
  }

  // Substitui a função global usada pelo salvamento do treino.
  try{ window.cloudSave=fixedCloudSave; }catch(e){}

  // Recupera uma sessão já existente sem exigir novo login.
  async function sync(){
    if(typeof sb==='undefined' || !sb || !sb.auth) return;
    try{
      const r=await sb.auth.getSession();
      const s=r&&r.data&&r.data.session;
      if(s&&s.user){
        user=s.user;
        cloudReady=true;
        if(typeof setStatus==='function') setStatus('☁ Online • salvo',true);
      }
    }catch(e){ console.warn('cloud session',e); }
  }

  window.addEventListener('load',function(){setTimeout(sync,500)});
})();
