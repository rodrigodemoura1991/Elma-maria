/* Firebase bridge for MEU TREINO (Elma Maria)
   Keeps the existing app data layer API while moving auth + workout logs to Firebase.
*/
(function(){
  const COLLECTION='workout_logs';
  function normalizeUser(u){
    if(!u) return null;
    return {id:u.uid, uid:u.uid, email:u.email||'', user_metadata:{email:u.email||''}};
  }
  function createClient(){
    if(!window.firebase || !firebase.apps || !firebase.apps.length){
      throw new Error('Firebase ainda não foi inicializado.');
    }
    const auth=firebase.auth();
    const db=firebase.firestore();
    return {
      auth:{
        async getSession(){
          const current=await new Promise(resolve=>{
            if(auth.currentUser){resolve(auth.currentUser);return;}
            let unsub=null;
            const timer=setTimeout(()=>{try{unsub?.()}catch(e){}resolve(auth.currentUser||null)},2000);
            unsub=auth.onAuthStateChanged(u=>{clearTimeout(timer);try{unsub?.()}catch(e){}resolve(u||null)});
          });
          return {data:{session:current?{user:normalizeUser(current)}:null},error:null};
        },
        async signInWithPassword({email,password}){
          try{const c=await auth.signInWithEmailAndPassword(email,password);return {data:{user:normalizeUser(c.user)},error:null};}
          catch(error){return {data:null,error};}
        },
        async signUp({email,password}){
          try{const c=await auth.createUserWithEmailAndPassword(email,password);return {data:{user:normalizeUser(c.user)},error:null};}
          catch(error){return {data:null,error};}
        },
        async signOut(){try{await auth.signOut();return {error:null};}catch(error){return {error};}}
      },
      from(name){
        if(name!==COLLECTION) throw new Error('Coleção não suportada: '+name);
        return new CollectionAdapter(db);
      }
    };
  }
  class CollectionAdapter{
    constructor(db){this.db=db;this._mode='';this._conditions=[];this._order=null;this._payload=null;this._conflict=null;}
    select(){this._mode='select';return this;}
    like(field,pattern){this._conditions.push({op:'like',field,pattern});return this;}
    order(field,opts){this._order={field,opts};return this;}
    upsert(payload,opts){this._mode='upsert';this._payload=payload;this._conflict=opts?.onConflict;return this._execute();}
    delete(){this._mode='delete';return this;}
    eq(field,value){this._conditions.push({op:'eq',field,value});return this;}
    then(resolve,reject){return this._execute().then(resolve,reject);}
    async _execute(){
      try{
        if(this._mode==='upsert'){
          const p=this._payload;
          const userId=p.user_id;
          const logKey=p.log_key;
          const id=encodeURIComponent(userId+'__'+logKey);
          await this.db.collection(COLLECTION).doc(id).set({...p,_docId:id},{merge:true});
          return {data:p,error:null};
        }
        if(this._mode==='delete'){
          let q=this.db.collection(COLLECTION);
          this._conditions.filter(c=>c.op==='eq').forEach(c=>{q=q.where(c.field,'==',c.value)});
          const snap=await q.get();
          const batch=this.db.batch();snap.docs.forEach(d=>batch.delete(d.ref));await batch.commit();
          return {data:null,error:null};
        }
        let q=this.db.collection(COLLECTION);
        this._conditions.filter(c=>c.op==='eq').forEach(c=>{q=q.where(c.field,'==',c.value)});
        if(this._order){q=q.orderBy(this._order.field,this._order.opts?.ascending===false?'desc':'asc');}
        const snap=await q.get();
        let rows=snap.docs.map(d=>d.data());
        for(const c of this._conditions.filter(c=>c.op==='like')){
          const prefix=String(c.pattern||'').replace(/%$/,'');
          rows=rows.filter(r=>String(r[c.field]||'').startsWith(prefix));
        }
        return {data:rows,error:null};
      }catch(error){console.error('Firebase bridge:',error);return {data:null,error};}
    }
  }
  window.supabase={createClient};
})();
