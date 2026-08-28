/* Auto-avanço iOS — versão 2.
   O botão ✓/Concluído do teclado numérico dispara blur. A versão anterior esperava
   50 ms; no Safari isso deixa o teclado fechar antes do novo focus. Aqui o próximo
   campo recebe focus SINCRONAMENTE no blur, mantendo o teclado aberto quando o ✓
   for usado. Toques manuais em outro campo não são interceptados. */
(function(){
  'use strict';
  var manualTarget=null;

  function isField(el){return !!(el&&el.matches&&el.matches('input.field[data-kind]'));}
  function nextField(el){
    var row=el.closest('.setrow');
    if(!row)return null;
    if(el.dataset.kind==='kg'){
      var reps=row.querySelector('input.field[data-kind="reps"]');
      if(reps)return reps;
    }
    var all=[].slice.call(document.querySelectorAll('input.field[data-kind]'));
    var idx=all.indexOf(el);
    return idx>=0?all[idx+1]||null:null;
  }
  function wire(root){
    (root||document).querySelectorAll('input.field[data-kind]:not([data-auto-next-v2])').forEach(function(input){
      input.setAttribute('data-auto-next-v2','1');
      input.setAttribute('enterkeyhint','next');
      input.addEventListener('touchstart',function(){manualTarget=this},{capture:true,passive:true});
      input.addEventListener('pointerdown',function(){manualTarget=this},{capture:true,passive:true});
      input.addEventListener('focus',function(){
        if(manualTarget===this)manualTarget=null;
      });
      input.addEventListener('blur',function(){
        var el=this;
        if(!String(el.value||'').trim())return;
        if(manualTarget&&manualTarget!==el){manualTarget=null;return;}
        manualTarget=null;
        var next=nextField(el);
        if(!isField(next))return;
        /* Importante: sem setTimeout/requestAnimationFrame. O focus precisa acontecer
           dentro da sequência do blur para o Safari/iOS não encerrar o teclado. */
        try{
          next.focus({preventScroll:true});
        }catch(e){try{next.focus()}catch(_){}}
        try{next.select()}catch(e){}
      });
    });
  }
  wire(document);
  new MutationObserver(function(){wire(document)}).observe(document.documentElement,{childList:true,subtree:true});
})();
