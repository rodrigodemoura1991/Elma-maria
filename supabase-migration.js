(() => {
  // ELMA MARIA: usa exclusivamente o projeto Supabase separado.
  // IMPORTANTE: não migra, lê ou copia histórico do projeto original do Meu Treino.
  const TARGET_URL = 'https://uwnzpoqhxioxjegflksv.supabase.co';
  const TARGET_KEY = 'sb_publishable_WLXH_fefLlSO-r9ebQHAnw_MtUd7w7r';
  const LOCAL_RESET_FLAG = 'elma_maria_history_reset_v1';
  const originalCreateClient = window.supabase?.createClient;
  if (!originalCreateClient) return;

  // Força todos os clientes Supabase deste app para o banco exclusivo do Elma Maria.
  const targetClient = originalCreateClient(TARGET_URL, TARGET_KEY);
  window.supabase.createClient = () => targetClient;

  // Limpa uma única vez qualquer histórico local que tenha vindo da cópia do Meu Treino.
  // Depois disso, os novos registros ficam somente no histórico do Elma Maria.
  try {
    if (localStorage.getItem(LOCAL_RESET_FLAG) !== '1') {
      localStorage.removeItem('meu_treino_reset_v2');
      localStorage.setItem(LOCAL_RESET_FLAG, '1');
    }
  } catch (_) {}
})();
