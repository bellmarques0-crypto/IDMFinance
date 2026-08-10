import React from 'react';
import {
  LayoutDashboard,
  Receipt,
  CalendarClock,
  Target,
  BarChart2,
  CreditCard,
  FolderTree,
  FileSpreadsheet,
  Settings,
  Wallet,
  X,
} from 'lucide-react';
import { NavigationTab } from '../types';

interface SidebarProps {
  activeTab: NavigationTab;
  onTabChange: (tab: NavigationTab) => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  isMobileOpen,
  onCloseMobile,
}) => {
  const navItems: { id: NavigationTab; label: string; icon: React.ElementType }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'transactions', label: 'Lançamentos', icon: Receipt },
    { id: 'recurring', label: 'Despesas Fixas', icon: CalendarClock },
    { id: 'budget', label: 'Orçamento do Mês', icon: Target },
    { id: 'comparison', label: 'Comparação', icon: BarChart2 },
    { id: 'credit_cards', label: 'Cartão de Crédito', icon: CreditCard },
    { id: 'categories', label: 'Categorias', icon: FolderTree },
    { id: 'reports', label: 'Relatórios', icon: FileSpreadsheet },
    { id: 'settings', label: 'Configurações', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-30 lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Drawer */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-40 h-screen w-64 bg-emerald-950 text-white flex flex-col justify-between transition-transform duration-300 ease-in-out shrink-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div>
          {/* Logo & Brand Header */}
          <div className="flex items-center justify-between p-5 border-b border-emerald-900/60">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-800 flex items-center justify-center text-emerald-300 shadow-md border border-emerald-700/50">
                <Wallet className="w-6 h-6" />
              </div>
              <div>
                <h1 className="font-extrabold text-base tracking-tight text-emerald-50">
                  Finanças<span className="text-emerald-400">Pessoal</span>
                </h1>
                <p className="text-[11px] text-emerald-300/80 font-medium">Controle Mensal</p>
              </div>
            </div>

            <button
              onClick={onCloseMobile}
              className="p-1.5 text-emerald-300 hover:text-white rounded-lg lg:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Menu Links */}
          <nav className="p-3 space-y-1">
            <div className="px-3 py-2 text-[10px] font-bold text-emerald-400/80 uppercase tracking-wider">
              Menu Principal
            </div>

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onTabChange(item.id);
                    onCloseMobile();
                  }}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all ${
                    isActive
                      ? 'bg-emerald-800 text-white font-semibold shadow-inner border-l-4 border-emerald-400'
                      : 'text-emerald-100/70 hover:bg-emerald-900/50 hover:text-white'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-emerald-300' : 'text-emerald-400/60'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer info badge */}
        <div className="p-4 border-t border-emerald-900/60 text-xs text-emerald-300/70 text-center">
          <p className="font-semibold text-emerald-200">Sistema Financeiro BRL</p>
          <p className="text-[10px] mt-0.5 text-emerald-400/60">Dados salvos localmente no navegador</p>
        </div>
      </aside>
    </>
  );
};
