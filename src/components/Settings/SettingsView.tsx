import React, { useState, useEffect } from 'react';
import { Settings, RefreshCw, Trash2, Download, Upload, ShieldCheck, User, Lock, KeyRound, Save, LogOut, AlertCircle, CheckCircle2 } from 'lucide-react';

interface SettingsViewProps {
  onResetSampleData: () => void;
  onClearAllData: () => void;
  currentUser?: string;
  onUpdateUser?: (newUsername: string) => void;
  onLogout?: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  onResetSampleData,
  onClearAllData,
  currentUser,
  onUpdateUser,
  onLogout,
}) => {
  // User Management State
  const [usernameInput, setUsernameInput] = useState(currentUser || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [userMsg, setUserMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Clear any legacy custom URL from localStorage
  useEffect(() => {
    localStorage.removeItem('neon_db_url');
  }, []);

  useEffect(() => {
    if (currentUser) {
      setUsernameInput(currentUser);
    }
  }, [currentUser]);

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setUserMsg(null);

    if (!newPassword) {
      setUserMsg({ type: 'error', text: 'Por favor, digite a nova senha.' });
      return;
    }

    if (newPassword.length < 3) {
      setUserMsg({ type: 'error', text: 'A nova senha deve ter no mínimo 3 caracteres.' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setUserMsg({ type: 'error', text: 'A confirmação da nova senha não confere.' });
      return;
    }

    // Verify current password if one is set
    const activeUser = currentUser || 'admin';
    const savedPassword = localStorage.getItem(`idm_pass_${activeUser}`) || localStorage.getItem('idm_user_password');
    if (savedPassword && currentPassword !== savedPassword) {
      setUserMsg({ type: 'error', text: 'Senha atual incorreta.' });
      return;
    }

    // Save new password
    localStorage.setItem(`idm_pass_${activeUser}`, newPassword);
    localStorage.setItem('idm_user_password', newPassword);

    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setUserMsg({ type: 'success', text: 'Senha alterada com sucesso!' });
  };

  const handleSaveUsername = (e: React.FormEvent) => {
    e.preventDefault();
    setUserMsg(null);
    const clean = usernameInput.trim();
    if (!clean) {
      setUserMsg({ type: 'error', text: 'O nome de usuário não pode ficar em branco.' });
      return;
    }

    const activeUser = currentUser || 'admin';
    const savedPassword = localStorage.getItem(`idm_pass_${activeUser}`) || localStorage.getItem('idm_user_password');
    if (savedPassword) {
      localStorage.setItem(`idm_pass_${clean}`, savedPassword);
    }

    if (onUpdateUser) {
      onUpdateUser(clean);
    }
    setUserMsg({ type: 'success', text: `Usuário alterado para "${clean}" com sucesso!` });
  };

  const handleConfirmReset = () => {
    if (
      window.confirm(
        'Deseja carregar a estrutura inicial de categorias? Seus dados serão mantidos zerados conforme solicitado.'
      )
    ) {
      onResetSampleData();
    }
  };

  const handleConfirmClear = () => {
    if (
      window.confirm(
        'Atenção! Tem certeza de que deseja apagar TODOS os lançamentos e cadastros? Esta ação não pode ser desfeita.'
      )
    ) {
      onClearAllData();
    }
  };

  return (
    <div className="space-y-6 pb-12 max-w-4xl">
      {/* HEADER SECTION */}
      <div>
        <h2 className="text-xl md:text-2xl font-extrabold text-slate-800 tracking-tight">
          Configurações do Sistema
        </h2>
        <p className="text-xs md:text-sm text-slate-500 font-medium">
          Gerencie seu perfil de usuário, segurança, banco de dados SQLite e dados do sistema.
        </p>
      </div>

      {/* USER MANAGEMENT & SECURITY CARD */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-[#415c3f] to-[#5d8259] text-[#d1f2cc] rounded-xl shadow-xs">
              <User className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-800">
                Gestão do Usuário & Segurança
              </h3>
              <p className="text-xs text-slate-500">
                Altere seu nome de usuário e redefina sua senha de acesso à carteira
              </p>
            </div>
          </div>

          {onLogout && (
            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold rounded-xl text-xs border border-rose-200 transition"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sair da Carteira
            </button>
          )}
        </div>

        {/* Feedback Message */}
        {userMsg && (
          <div
            className={`p-3.5 rounded-xl border text-xs font-semibold flex items-center gap-2 ${
              userMsg.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}
          >
            {userMsg.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{userMsg.text}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-1">
          {/* Change Username Form */}
          <form onSubmit={handleSaveUsername} className="space-y-4 p-4 rounded-xl border border-slate-100 bg-slate-50/50">
            <h4 className="font-bold text-sm text-slate-800 flex items-center gap-2">
              <User className="w-4 h-4 text-[#4e6c4a]" />
              Identificação do Usuário
            </h4>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nome de Usuário
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  placeholder="Seu usuário..."
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#52724f]"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2 px-3 bg-[#4a6848] hover:bg-[#3d573b] text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 shadow-xs"
            >
              <Save className="w-3.5 h-3.5" />
              Salvar Novo Usuário
            </button>
          </form>

          {/* Change Password Form */}
          <form onSubmit={handleUpdatePassword} className="space-y-3 p-4 rounded-xl border border-slate-100 bg-slate-50/50">
            <h4 className="font-bold text-sm text-slate-800 flex items-center gap-2">
              <Lock className="w-4 h-4 text-[#4e6c4a]" />
              Alterar Senha de Acesso
            </h4>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                Senha Atual
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Sua senha atual..."
                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#52724f]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                Nova Senha
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Digite a nova senha..."
                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#52724f]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                Confirmar Nova Senha
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repita a nova senha..."
                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#52724f]"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2 px-3 bg-gradient-to-r from-[#446342] to-[#5c825a] hover:from-[#385236] hover:to-[#4f704d] text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 shadow-xs pt-2"
            >
              <KeyRound className="w-3.5 h-3.5" />
              Atualizar Senha
            </button>
          </form>
        </div>
      </div>

      {/* DATA MANAGEMENT ACTIONS */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
        <h3 className="font-bold text-base text-slate-800 pb-2 border-b border-slate-100">
          Ações de Dados
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl border border-slate-200 space-y-3">
            <div className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-emerald-700" />
              <span>Redefinir Categorias Padrão</span>
            </div>
            <p className="text-xs text-slate-500">
              Restaura a lista original de categorias financeiras e mantém seus lançamentos zerados.
            </p>
            <button
              onClick={handleConfirmReset}
              className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl text-xs transition"
            >
              Redefinir Categorias
            </button>
          </div>

          <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/30 space-y-3">
            <div className="font-bold text-rose-800 text-sm flex items-center gap-2">
              <Trash2 className="w-4 h-4 text-rose-600" />
              <span>Limpar Todos os Lançamentos</span>
            </div>
            <p className="text-xs text-slate-500">
              Apaga completamente todas as movimentações, despesas fixas e cartões, deixando o sistema totalmente zerado.
            </p>
            <button
              onClick={handleConfirmClear}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs transition"
            >
              Apagar Tudo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

