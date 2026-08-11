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
  User,
} from 'lucide-react';
import { NavigationTab } from '../types';

interface SidebarProps {
  activeTab: NavigationTab;
  onTabChange: (tab: NavigationTab) => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  currentUser?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  isMobileOpen,
  onCloseMobile,
  currentUser,
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
        className={`fixed lg:sticky top-0 left-0 z-40 h-screen w-64 bg-gradient-to-b from-[#324730] via-[#425d3f] to-[#537350] text-white flex flex-col justify-between transition-transform duration-300 ease-in-out shrink-0 border-r border-[#62855e]/50 shadow-xl ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div>
          {/* Logo & Brand Header */}
          <div className="flex items-center justify-between p-5 border-b border-[#5e805a]/70 bg-black/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#4d6b49] to-[#678e63] flex items-center justify-center text-[#e2f5e0] shadow-md border border-[#83ab7e]/60">
                <Wallet className="w-6 h-6" />
              </div>
              <div>
                <h1 className="font-extrabold text-base tracking-tight text-white">
                  <span className="text-[#b1dea9]">IDM</span>Finance
                </h1>
                <p className="text-[11px] text-[#d1ebd1] font-medium">Controle Mensal</p>
              </div>
            </div>

            <button
              onClick={onCloseMobile}
              className="p-1.5 text-[#d1ebd1] hover:text-white rounded-lg lg:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Menu Links */}
          <nav className="p-3 space-y-1">
            <div className="px-3 py-2 text-[10px] font-bold text-[#b1dea9] uppercase tracking-wider">
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
                      ? 'bg-gradient-to-r from-[#5a7c56] to-[#6d9468] text-white font-semibold shadow-md border-l-4 border-[#b1dea9]'
                      : 'text-[#e6f5e4]/90 hover:bg-[#486644]/70 hover:text-white'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-[#b1dea9]' : 'text-[#b1dea9]/70'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* User badge & Footer info */}
        <div className="p-4 border-t border-[#5e805a]/70 bg-black/10 text-xs space-y-3">
          {currentUser && (
            <div className="flex items-center gap-2 p-2.5 bg-[#3a5238]/90 rounded-xl border border-[#6b8f68]/60">
              <div className="w-7 h-7 rounded-lg bg-[#537350] text-[#cbf0c7] flex items-center justify-center shrink-0">
                <User className="w-4 h-4" />
              </div>
              <div className="truncate">
                <p className="text-xs font-bold text-white truncate">{currentUser}</p>
                <p className="text-[10px] text-[#b1dea9]">Carteira Ativa</p>
              </div>
            </div>
          )}
          <div className="text-center text-[#d1ebd1]">
            <p className="font-semibold text-[#f0f9ef]">Sistema Financeiro BRL</p>
            <p className="text-[10px] mt-0.5 text-[#b1dea9]/90">Banco de Dados SQLite Conectado</p>
          </div>
        </div>
      </aside>
    </>
  );
};
