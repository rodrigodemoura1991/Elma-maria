/* COACH IA — análise dentro da aba Treino.
   Usa os registros salvos + meta de repetições do exercício para gerar uma orientação
   prática de progressão. Não altera cargas automaticamente. */
(function(){
  'use strict';
  const KEY='meu_treino_reset_v2';
  const PLAN={SEG:'Segunda',TER:'Terça',QUA:'Quarta',QUI:'Quinta',SEX:'Sexta',SAB:'Sábado',DOM:'Domingo'};
  const num=v=>{const n=Number(String(v??'').replace(',','.'));return Number.isFinite(n)?n:0};
  const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const read=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'{"logs":{}}')}catch(e){return{logs:{}}}};
  const logs=()=>Object.values(read().logs||{}).filter(l=>l&&l.completed!==false&&l.date);
  const sets=(log,i)=>{const r=log?.rows?.[i]||{},out=[];for(let s=0;s<20;s++){const kg=num(r['kg'+s]),rep=num(r['reps'+s]);if(kg>0&&rep>0)out.push({kg,rep});}return out};
  const volume=a=>a.reduce((n,s)=>n+s.kg*s.rep,0);
  const best=a=>a.reduce((x,s)=>!x||s.kg>x.kg||(s.kg===x.kg&&s.rep>x.rep)?s:x,null);
  const range=t=>{const m=String(t||'').match(/(\d+)\s*[–-]\s*(\d+)/);return m?[+m[1],+m[2]]:[0,0]};
  function dayFromUI(){const b=document.querySelector('.daystrip button.active small');const k=String(b?.textContent||'').trim().toUpperCase();return PLAN[k]||'Segunda'}
  function today(){const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')}
  function previous(day,i,date){return logs().filter(l=>l.day===day&&l.date<date&&sets(l,i).length).sort((a,b)=>String(b.date).localeCompare(String(a.date))).slice(0,4)}
  function advice(day,i,name,target,date){
    const hist=previous(day,i,date),cur=hist[0],prev=hist[1],[lo,hi]=range(target);
    if(!cur)return {icon:'🎯',action:'PRIMEIRO REGISTRO',text:`Meta ${target} reps. Faça as séries dentro da faixa e use esta sessão como referência para a próxima progressão.`,detail:''};
    const cs=sets(cur,i),ps=prev?sets(prev,i):[],cb=best(cs),pb=best(ps||[]);
    const allTop=cs.length>0&&cs.every(s=>s.rep>=hi),anyBelow=cs.some(s=>s.rep<lo),avg=cs.reduce((a,s)=>a+s.rep,0)/cs.length;
    const lastLoad=cb?.kg||0,prevLoad=pb?.kg||0;
    let action='MANTER CARGA',icon='🎯',text=`Último treino: ${lastLoad} kg, média ${avg.toFixed(1)} reps. Meta ${target}.`;
    if(allTop){action='AUMENTAR CARGA';icon='🚀';const next=lastLoad*1.025;text=`Você atingiu o topo (${hi}) em todas as séries. Suba cerca de 2,5%: ${lastLoad} → ${next.toFixed(1)} kg, arredondando para a carga disponível, e volte para a parte baixa da faixa.`;}
    else if(anyBelow){action='MANTER CARGA';icon='🎯';text=`Mantenha ${lastLoad} kg. Há série(s) abaixo de ${lo} reps; primeiro busque completar a faixa ${target} com boa execução.`;}
    else if(prev&&lastLoad>prevLoad){action='CONSOLIDAR CARGA';icon='🧱';text=`Você aumentou de ${prevLoad} para ${lastLoad} kg. Consolide essa carga até dominar a faixa ${target} antes de subir novamente.`;}
    else if(prev&&lastLoad===prevLoad&&volume(cs)>volume(ps)){action='AUMENTAR REP';icon='📈';text=`Mantenha ${lastLoad} kg e tente ganhar 1–2 reps. O volume aumentou em relação ao treino anterior.`;}
    else if(prev&&lastLoad===prevLoad&&cb.rep===pb.rep){action='AUMENTAR REP';icon='🔁';text=`Repita ${lastLoad} kg e tente acrescentar 1–2 reps sem perder a técnica.`;}
    const detail=`Último: ${cs.map(s=>`${s.kg}×${s.rep}`).join(' · ')}${prev?` | Anterior: ${ps.map(s=>`${s.kg}×${s.rep}`).join(' · ')}`:''}`;
    return {icon,action,text,detail};
  }
  function planFromDOM(){return [...document.querySelectorAll('.exercise-grid .exercise')].map((card,i)=>({name:card.querySelector('.exname')?.textContent?.trim()||'',target:card.querySelector('.tag')?.textContent?.trim()||'',i}))}
  let lastSignature='';
  function render(){
    const grid=document.querySelector('.exercise-grid');if(!grid)return;
    const day=dayFromUI(),date=today(),items=planFromDOM().map(x=>({...x,...advice(day,x.i,x.name,x.target,date)}));
    const signature=JSON.stringify([day,date,items.map(x=>[x.name,x.target,x.action,x.text,x.detail])]);
    if(signature===lastSignature)return;lastSignature=signature;
    let panel=document.getElementById('coachWorkoutPanel');
    if(!panel){panel=document.createElement('div');panel.id='coachWorkoutPanel';panel.className='card coachWorkoutPanel';grid.parentNode.insertBefore(panel,grid);}
    panel.innerHTML=`<div class="coachWorkoutHead"><div><b>🤖 COACH IA • PROGRESSÃO</b><small>Análise automática usando cargas, repetições e a meta de cada exercício.</small></div><button type="button" id="coachWorkoutAnalyze">ANALISAR AGORA</button></div><div class="coachWorkoutSummary">${items.length?'A orientação considera o último e o penúltimo registro, a faixa de reps, a carga máxima e o volume. Ela indica quando manter, ganhar reps, consolidar ou subir a carga.':'Nenhum exercício configurado para este dia.'}</div>`;
    const btn=panel.querySelector('#coachWorkoutAnalyze');if(btn)btn.onclick=()=>{lastSignature='';btn.disabled=true;btn.textContent='ANALISANDO...';setTimeout(()=>{btn.disabled=false;btn.textContent='ANALISAR AGORA';render()},80)};
    grid.querySelectorAll('.exercise').forEach((card,i)=>{const item=items[i];if(!item)return;let box=card.querySelector('.coachAiBox');if(!box){box=document.createElement('div');box.className='coachAiBox';const setsEl=card.querySelector('.sets');if(setsEl&&setsEl.parentNode)setsEl.parentNode.insertBefore(box,setsEl.nextSibling);else card.appendChild(box)}box.innerHTML=`<div class="coachIcon">${item.icon}</div><div><div class="coachTitle">COACH IA • ${esc(item.action)}</div><div class="coachAction">${esc(item.name)}</div><span class="coachReason">${esc(item.text)}</span>${item.detail?`<small class="coachDetail">${esc(item.detail)}</small>`:''}</div>`});
  }
  let timer=0;const obs=new MutationObserver(()=>{clearTimeout(timer);timer=setTimeout(render,80)});obs.observe(document.documentElement,{childList:true,subtree:true});window.addEventListener('load',()=>setTimeout(render,300));window.addEventListener('storage',()=>{lastSignature='';setTimeout(render,50)});
})();
