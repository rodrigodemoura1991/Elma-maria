(function(){
  'use strict';
  function recover(){
    try{
      if(!window.data || !data.logs) return;
      let changed=false;
      Object.keys(data.logs).forEach(k=>{
        if(k.endsWith('|draft') || k.endsWith('|completed')) return;
        const l=data.logs[k];
        if(!l || l.draft) return;
        const hasWork=Object.values(l.rows||{}).some(r=>Object.keys(r||{}).some(f=>/^kg\d+$/.test(f)&&String(r[f]).trim()!==''));
        const hasDuration=String(l.duration||'').trim()!=='' || Number(l.timerElapsed)>0;
        if((hasWork && hasDuration) && l.saved!==true){
          l.saved=true;
          l.explicitSaved=true;
          l.completed=true;
          changed=true;
        }
      });
      if(changed && typeof localSave==='function') localSave();
      if(typeof render==='function' && window.current==='Histórico') render();
    }catch(e){console.error('history recovery',e)}
  }
  // Cloud loading happens asynchronously, so run after it has had time to merge.
  [250,800,1600,3000,5000].forEach(ms=>setTimeout(recover,ms));
})();
