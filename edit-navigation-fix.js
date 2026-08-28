/* CORREÇÃO: EDITAR NO HISTÓRICO
   O registro editado deve abrir exatamente o mesmo DIA e DATA do cartão clicado.
   Não reutiliza o treino atualmente selecionado nem força Quarta-feira.
*/
(function(){
  'use strict';

  function parseKey(k){
    const p=String(k||'').split('|');
    return {day:p[0]||'',date:p[1]||''};
  }

  function fixedEditLog(k){
    const parsed=parseKey(k);
    let log=(typeof data!=='undefined' && data.logs) ? data.logs[k] : null;

    // Se o objeto não estiver exatamente na chave recebida, localiza pelo dia/data.
    if(!log && typeof data!=='undefined' && data.logs){
      const found=Object.entries(data.logs).find(([key,l])=>key===k || (l && l.day===parsed.day && l.date===parsed.date));
      if(found){ k=found[0]; log=found[1]; }
    }
    if(!log) return;

    // Nunca usa o treino anterior/current para decidir a edição.
    drafts[k]=clone(log);
    current=String(log.day||parsed.day);
    editDate=String(log.date||parsed.date);
    if(typeof window.render==='function') window.render();
  }

  // Inline onclick="editLog(...)" consulta a propriedade global.
  window.editLog=fixedEditLog;
})();
