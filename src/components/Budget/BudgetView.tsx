import React, { useState } from 'react';
import {
  Target,
  Plus,
  AlertTriangle,
  TrendingDown,
  Edit3,
  Check,
  PiggyBank,
  CheckCircle2,
  Trash2,
} from 'lucide-react';
import { Category, CategoryBudget, MonthlyBudget, Transaction } from '../../types';
import { formatBRL } from '../../utils/formatters';

interface BudgetViewProps {
  selectedMonthYear: string; // 'YYYY-MM'
  monthlyBudget?: MonthlyBudget;
  categoryBudgets: CategoryBudget[];
  transactions: Transaction[];
  categories: Category[];
  onSaveMonthlyBudget: (monthYear: string, amount: number) => void;
  onSaveCategoryBudget: (monthYear: string, categoryId: string, amount: number) => void;
  onDeleteCategoryBudget: (id: string) => void;
}

export const BudgetView: React.FC<BudgetViewProps> = ({
  selectedMonthYear,
  monthlyBudget,
  categoryBudgets,
  transactions,
  categories,
  onSaveMonthlyBudget,
  onSaveCategoryBudget,
  onDeleteCategoryBudget,
}) => {
  const [isEditingOverall, setIsEditingOverall] = useState(false);
  const [overallInput, setOverallInput] = useState<number>(monthlyBudget ? monthlyBudget.overallAmount : 4000);

  const [isAddingCategoryLimit, setIsAddingCategoryLimit] = useState(false);
  const [selectedCatId, setSelectedCatId] = useState<string>('');
  const [catLimitInput, setCatLimitInput] = useState<number>(500);

  const categoryMap = new Map<string, Category>();
  categories.forEach((c) => categoryMap.set(c.id, c));

  // Current month expense transactions
  const monthExpenseTxs = transactions.filter(
    (tx) => tx.date.substring(0, 7) === selectedMonthYear && tx.type === 'expense'
  );

  const totalSpentInMonth = monthExpenseTxs.reduce((s, tx) => s + tx.amount, 0);
  const overallLimit = monthlyBudget ? monthlyBudget.overallAmount : 0;
  const overallRemaining = overallLimit - totalSpentInMonth;
  const overallPercent = overallLimit > 0 ? (totalSpentInMonth / overallLimit) * 100 : 0;

  const handleSaveOverall = () => {
    onSaveMonthlyBudget(selectedMonthYear, overallInput);
    setIsEditingOverall(false);
  };

  const handleAddCategoryBudget = () => {
    if (!selectedCatId || catLimitInput <= 0) return;
    onSaveCategoryBudget(selectedMonthYear, selectedCatId, catLimitInput);
    setIsAddingCategoryLimit(false);
    setSelectedCatId('');
    setCatLimitInput(500);
  };

  // Filter available categories for new budget limit
  const categoriesWithoutBudget = categories.filter(
    (cat) => cat.type !== 'income' && !categoryBudgets.some((cb) => cb.categoryId === cat.id)
  );

  return (
    <div className="space-y-6 pb-12">
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-extrabold text-slate-800 tracking-tight">
            Orçamento do Mês
          </h2>
          <p className="text-xs md:text-sm text-slate-500 font-medium">
            Defina metas de gastos globais e limites específicos por categoria.
          </p>
        </div>

        <button
          onClick={() => setIsAddingCategoryLimit(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl font-bold text-xs shadow-md transition"
        >
          <Plus className="w-4 h-4" />
          <span>DEFINIR LIMITE POR CATEGORIA</span>
        </button>
      </div>

      {/* OVERALL MONTHLY BUDGET CARD */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-950 text-emerald-300 rounded-xl">
              <PiggyBank className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-800">Orçamento Geral do Mês</h3>
              <p className="text-xs text-slate-500">Teto máximo de gastos planejado</p>
            </div>
          </div>

          {!isEditingOverall ? (
            <button
              onClick={() => {
                setOverallInput(overallLimit);
                setIsEditingOverall(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 text-slate-700 rounded-xl text-xs font-bold transition"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Editar Teto Geral</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={overallInput}
                onChange={(e) => setOverallInput(parseFloat(e.target.value) || 0)}
                className="w-28 px-2 py-1 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold"
              />
              <button
                onClick={handleSaveOverall}
                className="px-3 py-1 bg-emerald-800 text-white text-xs font-bold rounded-lg hover:bg-emerald-900"
              >
                Salvar
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Orçamento Teto</span>
            <span className="text-2xl font-extrabold text-slate-900">{formatBRL(overallLimit)}</span>
          </div>

          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Gasto Atual</span>
            <span className="text-2xl font-extrabold text-rose-600">{formatBRL(totalSpentInMonth)}</span>
          </div>

          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Disponível / Restante</span>
            <span
              className={`text-2xl font-extrabold ${
                overallRemaining >= 0 ? 'text-emerald-700' : 'text-rose-600'
              }`}
            >
              {formatBRL(overallRemaining)}
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="space-y-1.5 pt-2">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-slate-600">Comprometimento do Orçamento:</span>
            <span className={overallPercent > 100 ? 'text-rose-600 font-extrabold' : 'text-emerald-800'}>
              {overallPercent.toFixed(1)}% {overallPercent > 100 && '🚨 TETO ULTRAPASSADO!'}
            </span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                overallPercent > 100
                  ? 'bg-rose-600'
                  : overallPercent > 80
                  ? 'bg-amber-500'
                  : 'bg-emerald-700'
              }`}
              style={{ width: `${Math.min(100, overallPercent)}%` }}
            />
          </div>
        </div>
      </div>

      {/* CATEGORY BUDGET LIMITS SECTION */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-base text-slate-800">Limites de Gastos por Categoria</h3>
            <p className="text-xs text-slate-500">
              Controle individual de categorias críticas (Supermercado, Lazer, Combustível, etc.)
            </p>
          </div>
        </div>

        {/* Category Budget Cards Grid */}
        {categoryBudgets.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs space-y-2">
            <Target className="w-10 h-10 mx-auto text-slate-300" />
            <p className="font-semibold text-slate-600">Nenhum limite por categoria definido para este mês.</p>
            <button
              onClick={() => setIsAddingCategoryLimit(true)}
              className="px-4 py-2 bg-emerald-800 text-white rounded-xl font-bold text-xs hover:bg-emerald-900 transition"
            >
              Adicionar Limite de Categoria
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categoryBudgets.map((cb) => {
              const cat = categoryMap.get(cb.categoryId);
              // Calculate spent in this category
              const spent = monthExpenseTxs
                .filter((tx) => tx.categoryId === cb.categoryId)
                .reduce((s, tx) => s + tx.amount, 0);

              const remaining = cb.amount - spent;
              const percent = cb.amount > 0 ? (spent / cb.amount) * 100 : 0;
              const isOver = spent > cb.amount;

              return (
                <div
                  key={cb.id}
                  className={`rounded-2xl p-5 border shadow-xs space-y-3 transition ${
                    isOver
                      ? 'bg-rose-50/50 border-rose-200'
                      : 'bg-white border-slate-200/80'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm">{cat ? cat.name : 'Categoria'}</h4>
                      <span className="text-[10px] text-slate-400 font-bold uppercase">{cat?.group}</span>
                    </div>

                    <button
                      onClick={() => onDeleteCategoryBudget(cb.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition"
                      title="Remover Limite"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 block">Limite</span>
                      <span className="font-extrabold text-slate-800">{formatBRL(cb.amount)}</span>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-slate-400 block">Gasto</span>
                      <span className="font-extrabold text-rose-600">{formatBRL(spent)}</span>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-slate-400 block">Restante</span>
                      <span
                        className={`font-extrabold ${
                          remaining >= 0 ? 'text-emerald-700' : 'text-rose-600'
                        }`}
                      >
                        {formatBRL(remaining)}
                      </span>
                    </div>
                  </div>

                  {/* Meter Bar */}
                  <div className="space-y-1">
                    <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ${
                          isOver ? 'bg-rose-600' : percent > 85 ? 'bg-amber-500' : 'bg-emerald-700'
                        }`}
                        style={{ width: `${Math.min(100, percent)}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[10px] font-bold">
                      <span className={isOver ? 'text-rose-600 font-extrabold' : 'text-slate-500'}>
                        {percent.toFixed(0)}% utilizado
                      </span>
                      {isOver && (
                        <span className="text-rose-600 font-extrabold flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          Excedeu {formatBRL(Math.abs(remaining))}!
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* MODAL: ADD CATEGORY BUDGET */}
      {isAddingCategoryLimit && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className="p-2.5 bg-emerald-100 text-emerald-800 rounded-xl">
                <Target className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-800">Definir Limite de Categoria</h3>
                <p className="text-xs text-slate-500">Mês {selectedMonthYear}</p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Selecione a Categoria</label>
                <select
                  value={selectedCatId}
                  onChange={(e) => setSelectedCatId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-hidden focus:border-emerald-700"
                >
                  <option value="">-- Selecione uma categoria --</option>
                  {categoriesWithoutBudget.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.group} › {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Limite Máximo do Mês (R$)</label>
                <input
                  type="number"
                  step="10"
                  value={catLimitInput}
                  onChange={(e) => setCatLimitInput(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-hidden focus:border-emerald-700"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setIsAddingCategoryLimit(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddCategoryBudget}
                disabled={!selectedCatId || catLimitInput <= 0}
                className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 disabled:opacity-50 text-white font-bold rounded-xl text-xs transition shadow-md"
              >
                Salvar Limite
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
