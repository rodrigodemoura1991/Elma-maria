/* Meu Treino — Coach IA */
(function(){
  'use strict';
  const PROJECT='https://uvujytjdafcyacawcirp.supabase.co';
  const FN=PROJECT+'/functions/v1/coach-ai';
  const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const today=()=>{const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')};
  function styles(){
    if(document.getElementById('coach-ai-style'))return;
    const s=document.createElement('style');s.id='coach-ai-style';s.textContent=`
      .coach-ai{margin:14px 0 18px;padding:20px;border:1px solid #e4e7eb;border-radius:22px;background:linear-gradient(135deg,#fff,#fff8f1);box-shadow:0 8px 24px rgba(20,30,40,.06)}
      .coach-head{display:flex;align-items:center;justify-content:space-between;gap:12px}.coach-title{font-weight:900;font-size:19px;color:#1f2733}.coach-sub{font-size:12px;color:#7d8794;margin-top:3px}.coach-badge{font-size:12px;font-weight:800;color:#e46b20;background:#fff0e5;padding:7px 10px;border-radius:999px;white-space:nowrap}
      .coach-btn{width:100%;margin-top:14px;border:0;border-radius:14px;padding:13px 16px;background:#e86f22;color:#fff;font-size:15px;font-weight:900;cursor:pointer}.coach-btn:disabled{opacity:.65}.coach-result{margin-top:16px}.coach-score{display:flex;align-items:center;gap:10px;margin-bottom:10px}.coach-score strong{font-size:28px;color:#e86f22}.coach-headline{font-weight:900;font-size:16px;color:#202833}.coach-summary{color:#596575;line-height:1.45;margin:8px 0 14px}.coach-cols{display:grid;grid-template-columns:1fr 1fr;gap:10px}.coach-box{background:#f7f8fa;border-radius:14px;padding:12px}.coach-box h4{margin:0 0 7px;font-size:12px;text-transform:uppercase;letter-spacing:.08em;color:#788391}.coach-box ul{margin:0;padding-left:18px;color:#3f4854;font-size:13px;line-height:1.5}.coach-next{margin-top:10px;padding:12px 14px;background:#fff;border:1px solid #eceff2;border-radius:14px;font-size:13px;color:#424b57}.coach-error{color:#b33131;font-size:13px;margin-top:10px}@media(max-width:560px){.coach-cols{grid-template-columns:1fr}.coach-badge{display:none}}
    `;document.head.appendChild(s);
  }
  function history(){
    try{return Object.values(data?.logs||{}).filter(l=>l&&l.date&&l.date!==today()).sort((a,b)=>String(b.date).localeCompare(String(a.date))).slice(0,8)}catch(e){return []}
  }
  function mount(){
    styles();
    const old=document.getElementById('coach-ai-card');if(old)old.remove();
    if(typeof days==='undefined'||!days.includes(current))return;
    const strip=document.querySelector('.daystrip');if(!strip)return;
    const card=document.createElement('section');card.id='coach-ai-card';card.className='coach-ai';
    card.innerHTML=`<div class="coach-head"><div><div class="coach-title">✨ Coach IA</div><div class="coach-sub">Análise inteligente do seu treino</div></div><span class="coach-badge">IA</span></div><button id="coach-ai-btn" class="coach-btn" type="button">ANALISAR TREINO COM IA</button><div id="coach-ai-result" class="coach-result"></div>`;
    strip.parentNode.insertBefore(card,strip.nextSibling);
    document.getElementById('coach-ai-btn').addEventListener('click',analyze);
  }
  function list(items){return (items||[]).length?'<ul>'+items.map(x=>'<li>'+esc(x)+'</li>').join('')+'</ul>':'<div style="font-size:13px;color:#8a939f">Nenhum ponto registrado.</div>'}
  async function analyze(){
    const btn=document.getElementById('coach-ai-btn'),out=document.getElementById('coach-ai-result');if(!btn||!out)return;
    btn.disabled=true;btn.textContent='ANALISANDO...';out.innerHTML='<div style="font-size:13px;color:#7b8591">A IA está comparando seu treino com o histórico...</div>';
    try{
      const client=typeof sb!=='undefined'?sb:null;
      const session=client?await client.auth.getSession():{data:{session:null}};
      const token=session?.data?.session?.access_token;
      if(!token)throw new Error('Faça login no app para usar o Coach IA.');
      const k=current+'|'+today();
      const log=data?.logs?.[k]||{day:current,date:today(),rows:{},cardio:{}};
      const title=workouts?.[current]?.title||current;
      const r=await fetch(FN,{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+token},body:JSON.stringify({day:current,title,log,history:history()})});
      const p=await r.json();if(!r.ok||p.error)throw new Error(p.error||'Não foi possível analisar o treino.');
      out.innerHTML=`<div class="coach-score"><strong>${Number(p.score).toFixed(1)}</strong><div><div class="coach-headline">${esc(p.headline)}</div><div style="font-size:11px;color:#8a939f">Nota do treino</div></div></div><div class="coach-summary">${esc(p.summary)}</div><div class="coach-cols"><div class="coach-box"><h4>Pontos fortes</h4>${list(p.highlights)}</div><div class="coach-box"><h4>Atenção</h4>${list(p.attention)}</div></div><div class="coach-box" style="margin-top:10px"><h4>Recomendações</h4>${list(p.recommendations)}</div><div class="coach-next"><b>Próximo treino:</b> ${esc(p.next_workout)}</div>`;
      btn.textContent='ATUALIZAR ANÁLISE';
    }catch(e){out.innerHTML='<div class="coach-error">'+esc(e.message||'Erro ao analisar.')+'</div>';btn.textContent='TENTAR NOVAMENTE';}
    finally{btn.disabled=false}
  }
  const wait=()=>setTimeout(mount,80);
  if(typeof window.render==='function'){
    const original=window.render;window.render=function(){const r=original.apply(this,arguments);wait();return r};
  }
  window.addEventListener('load',wait);setTimeout(mount,400);
})();
