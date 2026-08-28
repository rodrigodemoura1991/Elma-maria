// Login robusto fix7: bypass do cliente Auth que estava travando após o servidor responder 200.
(function(){
  const URL='https://uvujytjdafcyacawcirp.supabase.co';
  const KEY='sb_publishable__mofqtls_ru76dDkIJbIew_G2f_wUKE';
  const SESSION_KEY='meu_treino_session_v1';

  function makeAuthedClient(accessToken){
    sb=window.supabase.createClient(URL,KEY,{auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false},global:{headers:{Authorization:'Bearer '+accessToken}}});
    return sb;
  }
  function saveSession(s){try{localStorage.setItem(SESSION_KEY,JSON.stringify(s))}catch(e){}}
  function clearSession(){try{localStorage.removeItem(SESSION_KEY)}catch(e){}}
  function decodeExp(token){try{const p=JSON.parse(atob(token.split('.')[1].replace(/-/g,'+').replace(/_/g,'/')));return p.exp||0}catch(e){return 0}}

  async function refreshSession(refreshToken){
    const r=await fetch(URL+'/auth/v1/token?grant_type=refresh_token',{method:'POST',headers:{'Content-Type':'application/json','apikey':KEY},body:JSON.stringify({refresh_token:refreshToken})});
    const j=await r.json();
    if(!r.ok)throw new Error(j.error_description||j.msg||j.message||'Não foi possível renovar a sessão.');
    return j;
  }

  async function activate(session){
    if(!session?.access_token||!session?.user)return false;
    makeAuthedClient(session.access_token);
    user=session.user;
    status('☁ Online • login OK',true);
    try{await Promise.race([cloudLoad(),new Promise((_,rej)=>setTimeout(()=>rej(new Error('LOAD_TIMEOUT')),10000))]);status('☁ Online • salvo',true)}catch(e){console.warn(e);status('☁ Online • login OK',true)}
    render();
    return true;
  }

  async function restore(){
    let s=null;try{s=JSON.parse(localStorage.getItem(SESSION_KEY)||'null')}catch(e){}
    if(!s)return;
    try{
      if(s.access_token && decodeExp(s.access_token)>Math.floor(Date.now()/1000)+60){await activate(s);return}
      if(s.refresh_token){const n=await refreshSession(s.refresh_token);const ns={access_token:n.access_token,refresh_token:n.refresh_token,user:n.user||s.user};saveSession(ns);await activate(ns);return}
    }catch(e){console.warn('Sessão local inválida:',e);clearSession()}
  }

  function init(){
    if(!window.supabase || typeof window.supabase.createClient!=='function')return setTimeout(init,100);
    try{
      sb=window.supabase.createClient(URL,KEY,{auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}});
      status('☁ Conexão pronta',true);
      restore();
    }catch(e){console.error(e);status('⚠ Falha na conexão',false)}
  }

  window.signIn=async function(){
    const e=document.getElementById('email')?.value.trim(),p=document.getElementById('password')?.value||'';
    if(!e||!p)return alert('Informe e-mail e senha.');
    const btn=document.querySelector('.loginbtn');if(btn){btn.disabled=true;btn.textContent='CONECTANDO...'}
    try{
      // Chamada REST direta: evita o lock/storage do supabase-js que estava deixando o botão preso.
      const r=await fetch(URL+'/auth/v1/token?grant_type=password',{method:'POST',headers:{'Content-Type':'application/json','apikey':KEY},body:JSON.stringify({email:e,password:p})});
      const j=await r.json();
      if(!r.ok)throw new Error(j.error_description||j.msg||j.message||'E-mail ou senha incorretos.');
      if(!j.access_token||!j.user)throw new Error('O servidor autenticou, mas não devolveu uma sessão válida.');
      const s={access_token:j.access_token,refresh_token:j.refresh_token,user:j.user};saveSession(s);
      await activate(s);
    }catch(err){console.error('Login fix7:',err);alert('Não foi possível entrar: '+(err?.message||'erro desconhecido'))}
    finally{if(btn){btn.disabled=false;btn.textContent='ENTRAR'}}
  };

  window.signOut=async function(){
    clearSession();user=null;cloudReady=false;sb=window.supabase.createClient(URL,KEY,{auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}});status('☁ Offline/local',false);render();
  };

  init();
})();
