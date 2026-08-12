import React, { useState, useEffect } from 'react';
import { Settings, RefreshCw, Trash2, Download, Upload, ShieldCheck, User, Save, AlertCircle, CheckCircle2, Cloud, Database } from 'lucide-react';
import { FirestoreService } from '../../services/firestoreService';

interface SettingsViewProps {
  onResetSampleData: () => void;
  onClearAllData: () => void;
  currentUser?: string;
  onUpdateUser?: (newUsername: string) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  onResetSampleData,
  onClearAllData,
  currentUser,
  onUpdateUser,
}) => {
  // User Management State
  const [usernameInput, setUsernameInput] = useState(currentUser || 'Izabel');
  const [userMsg, setUserMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [dbStatus, setDbStatus] = useState<{ connected: boolean; message: string }>({
    connected: true,
    message: 'Verificando conexão com Firebase Cloud Firestore...',
  });

  useEffect(() => {
    localStorage.removeItem('neon_db_url');
    FirestoreService.checkConnection().then((res) => {
      setDbStatus(res);
    });
  }, []);

  useEffect(() => {
    if (currentUser) {
      setUsernameInput(currentUser);
    }
  }, [currentUser]);

  const handleSaveUsername = (e: React.FormEvent) => {
    e.preventDefault();
    setUserMsg(null);
    const clean = usernameInput.trim();
    if (!clean) {
      setUserMsg({ type: 'error', text: 'O nome do titular não pode ficar em branco.' });
      return;
    }

    if (onUpdateUser) {
      onUpdateUser(clean);
    }
    setUserMsg({ type: 'success', text: `Nome alterado para "${clean}" com sucesso!` });
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
          Gerencie seu perfil de usuário, banco de dados SQLite e dados do sistema.
        </p>
      </div>

      {/* CLOUD DATABASE STATUS CARD */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-emerald-600 to-teal-700 text-white rounded-xl shadow-xs">
            <Cloud className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-base text-slate-800 flex items-center gap-2">
              <span>Banco de Dados na Nuvem (Firebase Cloud Firestore)</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                Ativo
              </span>
            </h3>
            <p className="text-xs text-slate-500">
              Seus dados financeiros estão armazenados com segurança na nuvem do Google Firebase.
            </p>
          </div>
        </div>

        <div className="p-3.5 rounded-xl border bg-emerald-50/70 border-emerald-200 text-emerald-900 text-xs font-medium flex items-center gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{dbStatus.message}</span>
        </div>
      </div>

      {/* USER MANAGEMENT CARD */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-[#415c3f] to-[#5d8259] text-[#d1f2cc] rounded-xl shadow-xs">
              <User className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-800">
                Perfil do Titular da Carteira
              </h3>
              <p className="text-xs text-slate-500">
                Altere o nome exibido na sua carteira financeira
              </p>
            </div>
          </div>
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

        <div className="pt-1">
          {/* Change Username Form */}
          <form onSubmit={handleSaveUsername} className="space-y-4 p-4 rounded-xl border border-slate-100 bg-slate-50/50 max-w-md">
            <h4 className="font-bold text-sm text-slate-800 flex items-center gap-2">
              <User className="w-4 h-4 text-[#4e6c4a]" />
              Nome do Titular
            </h4>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nome Exibido
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  placeholder="Seu nome..."
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#52724f]"
                />
              </div>
            </div>

            <button
              type="submit"
              className="py-2 px-4 bg-[#4a6848] hover:bg-[#3d573b] text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 shadow-xs"
            >
              <Save className="w-3.5 h-3.5" />
              Atualizar Nome
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

