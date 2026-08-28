// Interface de login — FIX6
(function(){
  const CSS=`
    .auth{position:relative!important;z-index:1000!important;pointer-events:auto!important;touch-action:auto!important}
    .auth input{position:relative!important;z-index:1001!important;display:block!important;pointer-events:auto!important;touch-action:auto!important;-webkit-user-select:text!important;user-select:text!important;-webkit-appearance:none!important;appearance:none!important;opacity:1!important}
    .auth button{position:relative!important;z-index:1001!important;pointer-events:auto!important;touch-action:manipulation!important}
    .auth input:focus{outline:2px solid #e85d04!important;outline-offset:1px!important}
  `;
  const st=document.createElement('style');st.id='login-ui-fix';st.textContent=CSS;document.head.appendChild(st);

  function patch(){
    const box=document.querySelector('.auth');
    if(!box || box.dataset.loginPatched==='1')return;
    box.dataset.loginPatched='1';
    box.innerHTML=`
      <div style="font-size:42px">🏋️</div>
      <h1>Meu Treino</h1>
      <p>Seu diário de musculação, cargas, repetições e progressão.</p>
      <label style="display:block;font-size:12px;font-weight:800;margin:10px 0 4px">E-MAIL</label>
      <input id="email" name="email" type="email" inputmode="email" autocomplete="username" autocapitalize="none" spellcheck="false" placeholder="Digite seu e-mail">
      <label style="display:block;font-size:12px;font-weight:800;margin:10px 0 4px">SENHA</label>
      <input id="password" name="password" type="password" autocomplete="current-password" placeholder="Digite sua senha">
      <button type="button" class="loginbtn" id="loginButton">ENTRAR</button>
      <button type="button" class="secondary" id="signupButton" style="width:100%;margin-top:7px">CRIAR CONTA</button>
    `;
    const email=box.querySelector('#email');
    const pass=box.querySelector('#password');
    email.addEventListener('keydown',e=>{if(e.key==='Enter')pass.focus()});
    pass.addEventListener('keydown',e=>{if(e.key==='Enter')document.getElementById('loginButton').click()});
    box.querySelector('#loginButton').addEventListener('click',()=>{
      if(typeof window.signIn==='function') window.signIn();
      else alert('Função de login ainda não carregou. Recarregue a página.');
    });
    box.querySelector('#signupButton').addEventListener('click',()=>{
      if(typeof window.signUp==='function') window.signUp();
      else alert('Função de cadastro ainda não carregou. Recarregue a página.');
    });
    setTimeout(()=>email.focus(),100);
  }

  const obs=new MutationObserver(patch);
  obs.observe(document.documentElement,{childList:true,subtree:true});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',patch);else patch();
})();
