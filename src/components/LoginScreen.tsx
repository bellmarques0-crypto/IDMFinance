import React, { useState } from 'react';
import { Lock, User, KeyRound, Wallet, ArrowRight, Shield, CreditCard, Sparkles } from 'lucide-react';

interface LoginScreenProps {
  onLogin: (user: string) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('Izabel');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isOpening, setIsOpening] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUser = username.trim();
    const cleanPass = password.trim();

    if (!cleanUser) {
      setError('Por favor, informe seu usuário.');
      return;
    }
    if (!cleanPass) {
      setError('Por favor, informe sua senha.');
      return;
    }

    // Check fixed credential for Izabel / 110424 or saved password
    const isIzabel = cleanUser.toLowerCase() === 'izabel';
    const savedPassword = localStorage.getItem(`idm_pass_${cleanUser}`) || 
                          localStorage.getItem('idm_user_password') || 
                          (isIzabel ? '110424' : null);

    if (isIzabel) {
      const validPass = savedPassword || '110424';
      if (cleanPass !== validPass) {
        setError('Senha incorreta! Para a usuária Izabel, a senha é 110424.');
        return;
      }
    } else {
      if (savedPassword) {
        if (cleanPass !== savedPassword) {
          setError('Senha incorreta! Verifique a senha digitada.');
          return;
        }
      } else {
        if (cleanPass !== '110424') {
          setError('Usuário ou senha incorretos! Credenciais iniciais: Izabel / 110424');
          return;
        }
      }
    }

    // Store current password
    localStorage.setItem(`idm_pass_${cleanUser}`, cleanPass);
    localStorage.setItem('idm_user_password', cleanPass);

    setError('');
    setIsOpening(true);

    setTimeout(() => {
      onLogin(cleanUser);
    }, 600);
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#202d1e] via-[#2d3e2b] to-[#1a2519] flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Background Subtle Ambient Glow */}
      <div className="absolute w-96 h-96 bg-[#7fa678]/20 rounded-full blur-3xl pointer-events-none -top-20 -left-20" />
      <div className="absolute w-96 h-96 bg-[#577751]/25 rounded-full blur-3xl pointer-events-none -bottom-20 -right-20" />

      {/* Main Container */}
      <div className="w-full max-w-md flex flex-col items-center relative z-10">
        {/* Top Branding Header */}
        <div className="mb-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#394d36]/80 border border-[#6f966a]/40 text-[#c8e3c4] text-xs font-semibold mb-3 shadow-xs backdrop-blur-sm">
            <Shield className="w-3.5 h-3.5 text-[#a3d19e]" />
            <span>Acesso Seguro BRL</span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">
            <span className="text-[#aedbb8]">IDM</span>Finance
          </h1>
          <p className="text-xs text-[#c0dec2] mt-1">Identificação & Carteira Pessoal</p>
        </div>

        {/* --- THE WALLET WRAPPER --- */}
        <div className={`w-full relative transition-transform duration-500 ${isOpening ? 'scale-105 opacity-90' : 'hover:scale-[1.01]'}`}>
          
          {/* 1. BANKNOTES / MONEY STICKING OUT AT THE TOP OF THE WALLET */}
          <div className="relative w-[85%] mx-auto h-12 -mb-5 flex justify-center items-end gap-2 z-0">
            {/* Note 1 (Left tilt - pastel mint) */}
            <div className="w-28 h-10 bg-gradient-to-tr from-[#588053] to-[#7aa874] rounded-t-lg border-t-2 border-l border-r border-[#a3d19e]/70 shadow-md transform -rotate-12 translate-x-3 translate-y-1 flex items-center justify-between px-2 text-[9px] font-mono text-[#e3f5e0] font-bold">
              <span>100</span>
              <span className="opacity-80 text-[8px]">REAL</span>
              <span>R$</span>
            </div>
            {/* Note 2 (Center highest - pastel sage) */}
            <div className="w-32 h-12 bg-gradient-to-tr from-[#699464] to-[#8eb888] rounded-t-lg border-t-2 border-l border-r border-[#bce3b8]/80 shadow-lg transform -rotate-2 -translate-y-1 flex items-center justify-between px-2.5 text-[10px] font-mono text-[#f0f9ef] font-bold">
              <span>200</span>
              <span className="opacity-80 text-[9px]">REAL</span>
              <span>R$</span>
            </div>
            {/* Note 3 (Right tilt - pastel green) */}
            <div className="w-28 h-10 bg-gradient-to-tr from-[#52774d] to-[#719d6c] rounded-t-lg border-t-2 border-l border-r border-[#9dc898]/70 shadow-md transform rotate-12 -translate-x-3 translate-y-1 flex items-center justify-between px-2 text-[9px] font-mono text-[#e0f3dd] font-bold">
              <span>50</span>
              <span className="opacity-80 text-[8px]">REAL</span>
              <span>R$</span>
            </div>
          </div>

          {/* 2. THE WALLET BODY (Pastel leather style container) */}
          <div className="relative bg-gradient-to-b from-[#3a4d38] via-[#324330] to-[#283626] border-2 border-[#5c7a59] rounded-3xl p-6 sm:p-7 shadow-2xl z-10 overflow-hidden">
            
            {/* Wallet Leather Stitching Lines Around Edges */}
            <div className="absolute inset-1.5 border border-dashed border-[#84a880]/50 rounded-[22px] pointer-events-none" />

            {/* Wallet Clasp / Latch Button on Right Side */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-8 h-16 bg-gradient-to-r from-[#2f3f2d] to-[#455c42] border-l border-y border-[#6b8b68] rounded-l-xl shadow-lg flex items-center justify-center z-20">
              <div className="w-4 h-4 rounded-full bg-gradient-to-br from-[#b8dbb4] to-[#71986d] border border-[#e2f5e0] shadow-inner flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-[#202b1f]" />
              </div>
            </div>

            {/* Header Badge Inside Wallet */}
            <div className="flex items-center justify-between mb-4 border-b border-[#526b4e]/70 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#486145] flex items-center justify-center text-[#c5e6c1]">
                  <Wallet className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-white tracking-wide">Carteira IDM</h2>
                  <p className="text-[10px] text-[#bde0b9]">Insira suas credenciais</p>
                </div>
              </div>
              <CreditCard className="w-5 h-5 text-[#a1cb9b]" />
            </div>

            {/* 3. CARD SLOT WINDOW (Light pastel container) */}
            <form onSubmit={handleSubmit} className="bg-[#f2f7f1] rounded-2xl p-5 border-2 border-[#50694c] shadow-inner relative z-10 text-slate-800">
              
              {/* Card Window Label */}
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-200">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#344831] flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-[#344831]" /> Cartão de Acesso
                </span>
                <span className="text-[10px] font-mono text-slate-400">ID-8824</span>
              </div>

              {error && (
                <div className="mb-4 p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-medium text-center">
                  {error}
                </div>
              )}

              {/* Username Input Field */}
              <div className="mb-4">
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Usuário
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Digite seu usuário..."
                    className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#52704e] transition"
                    autoComplete="username"
                  />
                </div>
              </div>

              {/* Password Input Field */}
              <div className="mb-5">
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Senha
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#52704e] transition"
                    autoComplete="current-password"
                  />
                </div>
              </div>

              {/* Submit Button inside Card Slot */}
              <button
                type="submit"
                disabled={isOpening}
                className="w-full py-3 px-4 bg-gradient-to-r from-[#445e41] via-[#537350] to-[#638760] hover:from-[#374d35] hover:to-[#52724f] text-white font-bold text-sm rounded-xl shadow-md flex items-center justify-center gap-2 transition transform active:scale-[0.99]"
              >
                {isOpening ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Abrindo Carteira...</span>
                  </>
                ) : (
                  <>
                    <span>Entrar no IDMFinance</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Quick Demo Helper Hint */}
            <div className="mt-4 text-center">
              <p className="text-[11px] text-[#c5e6c1]/90 font-medium">
                Usuário padrão: <strong className="text-white font-bold">Izabel</strong> &bull; Senha: <strong className="text-white font-bold">110424</strong>
              </p>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <p className="text-center text-xs text-[#738a6f] mt-6">
          IDMFinance &copy; {new Date().getFullYear()} &bull; Protegido por Criptografia Local & Nuvem
        </p>
      </div>
    </div>
  );
};
