(()=>{
'use strict';

// CORREÇÃO DEFINITIVA DO BOTÃO EDITAR DO HISTÓRICO.
// O clique é interceptado antes do onclick antigo, identifica o dia/data
// visíveis no próprio cartão e abre exatamente aquele registro.
function parseHistoryTarget(btn){
  let el=btn;
  for(let i=0;i<7 && el;i++,el=el.parentElement){
    const text=(el.innerText||'').replace(/\s+/g,' ').trim();
    const m=text.match(/\b(Segunda|Terça|Quarta|Quinta|Sexta|Sábado|Domingo)\b[^\d]{0,80}(\d{2})\/(\d{2})\/(\d{4})/i);
    if(m){
      const day=m[1], date=`${m[4]}-${m[3]}-${m[2]}`;
      const k=key(day,date);
      if(data?.logs?.[k]) return {day,date,k};
    }
  }
  return null;
}

function openExactEdit(target){
  if(!target || !data?.logs?.[target.k]) return false;
  stopGeneralTimer?.(false);
  drafts[target.k]=clone(data.logs[target.k]);
  current=target.day;
  editDate=target.date;
  // Marca explicitamente que a próxima renderização é uma edição.
  window.__editingHistoryKey=target.k;
  render();
  return true;
}

function intercept(ev){
  const btn=ev.target?.closest?.('button');
  if(!btn) return;
  const label=(btn.innerText||btn.textContent||'').trim().toLowerCase();
  if(label!=='editar') return;
  const target=parseHistoryTarget(btn);
  if(!target) return;
  ev.preventDefault();
  ev.stopPropagation();
  if(ev.stopImmediatePropagation) ev.stopImmediatePropagation();
  openExactEdit(target);
}

document.addEventListener('click',intercept,true);

// Também corrige a função global para qualquer chamada direta futura.
window.editLog=function(k){
  if(!data?.logs?.[k]) return;
  stopGeneralTimer?.(false);
  drafts[k]=clone(data.logs[k]);
  current=data.logs[k].day;
  editDate=data.logs[k].date;
  window.__editingHistoryKey=k;
  render();
};
})();
