import React from 'react';
import { Settings, RefreshCw, Trash2, Download, Upload, ShieldCheck, Database } from 'lucide-react';

interface SettingsViewProps {
  onResetSampleData: () => void;
  onClearAllData: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  onResetSampleData,
  onClearAllData,
}) => {
  const handleConfirmReset = () => {
    if (
      window.confirm(
        'Deseja restaurar os dados de exemplo? Todos os lançamentos e configurações atuais serão substituídos pelos dados iniciais.'
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
          Gerencie o armazenamento de dados locais, restaure exemplos ou limpe seu banco.
        </p>
      </div>

      {/* STORAGE ENGINE INFO */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
          <div className="p-2.5 bg-emerald-100 text-emerald-800 rounded-xl">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-base text-slate-800">Armazenamento Local</h3>
            <p className="text-xs text-slate-500">Seus dados ficam gravados com segurança no seu navegador</p>
          </div>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          Este aplicativo utiliza a API <code className="bg-slate-100 px-1.5 py-0.5 rounded text-emerald-800 font-mono">localStorage</code> do navegador. Os dados permanecem salvos mesmo quando você fecha a aba ou reinicia o computador.
        </p>

        <div className="flex items-center gap-2 p-3 bg-emerald-50 rounded-xl text-xs font-semibold text-emerald-900 border border-emerald-200/60">
          <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>Segurança: Nenhum dado financeiro é transmitido para servidores terceiros não autorizados.</span>
        </div>
      </div>

      {/* DATA MANAGEMENT ACTIONS */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
        <h3 className="font-bold text-base text-slate-800 pb-2 border-b border-slate-100">
          Ações de Banco de Dados
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl border border-slate-200 space-y-3">
            <div className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-emerald-700" />
              <span>Restaurar Dados de Exemplo</span>
            </div>
            <p className="text-xs text-slate-500">
              Substitui as informações atuais pelos lançamentos de exemplo (Salário R$ 4.000, Financiamentos, Água, Luz, etc.).
            </p>
            <button
              onClick={handleConfirmReset}
              className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl text-xs transition"
            >
              Restaurar Dados Iniciais
            </button>
          </div>

          <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/30 space-y-3">
            <div className="font-bold text-rose-800 text-sm flex items-center gap-2">
              <Trash2 className="w-4 h-4 text-rose-600" />
              <span>Limpar Todos os Lançamentos</span>
            </div>
            <p className="text-xs text-slate-500">
              Apaga completamente todas as movimentações, despesas fixas e cartões, deixando o sistema zerado.
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
