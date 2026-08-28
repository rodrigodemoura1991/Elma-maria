/* Meu Treino — timer bridge
   Universal automatic timer: every workout/day gets its own start marker.
   The app owns the timer; this bridge only calls startWorkout().
*/
(function(){
  'use strict';
  const started=new Set();

  function activeDay(){
    const b=document.querySelector('.daystrip button.active');
    const t=(b?.querySelector('small')?.textContent||b?.textContent||'').trim().toUpperCase();
    const map={SEG:'Segunda',TER:'Terça',QUA:'Quarta',QUI:'Quinta',SEX:'Sexta','SÁB':'Sábado',SAB:'Sábado',DOM:'Domingo'};
    return map[t]||t||'Treino';
  }

  function workoutKey(){
    const d=new Date();
    const date=d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
    return activeDay()+'|'+date;
  }

  function isKgField(el){
    if(!(el instanceof HTMLInputElement)) return false;
    if(el.type!=='number') return false;
    const kind=(el.dataset.kind||'').toLowerCase();
    const placeholder=(el.getAttribute('placeholder')||'').toLowerCase();
    const name=(el.name||'').toLowerCase();
    return kind==='kg' || placeholder==='kg' || /kg|carga|peso/.test(name);
  }

  function timerAlreadyRunning(){
    // Do not use the old sessionStorage flag: it survived a manual START
    // and prevented automatic start later on the same workout.
    // Instead, read the visible timer. A non-zero timer means the app is running.
    const nodes=[...document.querySelectorAll('*')];
    return nodes.some(n=>{
      if(n.children.length) return false;
      const t=(n.textContent||'').trim();
      return /^\d{1,2}:\d{2}:\d{2}$/.test(t) && t!=='00:00:00' && t!=='0:00:00';
    });
  }

  function startFromFirstLoad(el){
    if(!isKgField(el)) return;
    const value=String(el.value??'').trim().replace(',','.');
    if(!value || Number(value)<=0) return;

    const key=workoutKey();
    if(started.has(key) || timerAlreadyRunning()) return;
    if(typeof window.startWorkout!=='function') return;

    try{
      window.startWorkout();
      started.add(key);
    }catch(err){
      console.error('auto timer start',err);
    }
  }

  document.addEventListener('input',e=>startFromFirstLoad(e.target),true);
  document.addEventListener('change',e=>startFromFirstLoad(e.target),true);
  document.addEventListener('focusout',e=>startFromFirstLoad(e.target),true);

  // Manual START marks only the currently selected workout/day.
  document.addEventListener('click',e=>{
    const btn=e.target.closest('button');
    if(!btn) return;
    const text=(btn.textContent||'').replace(/\s+/g,' ').trim();
    if(/^▶\s*START$/i.test(text)){
      started.add(workoutKey());
    }
  },true);
})();
