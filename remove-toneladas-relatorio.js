(()=>{
'use strict';
function removeToneladasDoRelatorio(){
  const headings=[...document.querySelectorAll('h1,h2,h3,h4,h5,h6')];
  const heading=headings.find(el=>(el.textContent||'').trim()==='🏋️ Toneladas por treino' || (el.textContent||'').trim()==='Toneladas por treino');
  if(!heading)return;
  let card=heading;
  for(let i=0;i<5&&card.parentElement;i++){
    card=card.parentElement;
    if(card.classList?.contains('card'))break;
  }
  if(!card||!card.classList?.contains('card'))return;
  heading.textContent='🏋️ Volume por treino';
  const p=[...card.querySelectorAll('p')].find(el=>(el.textContent||'').includes('Toneladas = soma de carga'));
  if(p)p.textContent='Volume = soma de carga × repetições de todas as séries.';
  card.querySelectorAll('.reportTableRow').forEach(row=>{
    const children=[...row.children];
    if(children.length>=4)children[2].remove();
  });
  const tableHeader=card.querySelector('.reportTableHeader');
  if(tableHeader){
    const children=[...tableHeader.children];
    if(children.length>=3)children[2].remove();
  }
}
let timer=0;
const run=()=>{clearTimeout(timer);timer=setTimeout(removeToneladasDoRelatorio,30)};
new MutationObserver(run).observe(document.documentElement,{childList:true,subtree:true});
window.addEventListener('load',()=>setTimeout(removeToneladasDoRelatorio,100));
run();
})();
