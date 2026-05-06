// config.js — Configurações públicas do USFORCE8
// Preencha com as credenciais do seu projeto Supabase
// (anon key é segura para ficar no código — é a chave pública)
// Painel Supabase: https://supabase.com/dashboard → Settings → API

(function () {
  window.USFORCE_CONFIG = {
    supabase: {
      url:     'COLE_AQUI_A_URL_DO_SUPABASE',   // ex: https://xyzxyz.supabase.co
      anonKey: 'COLE_AQUI_A_ANON_KEY',           // começa com eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
    },
  };
})();
