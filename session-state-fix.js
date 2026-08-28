(()=>{
'use strict';

// Depois de salvar, o histórico continua em data.logs, mas a tela de treino
// deve iniciar uma nova sessão vazia. Registros antigos só entram na tela
// quando estamos explicitamente editando um registro pelo Histórico.
window.ensureDraft=function(day=current,date=(editDate||today())){
  const k=key(day,date);
  if(!drafts[k]){
    const editing=!!editDate;
    drafts[k]=editing && data.logs[k] ? clone(data.logs[k]) : blankLog(day,date);
  }
  return drafts[k];
};

window.activeLog=function(day=current,date=(editDate||today())){
  const k=key(day,date);
  if(drafts[k])return drafts[k];
  if(editDate && data.logs[k])return data.logs[k];
  return null;
};

// Limpa somente a sessão em andamento. Um treino já salvo nunca é apagado
// por este botão; a exclusão definitiva continua no Histórico > Excluir.
window.clearDay=function(){
  const k=key(current,activeDate());
  if(drafts[k])delete drafts[k];
  if(generalTimer){clearInterval(generalTimer);generalTimer=null;}
  if(editDate)editDate=null;
  render();
};

})();
