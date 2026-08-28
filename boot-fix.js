// Inicialização resiliente: o treino deve aparecer mesmo se a consulta de sessão da nuvem demorar.
(function(){
  function start(){
    try {
      if (typeof render === 'function') render();
    } catch (e) {
      console.error('Falha ao iniciar Meu Treino:', e);
      var el=document.getElementById('app');
      if(el) el.innerHTML='<div class="card auth"><h1>Meu Treino</h1><p>O aplicativo encontrou um erro ao iniciar. Recarregue a página.</p><button class="primary" onclick="location.reload()">Recarregar</button></div>';
    }
  }
  setTimeout(start,150);
})();
