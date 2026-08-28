// Final login patch: enter the app immediately after Supabase authentication succeeds.
(function(){
  function waitForApp(){
    if(typeof window.supabase==='undefined' || typeof window.render!=='function' || typeof window.authPage!=='function'){
      setTimeout(waitForApp,50); return;
    }
    window.signIn = async function(){
      const e=document.getElementById('email')?.value.trim();
      const p=document.getElementById('password')?.value||'';
      if(!e||!p){alert('Informe e-mail e senha.');return}
      if(!window.sb){
        try{window.sb=window.supabase.createClient(window.SUPABASE_URL,window.SUPABASE_PUBLISHABLE_KEY)}catch(err){alert('Não foi possível iniciar a conexão. Recarregue a página.');return}
      }
      const btn=document.getElementById('loginButton')||document.querySelector('.loginbtn');
      if(btn){btn.disabled=true;btn.textContent='CONECTANDO...'}
      try{
        const result=await Promise.race([
          window.sb.auth.signInWithPassword({email:e,password:p}),
          new Promise((_,reject)=>setTimeout(()=>reject(new Error('TIMEOUT')),12000))
        ]);
        if(result?.error){alert(result.error.message||'Não foi possível entrar.');return}
        const loggedUser=result?.data?.user;
        if(!loggedUser)throw new Error('LOGIN_SEM_USUARIO');
        window.user=loggedUser;
        window.cloudReady=true;
        if(typeof window.status==='function')window.status('☁ Online',true);
        // IMPORTANT: show the workout screen now; cloud history loads in background.
        window.render();
        // Load cloud data without blocking the login screen.
        if(typeof window.cloudLoad==='function'){
          Promise.race([
            window.cloudLoad(),
            new Promise((_,reject)=>setTimeout(()=>reject(new Error('CLOUD_TIMEOUT')),7000))
          ]).catch(err=>{
            console.warn('Cloud history delayed:',err);
            window.cloudReady=true;
            if(typeof window.status==='function')window.status('☁ Online • login OK',true);
            if(typeof window.render==='function')window.render();
          });
        }
      }catch(err){
        console.error('Login:',err);
        alert(err?.message==='TIMEOUT'?'A conexão demorou mais que o esperado. Verifique sua internet e tente novamente.':'Não foi possível concluir o login. Tente novamente.');
      }finally{
        if(btn){btn.disabled=false;btn.textContent='ENTRAR'}
      }
    };
  }
  waitForApp();
})();
