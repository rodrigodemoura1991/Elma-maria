/* MEU TREINO — final structural sanitizer */
(function(){
'use strict';
function clean(){
  try{Object.keys(localStorage).filter(k=>/spotify/i.test(k)).forEach(k=>localStorage.removeItem(k))}catch(e){}
  document.querySelectorAll('script[src*="spotify" i],link[href*="spotify" i],[id*="spotify" i],[class*="spotify" i],[data-spotify]').forEach(e=>e.remove());
  document.querySelectorAll('#app .exercise,#app .card,#app article,#app section').forEach(e=>{
    const t=(e.textContent||'').replace(/\s+/g,' ').trim();
    if(/Spotify/i.test(t)&&t.length<400)e.remove();
  });
  document.querySelectorAll('#app .exercise').forEach(e=>{
    if(/Elevação pélvica/i.test(e.textContent||''))e.remove();
  });
}
clean();
new MutationObserver(clean).observe(document.documentElement,{subtree:true,childList:true});
})();
