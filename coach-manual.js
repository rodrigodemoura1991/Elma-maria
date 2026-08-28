(()=>{
  const KEY='meu_treino_coach_manual_v1';
  let lastRun='';
  try{lastRun=sessionStorage.getItem(KEY)||''}catch(e){}

  function injectStyle(){
    if(document.getElementById('coachManualStyle'))return;
    const s=document.createElement('style');s.id='coachManualStyle';
    s.textContent='.coachManualActions{display:grid;grid-template-columns:1fr auto;gap:12px;align-items:center;margin-top:16px;padding:14px 16px;border:1px solid #ffd8b5;border-radius:14px;background:#fff8f1}.coachAutoState{display:flex;flex-direction:column;gap:3px}.coachAutoState b{font-size:13px;color:#b64d00}.coachAutoState small,.coachManualNote{font-size:11px;color:#687386}.coachLiveDot{width:8px;height:8px;border-radius:50%;background:#16a34a;display:inline-block;margin-right:6px;box-shadow:0 0 0 4px #dcfce7;align-self:flex-start;margin-bottom:-10px;margin-left:1px}.coachManualBtn{border:0;border-radius:11px;padding:12px 18px;background:#f36b00;color:#fff;font-weight:800;cursor:pointer;white-space:nowrap}.coachManualBtn:hover{filter:brightness(.96)}.coachManualBtn:disabled{opacity:.7;cursor:wait}.coachManualNote{grid-column:1/-1}@media(max-width:600px){.coachManualActions{grid-template-columns:1fr}.coachManualBtn{width:100%}}';
    document.head.appendChild(s);
  }
  function mode(){return window.__reportMode||'week'}
  function stamp(){return new Date().toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})}
  function addButton(){
    injectStyle();
    const card=document.querySelector('.coachReportCard');
    if(!card||card.querySelector('.coachManualActions'))return;
    const actions=document.createElement('div');
    actions.className='coachManualActions';
    actions.innerHTML='<div class="coachAutoState"><b><span class="coachLiveDot"></span>Análise automática ATIVA</b><small>O Coach IA é atualizado automaticamente com os registros salvos.</small></div><button type="button" class="coachManualBtn">🤖 ANALISAR AGORA</button>';
    card.insertBefore(actions,card.querySelector('.coachNext')||null);
    const btn=actions.querySelector('.coachManualBtn');
    btn.addEventListener('click',()=>{
      btn.disabled=true;
      btn.textContent='⏳ ANALISANDO...';
      const selectedMode=mode();
      lastRun=stamp();
      try{sessionStorage.setItem(KEY,lastRun)}catch(e){}
      // Reexecuta a análise do período atual sem criar registros ou alterar treinos.
      setTimeout(()=>{
        if(typeof window.setReportMode==='function')window.setReportMode(selectedMode);
        else window.location.reload();
      },120);
    });
    if(lastRun){
      const note=document.createElement('small');
      note.className='coachManualNote';
      note.textContent='Última análise manual: '+lastRun;
      actions.appendChild(note);
    }
  }

  const observer=new MutationObserver(()=>setTimeout(addButton,0));
  observer.observe(document.documentElement,{childList:true,subtree:true});
  window.addEventListener('load',addButton);
  setTimeout(addButton,300);
})();
