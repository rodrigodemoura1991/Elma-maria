/* Meu Treino — treino oficial fix
   Segunda, exercício 5 é DEFINITIVAMENTE Supino inclinado máquina.
   Corrige a fonte de dados, não apenas o texto exibido.
*/
(function(){
  'use strict';
  function fixExercise(){
    try{
      if(typeof workouts!=='undefined' && workouts.Segunda && workouts.Segunda.ex && workouts.Segunda.ex[4]){
        workouts.Segunda.ex[4][0]='Supino inclinado máquina';
        workouts.Segunda.ex[4][1]=4;
        workouts.Segunda.ex[4][2]='8–10';
      }
    }catch(e){console.error('workout-fix',e)}
  }
  function fixVisible(){
    document.querySelectorAll('body *').forEach(el=>{
      if(el.children.length===0 && el.textContent.trim()==='Supino inclinado com halteres'){
        el.textContent='Supino inclinado máquina';
      }
    });
  }
  const original=window.render;
  if(typeof original==='function' && !window.__workoutFixV2){
    window.render=function(){
      fixExercise();
      const result=original.apply(this,arguments);
      fixVisible();
      return result;
    };
    window.__workoutFixV2=true;
  }
  fixExercise();
  window.addEventListener('load',()=>setTimeout(()=>{fixExercise();fixVisible()},100));
})();
