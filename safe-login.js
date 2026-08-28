// Login robusto: intercepta o clique antes do onclick inline e evita ficar preso em "ENTRANDO...".
(function(){
  const URL='https://uvujytjdafcyacawcirp.supabase.co';
  const KEY='sb_publishable__mofqtls_ru76dDkIJbIew_G2f_wUKE';
  let client=null;
  function getClient(){
    if(!client && window.supabase) client=window.supabase.createClient(URL,KEY);
    return client;
  }
  async function login(btn){
    const email=document.getElementById('email')?.value.trim();
    const password=document.getElementById('password')?.value||'';
    if(!email||!password){alert('Informe e-mail e senha.');return;}
    const c=getClient();
    if(!c){alert('A conexão do aplicativo ainda não carregou. Recarregue a página.');return;}
    btn.disabled=true;btn.textContent='CONECTANDO...';
    try{
      const result=await Promise.race([
        c.auth.signInWithPassword({email,password}),
        new Promise((_,reject)=>setTimeout(()=>reject(new Error('timeout')),10000))
      ]);
      if(result.error) throw result.error;
      // app.js usa variáveis globais declaradas com let; o eval direto permite alimentar essas variáveis.
      eval('user = result.data.user; sb = c; cloudReady = false;');
      if(typeof status==='function') status('☁ Conectado • carregando treino',true);
      if(typeof render==='function') render();
      try{
        await Promise.race([
          (typeof cloudLoad==='function'?cloudLoad():Promise.resolve()),
          new Promise(resolve=>setTimeout(resolve,5000))
        ]);
      }catch(e){console.warn('Sincronização atrasada:',e)}
      if(typeof render==='function') render();
      if(typeof status==='function') status(cloudReady?'☁ Online • salvo':'☁ Offline/local',!!cloudReady);
    }catch(err){
      console.error('Falha no login:',err);
      alert(err.message==='timeout'?'O servidor de login demorou para responder. Verifique a conexão e tente novamente.':(err.message||'Não foi possível entrar.'));
    }finally{
      btn.disabled=false;btn.textContent='ENTRAR';
    }
  }
  document.addEventListener('click',function(ev){
    const btn=ev.target.closest?.('.loginbtn');
    if(!btn)return;
    ev.preventDefault();
    ev.stopImmediatePropagation();
    login(btn);
  },true);
})();
