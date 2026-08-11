import React, { useState, useEffect } from 'react';
import { Settings, RefreshCw, Trash2, Download, Upload, ShieldCheck, Database, CheckCircle2, XCircle, Loader2, User, Lock, KeyRound, Save, LogOut, AlertCircle, Eye, EyeOff, Link, Unlink } from 'lucide-react';

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
  const [dbStatus, setDbStatus] = useState<{
    configured: boolean;
    connected: boolean;
    message: string;
    version?: string;
  } | null>(null);
  const [loadingDb, setLoadingDb] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  // Neon DATABASE_URL input state
  const [neonUrlInput, setNeonUrlInput] = useState<string>(() => localStorage.getItem('neon_db_url') || '');
  const [showNeonPassword, setShowNeonPassword] = useState(false);

  // User Management State
  const [usernameInput, setUsernameInput] = useState(currentUser || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [userMsg, setUserMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (currentUser) {
      setUsernameInput(currentUser);
    }
  }, [currentUser]);

  const checkDbStatus = async (customUrl?: string) => {
    setLoadingDb(true);
    let targetUrl = customUrl !== undefined ? customUrl : (neonUrlInput.trim() || localStorage.getItem('neon_db_url') || '');
    if (targetUrl && (targetUrl.startsWith('postgres://') || targetUrl.startsWith('postgresql://')) && !targetUrl.includes('sslmode=')) {
      targetUrl = targetUrl.includes('?') ? targetUrl.replace(/\?.*$/, '?sslmode=require') : `${targetUrl}?sslmode=require`;
    }

    try {
      const res = await fetch('/api/db/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ connectionString: targetUrl }),
      });
      const data = await res.json();
      setDbStatus(data);
      return data;
    } catch (err: any) {
      const errorObj = {
        configured: Boolean(targetUrl),
        connected: false,
        message: `Erro ao comunicar com o servidor: ${err?.message || 'Falha de conexão'}`,
      };
      setDbStatus(errorObj);
      return errorObj;
    } finally {
      setLoadingDb(false);
    }
  };

  useEffect(() => {
    checkDbStatus();
  }, []);

  const handleSaveNeonUrl = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    let cleanUrl = neonUrlInput.trim();
    if (!cleanUrl) {
      localStorage.removeItem('neon_db_url');
      setSyncMessage('Conexão customizada removida. Verificando ambiente...');
      await checkDbStatus('');
      return;
    }

    if ((cleanUrl.startsWith('postgres://') || cleanUrl.startsWith('postgresql://')) && !cleanUrl.includes('sslmode=')) {
      cleanUrl = cleanUrl.includes('?') ? cleanUrl.replace(/\?.*$/, '?sslmode=require') : `${cleanUrl}?sslmode=require`;
      setNeonUrlInput(cleanUrl);
    }

    setSyncMessage(null);
    const statusData = await checkDbStatus(cleanUrl);
    if (statusData.connected) {
      localStorage.setItem('neon_db_url', cleanUrl);
      setSyncMessage('URL do Neon salva com sucesso! Sincronizado.');
      await handleInitTables(cleanUrl);
    } else {
      setSyncMessage(`Falha ao conectar: ${statusData.message}`);
    }
  };

  const handleClearNeonUrl = async () => {
    localStorage.removeItem('neon_db_url');
    setNeonUrlInput('');
    setSyncMessage('URL removida. Testando configuração padrão...');
    await checkDbStatus('');
  };

  const handleInitTables = async (customUrl?: string) => {
    setSyncing(true);
    setSyncMessage(null);
    try {
      let targetUrl = customUrl !== undefined ? customUrl : (neonUrlInput.trim() || localStorage.getItem('neon_db_url') || '');
      if (targetUrl && (targetUrl.startsWith('postgres://') || targetUrl.startsWith('postgresql://')) && !targetUrl.includes('sslmode=')) {
        targetUrl = targetUrl.includes('?') ? targetUrl.replace(/\?.*$/, '?sslmode=require') : `${targetUrl}?sslmode=require`;
      }

      const res = await fetch('/api/db/init', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ connectionString: targetUrl }),
      });
      const data = await res.json();
      if (data.success) {
        setSyncMessage('Tabelas no Neon verificadas e prontas com sucesso!');
        checkDbStatus(targetUrl);
      } else {
        setSyncMessage(`Erro ao inicializar tabelas: ${data.message}`);
      }
    } catch (err: any) {
      setSyncMessage(`Erro ao inicializar tabelas: ${err.message}`);
    } finally {
      setSyncing(false);
    }
  };

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
          Gerencie seu perfil de usuário, segurança, banco de dados Neon PostgreSQL e dados locais.
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

      {/* NEON POSTGRESQL CARD */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-100 text-emerald-800 rounded-xl">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-800 flex items-center gap-2">
                Neon PostgreSQL Database
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full">
                  PostgreSQL
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                Banco de dados relacional em nuvem Serverless
              </p>
            </div>
          </div>

          <button
            onClick={() => checkDbStatus()}
            disabled={loadingDb}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg text-xs transition"
          >
            {loadingDb ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
            Testar Conexão
          </button>
        </div>

        {/* CONNECTION STRING INPUT FORM */}
        <form onSubmit={handleSaveNeonUrl} className="space-y-3 p-4 bg-slate-50/70 border border-slate-200/70 rounded-xl">
          <label className="block text-xs font-bold text-slate-800">
            URL de Conexão do Neon (DATABASE_URL)
          </label>
          <p className="text-[11px] text-slate-500">
            Cole a string de conexão obtida no painel do Neon (botão "Connect") para conectar diretamente a sua base na nuvem.
          </p>

          <div className="relative flex items-center">
            <input
              type={showNeonPassword ? 'text' : 'password'}
              value={neonUrlInput}
              onChange={(e) => setNeonUrlInput(e.target.value)}
              placeholder="postgresql://usuario:senha@ep-exemplo.us-east-2.aws.neon.tech/neondb?sslmode=require"
              className="w-full pl-3 pr-20 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
            <div className="absolute right-2 flex items-center gap-1">
              <button
                type="button"
                onClick={() => setShowNeonPassword(!showNeonPassword)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-md"
                title={showNeonPassword ? 'Ocultar senha' : 'Exibir senha'}
              >
                {showNeonPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between gap-2 flex-wrap pt-1">
            <div className="flex items-center gap-2">
              <button
                type="submit"
                disabled={loadingDb}
                className="flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs transition shadow-xs disabled:opacity-50"
              >
                {loadingDb ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Link className="w-3.5 h-3.5" />}
                Salvar & Conectar ao Neon
              </button>

              {localStorage.getItem('neon_db_url') && (
                <button
                  type="button"
                  onClick={handleClearNeonUrl}
                  className="flex items-center gap-1.5 px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded-xl text-xs transition"
                >
                  <Unlink className="w-3.5 h-3.5" />
                  Remover URL Salva
                </button>
              )}
            </div>

            {syncMessage && (
              <span className="text-xs font-medium text-emerald-800 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-200">
                {syncMessage}
              </span>
            )}
          </div>
        </form>

        {/* STATUS BADGE */}
        {dbStatus && (
          <div
            className={`p-4 rounded-xl border flex items-start gap-3 text-xs ${
              dbStatus.connected
                ? 'bg-emerald-50 border-emerald-200/80 text-emerald-900'
                : 'bg-amber-50 border-amber-200/80 text-amber-900'
            }`}
          >
            {dbStatus.connected ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <XCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            )}
            <div className="space-y-1">
              <div className="font-bold text-sm">
                {dbStatus.connected ? 'Conectado ao Neon PostgreSQL' : 'Pendente de Conexão'}
              </div>
              <p className="leading-relaxed">{dbStatus.message}</p>
              {dbStatus.version && (
                <p className="font-mono text-[11px] opacity-80 pt-1">Versão: {dbStatus.version}</p>
              )}
            </div>
          </div>
        )}

        <div className="text-xs text-slate-600 space-y-2 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
          <p className="font-semibold text-slate-800">Passo a passo no Neon.tech:</p>
          <ol className="list-decimal list-inside space-y-1 text-slate-600">
            <li>Acesse o console do <a href="https://neon.tech" target="_blank" rel="noreferrer" className="text-emerald-700 underline font-medium">Neon.tech</a> e abra seu projeto.</li>
            <li>No Dashboard principal, clique no botão <strong>"Connect"</strong>.</li>
            <li>Selecione a opção <strong>"Pooled connection"</strong> ou <strong>"Direct connection"</strong> e copie a URL completa.</li>
            <li>Cole a URL no campo acima e clique em <strong>"Salvar & Conectar ao Neon"</strong>. O sistema criará as tabelas e sincronizará seus dados automaticamente!</li>
          </ol>
        </div>

        {dbStatus?.connected && (
          <div className="pt-2 flex items-center gap-3">
            <button
              onClick={() => handleInitTables()}
              disabled={syncing}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl text-xs transition disabled:opacity-50"
            >
              {syncing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Database className="w-4 h-4" />}
              Inicializar/Verificar Tabelas no Neon
            </button>
          </div>
        )}
      </div>

      {/* STORAGE ENGINE INFO */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
          <div className="p-2.5 bg-emerald-100 text-emerald-800 rounded-xl">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-base text-slate-800">Armazenamento em Nuvem Neon PostgreSQL</h3>
            <p className="text-xs text-slate-500">Persistência direta e segura na nuvem</p>
          </div>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          O aplicativo armazena todas as suas movimentações, cartões, categorias e orçamentos diretamente no banco de dados <code className="bg-slate-100 px-1.5 py-0.5 rounded text-emerald-800 font-mono">Neon PostgreSQL</code> em nuvem.
        </p>

        <div className="flex items-center gap-2 p-3 bg-emerald-50 rounded-xl text-xs font-semibold text-emerald-900 border border-emerald-200/60">
          <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>Privacidade & Segurança: Seus dados financeiros estão armazenados na nuvem no seu banco de dados.</span>
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

