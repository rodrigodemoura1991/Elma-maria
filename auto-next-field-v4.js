/* Auto-avanço iOS — mantém o teclado aberto ao avançar. */
(function(){
  'use strict';
  var manualTarget=null;
  function isField(el){return !!(el&&el.matches&&el.matches('input.field[data-kind]'));}
  function nextField(el){
    var row=el.closest('.setrow');
    if(!row)return null;
    if(el.dataset.kind==='kg')return row.querySelector('input.field[data-kind="reps"]');
    var all=[].slice.call(document.querySelectorAll('input.field[data-kind]'));
    var idx=all.indexOf(el);
    return idx>=0?all[idx+1]||null:null;
  }
  function focusNext(next){
    if(!isField(next))return;
    try{next.focus({preventScroll:true});}catch(e){try{next.focus();}catch(_){} }
    /* Se o Safari concluir o fechamento do teclado depois do blur,
       recupera o foco no ciclo seguinte, sem o select() que causava o sumiço. */
    if(document.activeElement!==next)setTimeout(function(){
      if(document.activeElement!==next){try{next.focus({preventScroll:true});}catch(e){try{next.focus();}catch(_){} }}
    },0);
  }
  function wire(root){
    (root||document).querySelectorAll('input.field[data-kind]:not([data-auto-next-v4])').forEach(function(input){
      input.setAttribute('data-auto-next-v4','1');
      input.setAttribute('enterkeyhint','next');
      input.addEventListener('touchstart',function(){manualTarget=this;},{capture:true,passive:true});
      input.addEventListener('pointerdown',function(){manualTarget=this;},{capture:true,passive:true});
      input.addEventListener('focus',function(){if(manualTarget===this)manualTarget=null;});
      input.addEventListener('keydown',function(e){
        if(e.key!=='Enter')return;
        var next=nextField(this);if(!isField(next))return;
        e.preventDefault();e.stopPropagation();manualTarget=null;focusNext(next);
      },true);
      input.addEventListener('blur',function(){
        var el=this;
        if(!String(el.value||'').trim())return;
        if(manualTarget&&manualTarget!==el){manualTarget=null;return;}
        manualTarget=null;
        focusNext(nextField(el));
      });
    });
  }
  wire(document);
  new MutationObserver(function(){wire(document)}).observe(document.documentElement,{childList:true,subtree:true});
})();
