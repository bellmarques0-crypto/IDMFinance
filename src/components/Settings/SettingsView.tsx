import React, { useState, useEffect } from 'react';
import { Settings, RefreshCw, Trash2, Download, Upload, ShieldCheck, Database, CheckCircle2, XCircle, Loader2 } from 'lucide-react';

interface SettingsViewProps {
  onResetSampleData: () => void;
  onClearAllData: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  onResetSampleData,
  onClearAllData,
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

  const checkDbStatus = async () => {
    setLoadingDb(true);
    try {
      const res = await fetch('/api/db/status');
      const data = await res.json();
      setDbStatus(data);
    } catch (err) {
      setDbStatus({
        configured: false,
        connected: false,
        message: 'Erro ao comunicar com o servidor da aplicação.',
      });
    } finally {
      setLoadingDb(false);
    }
  };

  useEffect(() => {
    checkDbStatus();
  }, []);

  const handleInitTables = async () => {
    setSyncing(true);
    setSyncMessage(null);
    try {
      const res = await fetch('/api/db/init', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setSyncMessage('Tabelas verificadas/criadas no Neon com sucesso!');
        checkDbStatus();
      } else {
        setSyncMessage(`Erro: ${data.message}`);
      }
    } catch (err: any) {
      setSyncMessage(`Erro ao inicializar tabelas: ${err.message}`);
    } finally {
      setSyncing(false);
    }
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
          Gerencie o banco de dados Neon PostgreSQL e armazenamento do sistema.
        </p>
      </div>

      {/* NEON POSTGRESQL CARD */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
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
            onClick={checkDbStatus}
            disabled={loadingDb}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg text-xs transition"
          >
            {loadingDb ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
            Testar Conexão
          </button>
        </div>

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
          <p className="font-semibold text-slate-800">Como configurar sua conexão do Neon:</p>
          <ol className="list-decimal list-inside space-y-1 text-slate-600">
            <li>Acesse o console do <a href="https://neon.tech" target="_blank" rel="noreferrer" className="text-emerald-700 underline font-medium">Neon.tech</a> e crie ou selecione seu projeto.</li>
            <li>Copie a string de conexão (<code className="font-mono bg-slate-200 px-1 rounded">postgresql://...sslmode=require</code>).</li>
            <li>Adicione a chave <code className="font-mono bg-slate-200 px-1 rounded">DATABASE_URL</code> no painel de Segredos/Variáveis do AI Studio ou arquivo <code className="font-mono bg-slate-200 px-1 rounded">.env</code>.</li>
          </ol>
        </div>

        {dbStatus?.connected && (
          <div className="pt-2 flex items-center gap-3">
            <button
              onClick={handleInitTables}
              disabled={syncing}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl text-xs transition disabled:opacity-50"
            >
              {syncing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Database className="w-4 h-4" />}
              Inicializar Tabelas no Neon
            </button>
            {syncMessage && <span className="text-xs text-emerald-700 font-medium">{syncMessage}</span>}
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
            <h3 className="font-bold text-base text-slate-800">Armazenamento do Navegador</h3>
            <p className="text-xs text-slate-500">Fallback automático no navegador para uso offline/local</p>
          </div>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          O aplicativo salva e sincroniza localmente no <code className="bg-slate-100 px-1.5 py-0.5 rounded text-emerald-800 font-mono">localStorage</code> do seu navegador.
        </p>

        <div className="flex items-center gap-2 p-3 bg-emerald-50 rounded-xl text-xs font-semibold text-emerald-900 border border-emerald-200/60">
          <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>Privacidade: Seus dados estão seguros e mantidos de acordo com suas configurações.</span>
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

