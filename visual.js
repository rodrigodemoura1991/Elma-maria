/* Visual claro — sem fotos de exercícios. */
(function(){
  const css=`
    :root{--bg:#f4f6f8!important;--panel:#fff!important;--panel2:#f9fafb!important;--line:#dfe4ea!important;--text:#17212b!important;--muted:#66717d!important;--accent:#e85d04!important;--accent2:#ff7a22!important}
    html,body{background:#f4f6f8!important;color:#17212b!important}
    body{background:linear-gradient(180deg,#eef2f5 0,#fff 55%,#f2f4f6 100%)!important}
    .top{background:rgba(255,255,255,.97)!important;border-bottom:1px solid #dfe4ea!important;box-shadow:0 2px 12px rgba(20,30,40,.07)!important}
    .status{background:#fff1e8!important;color:#b84d00!important}.status.on{background:#eaf8ef!important;color:#15803d!important}
    .hero,.card,.exercise,.stat{background:#fff!important;border-color:#dfe4ea!important;box-shadow:0 4px 16px rgba(20,30,40,.05)!important}
    .exercise{padding:12px!important}.exhead{align-items:center!important;justify-content:flex-start!important}
    .exname{color:#17212b!important}.meta{color:#66717d!important}.tag{background:#fff1e8!important;color:#b84d00!important}
    .setno{background:#eef1f4!important;color:#64707c!important}.field,.metrics input,.metrics select,.select{background:#fff!important;color:#17212b!important;border-color:#cfd6de!important}
    .obs,.notes{background:#fbfcfd!important;color:#17212b!important;border-color:#d7dde4!important}
    .secondary{background:#eef1f4!important;color:#374151!important}.footnav{background:rgba(255,255,255,.98)!important;border-color:#dfe4ea!important}
  `;
  const style=document.createElement('style');style.id='visual-theme';style.textContent=css;document.head.appendChild(style);
})();
