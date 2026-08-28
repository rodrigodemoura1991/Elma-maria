/* Ajuste de interface: RPE -> ESFORÇO */
(function(){
  const labels=['Leve','Moderado','Pesado','Muito pesado'];
  function mapOld(v){
    const n=parseInt(v,10);
    if(!Number.isNaN(n)) return n<=4?'Leve':n<=6?'Moderado':n<=8?'Pesado':'Muito pesado';
    return v;
  }
  function apply(){
    document.querySelectorAll('.stat span').forEach(el=>{
      if(el.textContent.trim()==='RPE') el.textContent='Esforço';
    });
    document.querySelectorAll('.metrics label').forEach(el=>{
      if(el.textContent.trim()==='ESFORÇO') el.textContent='ESFORÇO';
    });
    document.querySelectorAll('.metrics select').forEach(sel=>{
      if(sel.dataset.esforco==='1') return;
      sel.dataset.esforco='1';
      const current=mapOld(sel.value);
      sel.innerHTML='<option value="">Selecione</option>'+labels.map(x=>'<option value="'+x+'">'+x+'</option>').join('');
      if(current) sel.value=current;
      sel.addEventListener('change',function(){
        if(typeof metric==='function') metric('effort',this.value);
      });
    });
  }
  const obs=new MutationObserver(apply);
  obs.observe(document.documentElement,{childList:true,subtree:true});
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',apply); else apply();
})();
