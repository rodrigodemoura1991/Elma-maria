// Workaround for browser Web Locks deadlocks in Supabase Auth.
// The app is a simple single-user workout diary, so cross-tab auth locking is unnecessary.
(function(){
  function patch(){
    if(!window.supabase || typeof window.supabase.createClient!=='function'){
      setTimeout(patch,25); return;
    }
    if(window.supabase.__meuTreinoLockFix)return;
    const original=window.supabase.createClient.bind(window.supabase);
    window.supabase.createClient=function(url,key,options){
      options=options||{};
      const auth=Object.assign({},options.auth||{}, {
        lock: async function(_name,_acquireTimeout,fn){ return await fn(); }
      });
      return original(url,key,Object.assign({},options,{auth}));
    };
    window.supabase.__meuTreinoLockFix=true;
  }
  patch();
})();
