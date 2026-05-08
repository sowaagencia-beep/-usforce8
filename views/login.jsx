// Tela de Login — USFORCE8

const { useState: useStateLogin } = React;

function LoginView({ onLogin }) {
  const [email,    setEmail]    = useStateLogin('');
  const [password, setPassword] = useStateLogin('');
  const [error,    setError]    = useStateLogin(null);
  const [loading,  setLoading]  = useStateLogin(false);
  const [show,     setShow]     = useStateLogin(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!email.includes('@')) { setError('E-mail inválido'); return; }
    if (!password)             { setError('Informe a senha'); return; }
    setError(null);
    setLoading(true);
    const err = await onLogin({ email, password });
    if (err) { setError(err); setLoading(false); }
  };

  const Icon = ({ name, ...p }) => {
    const C = window.lucide[name];
    return C ? <C {...p} /> : null;
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F4F6FB] px-6 py-12">
      <div className="relative w-full max-w-[440px]">
        <div className="flex justify-center mb-10">
          <UsforceLogo size={32} />
        </div>
        <div className="bg-white border-t-2 border-[#0F1B3D] shadow-sm" style={{
          clipPath: 'polygon(0 0, calc(100% - 22px) 0, 100% 22px, 100% 100%, 0 100%)'
        }}>
          <div className="px-8 pt-7 pb-2">
            <div className="flex items-center gap-2 mb-1">
              <span className="h-2 w-2 bg-[#0F1B3D] rotate-45 inline-block" />
              <h1 className="text-[15px] font-black uppercase tracking-[0.18em] text-[#0F1B3D]"
                  style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
                Autenticação Necessária
              </h1>
            </div>
            <p className="text-xs text-[#0F1B3D]/60 mb-6">Acesso restrito a administradores</p>
          </div>
          <form onSubmit={submit} className="px-8 pb-8 space-y-5">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-[#0F1B3D]/70 mb-2">E-mail</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#0F1B3D]/40">
                  <Icon name="IdCard" size={16} />
                </span>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  autoComplete="email"
                  className="w-full pl-9 pr-3 py-2.5 text-sm bg-[#F4F6FB] border border-[#0F1B3D]/15 focus:border-[#0F1B3D] focus:bg-white outline-none transition-colors"
                  placeholder="seu.email@empresa.com.br" />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-[#0F1B3D]/70 mb-2">Senha</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#0F1B3D]/40">
                  <Icon name="KeyRound" size={16} />
                </span>
                <input type={show ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                  autoComplete="current-password"
                  className="w-full pl-9 pr-10 py-2.5 text-sm bg-[#F4F6FB] border border-[#0F1B3D]/15 focus:border-[#0F1B3D] focus:bg-white outline-none transition-colors"
                  placeholder="••••••••" />
                <button type="button" onClick={() => setShow(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#0F1B3D]/40 hover:text-[#0F1B3D] transition-colors">
                  <Icon name={show ? 'EyeOff' : 'Eye'} size={15} />
                </button>
              </div>
            </div>
            {error && (
              <div className="flex items-center gap-2 text-xs text-red-700 bg-red-50 border border-red-200 px-3 py-2">
                <Icon name="AlertTriangle" size={14} /><span>{error}</span>
              </div>
            )}
            <PrimaryBtn type="submit" className="w-full" disabled={loading}
              icon={loading
                ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="animate-spin"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                : <Icon name="ArrowRight" size={14} />}>
              {loading ? 'Verificando…' : 'Entrar'}
            </PrimaryBtn>
            <div className="flex items-center justify-between pt-2 text-[10px] uppercase tracking-[0.18em] text-[#0F1B3D]/50">
              <span>Sessão criptografada</span>
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> Online
              </span>
            </div>
          </form>
        </div>
        <p className="mt-6 text-center text-[10px] uppercase tracking-[0.2em] text-[#0F1B3D]/40">
          © 2026 USFORCE8 · Plataforma de Gestão Multi-Marca
        </p>
      </div>
    </div>
  );
}

window.LoginView = LoginView;
