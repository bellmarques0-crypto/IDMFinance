import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  PlusCircle,
  Menu,
  Calendar,
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  CreditCard,
} from 'lucide-react';
import { formatMonthYearHeader, getMonthName } from '../utils/formatters';

interface HeaderProps {
  selectedMonthYear: string; // 'YYYY-MM'
  onMonthYearChange: (newMonthYear: string) => void;
  onOpenNewTransaction: (type: 'income' | 'expense') => void;
  onOpenNewRecurring: () => void;
  onOpenNewInstallment: () => void;
  onToggleSidebarMobile: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  selectedMonthYear,
  onMonthYearChange,
  onOpenNewTransaction,
  onOpenNewRecurring,
  onOpenNewInstallment,
  onToggleSidebarMobile,
}) => {
  const [isMonthPickerOpen, setIsMonthPickerOpen] = useState(false);

  const [yearStr, monthStr] = selectedMonthYear.split('-');
  const currentYear = parseInt(yearStr, 10);
  const currentMonthIdx = parseInt(monthStr, 10) - 1;

  const handlePrevMonth = () => {
    let y = currentYear;
    let m = currentMonthIdx - 1;
    if (m < 0) {
      m = 11;
      y -= 1;
    }
    const newMM = String(m + 1).padStart(2, '0');
    onMonthYearChange(`${y}-${newMM}`);
  };

  const handleNextMonth = () => {
    let y = currentYear;
    let m = currentMonthIdx + 1;
    if (m > 11) {
      m = 0;
      y += 1;
    }
    const newMM = String(m + 1).padStart(2, '0');
    onMonthYearChange(`${y}-${newMM}`);
  };

  const handleSetCurrentMonth = () => {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    onMonthYearChange(`${yyyy}-${mm}`);
    setIsMonthPickerOpen(false);
  };

  const handleSelectMonthYear = (mIdx: number, y: number) => {
    const newMM = String(mIdx + 1).padStart(2, '0');
    onMonthYearChange(`${y}-${newMM}`);
    setIsMonthPickerOpen(false);
  };

  const yearsOptions = [currentYear - 2, currentYear - 1, currentYear, currentYear + 1];

  return (
    <header className="bg-white border-b border-emerald-950/10 sticky top-0 z-20 px-4 lg:px-8 py-3 shadow-xs">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left: Mobile Menu Toggle + Month/Year Selector */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebarMobile}
            className="p-2 text-slate-600 hover:text-emerald-900 hover:bg-emerald-50 rounded-lg lg:hidden"
            aria-label="Abrir Menu"
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* Month Selector Pill */}
          <div className="relative">
            <div className="flex items-center bg-emerald-900/5 hover:bg-emerald-900/10 border border-emerald-800/15 rounded-xl p-1 transition">
              <button
                onClick={handlePrevMonth}
                className="p-1.5 text-emerald-900 hover:bg-white rounded-lg transition"
                title="Mês anterior"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <button
                onClick={() => setIsMonthPickerOpen(!isMonthPickerOpen)}
                className="flex items-center gap-2 px-3 py-1 text-emerald-950 font-bold text-sm md:text-base tracking-wide"
              >
                <Calendar className="w-4 h-4 text-emerald-700" />
                <span>{formatMonthYearHeader(selectedMonthYear)}</span>
              </button>

              <button
                onClick={handleNextMonth}
                className="p-1.5 text-emerald-900 hover:bg-white rounded-lg transition"
                title="Próximo mês"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Month Dropdown */}
            {isMonthPickerOpen && (
              <div className="absolute top-full left-0 mt-2 bg-white rounded-2xl shadow-xl border border-slate-200 p-4 z-50 w-72">
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Selecionar Período
                  </span>
                  <button
                    onClick={handleSetCurrentMonth}
                    className="text-xs text-emerald-700 font-semibold hover:underline"
                  >
                    Mês Atual
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-1.5 mb-3">
                  {Array.from({ length: 12 }).map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSelectMonthYear(idx, currentYear)}
                      className={`px-2 py-2 text-xs font-medium rounded-lg text-center transition ${
                        idx === currentMonthIdx
                          ? 'bg-emerald-800 text-white font-bold'
                          : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {getMonthName(idx).slice(0, 3)}
                    </button>
                  ))}
                </div>

                <div className="flex items-center justify-center gap-2 pt-2 border-t border-slate-100">
                  {yearsOptions.map((y) => (
                    <button
                      key={y}
                      onClick={() => handleSelectMonthYear(currentMonthIdx, y)}
                      className={`px-3 py-1 text-xs font-semibold rounded-md border ${
                        y === currentYear
                          ? 'border-emerald-800 bg-emerald-50 text-emerald-900 font-bold'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {y}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Quick Action Buttons */}
        <div className="flex items-center flex-wrap gap-2">
          <button
            onClick={() => onOpenNewTransaction('income')}
            className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition"
          >
            <ArrowUpRight className="w-4 h-4" />
            <span>Entrada</span>
          </button>

          <button
            onClick={() => onOpenNewTransaction('expense')}
            className="flex items-center gap-1.5 px-3 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold shadow-xs transition"
          >
            <ArrowDownLeft className="w-4 h-4" />
            <span>Despesa</span>
          </button>

          <button
            onClick={onOpenNewRecurring}
            className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-[#4a6b47] to-[#5d8259] hover:from-[#3d5a3b] hover:to-[#4e704a] text-white rounded-xl text-xs font-semibold shadow-xs transition"
          >
            <Clock className="w-4 h-4 text-[#d2f2cc]" />
            <span className="hidden sm:inline">Despesa Fixa</span>
            <span className="sm:hidden">Fixa</span>
          </button>

          <button
            onClick={onOpenNewInstallment}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-semibold shadow-xs transition"
          >
            <CreditCard className="w-4 h-4 text-amber-300" />
            <span className="hidden sm:inline">Compra Parcelada</span>
            <span className="sm:hidden">Parcelada</span>
          </button>
        </div>
      </div>
    </header>
  );
};
