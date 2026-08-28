(() => {
  const TARGET_URL = 'https://uwnzpoqhxioxjegflksv.supabase.co';
  const TARGET_KEY = 'sb_publishable_WLXH_fefLlSO-r9ebQHAnw_MtUd7w7r';
  const OLD_URL = 'https://uvujytjdafcyacawcirp.supabase.co';
  const OLD_KEY = 'sb_publishable__mofqtls_ru76dDkIJbIew_G2f_wUKE';
  const OLD_USER_ID = '8d7d0855-9042-4aa2-b239-1187983252bc';
  const FLAG = 'meu_treino_elma_migrated_v1';
  const originalCreateClient = window.supabase?.createClient;
  if (!originalCreateClient) return;

  const targetClient = originalCreateClient(TARGET_URL, TARGET_KEY);
  window.supabase.createClient = () => targetClient;

  async function migrate() {
    if (localStorage.getItem(FLAG) === '1') return;
    try {
      const sessionResult = await targetClient.auth.getSession();
      const targetUser = sessionResult?.data?.session?.user;
      if (!targetUser) return;

      let logs = [];
      try {
        const local = JSON.parse(localStorage.getItem('meu_treino_reset_v2') || 'null');
        logs = Object.values(local?.logs || {}).map(payload => ({
          log_key: `resetv1|${payload.day}|${payload.date}`,
          day: payload.day,
          workout_date: payload.date,
          payload,
          updated_at: new Date().toISOString()
        })).filter(r => r.day && r.workout_date && r.payload?.completed !== false);
      } catch (_) {}

      if (!logs.length) {
        const oldClient = originalCreateClient(OLD_URL, OLD_KEY, {
          auth: { storageKey: 'sb-uvujytjdafcyacawcirp-auth-token', persistSession: true, autoRefreshToken: false, detectSessionInUrl: false }
        });
        const oldSession = await oldClient.auth.getSession();
        if (oldSession?.data?.session) {
          const { data, error } = await oldClient
            .from('workout_logs')
            .select('log_key,day,workout_date,payload,updated_at,archived_at')
            .eq('user_id', OLD_USER_ID);
          if (error) throw error;
          logs = data || [];
        }
      }

      if (!logs.length) return;

      const rows = logs.map(r => ({
        user_id: targetUser.id,
        log_key: r.log_key,
        day: r.day,
        workout_date: r.workout_date,
        payload: r.payload,
        updated_at: r.updated_at || new Date().toISOString(),
        archived_at: r.archived_at || null
      }));

      const { error } = await targetClient
        .from('workout_logs')
        .upsert(rows, { onConflict: 'user_id,log_key' });
      if (error) throw error;

      localStorage.setItem(FLAG, '1');
      console.info(`Migração concluída: ${rows.length} registros.`);
      location.reload();
    } catch (error) {
      console.warn('Migração automática não concluída:', error);
    }
  }

  // Aguarda o Supabase Auth terminar de recuperar a sessão/login.
  let attempts = 0;
  const timer = setInterval(async () => {
    attempts++;
    await migrate();
    if (localStorage.getItem(FLAG) === '1' || attempts >= 30) clearInterval(timer);
  }, 1000);
})();
