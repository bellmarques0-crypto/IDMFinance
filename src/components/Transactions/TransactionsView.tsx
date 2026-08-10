import React, { useState, useMemo } from 'react';
import {
  Plus,
  Search,
  FilterX,
  Edit2,
  Trash2,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  Tag,
  CreditCard as CreditCardIcon,
  Receipt,
  CheckCircle2,
} from 'lucide-react';
import { Category, Transaction } from '../../types';
import {
  EXPENSE_TYPE_LABELS,
  formatBRL,
  formatDateBR,
  PAYMENT_METHOD_LABELS,
} from '../../utils/formatters';

interface TransactionsViewProps {
  selectedMonthYear: string; // 'YYYY-MM'
  transactions: Transaction[];
  categories: Category[];
  onOpenNewTransaction: () => void;
  onEditTransaction: (tx: Transaction) => void;
  onDeleteTransaction: (tx: Transaction) => void;
}

export const TransactionsView: React.FC<TransactionsViewProps> = ({
  selectedMonthYear,
  transactions,
  categories,
  onOpenNewTransaction,
  onEditTransaction,
  onDeleteTransaction,
}) => {
  // Filters state
  const [useMonthYearFilter, setUseMonthYearFilter] = useState(true);
  const [monthYearFilter, setMonthYearFilter] = useState(selectedMonthYear);
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [expenseTypeFilter, setExpenseTypeFilter] = useState<'all' | 'fixed' | 'variable'>('all');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  const categoryMap = useMemo(() => {
    const map = new Map<string, Category>();
    categories.forEach((cat) => map.set(cat.id, cat));
    return map;
  }, [categories]);

  // Apply filters
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      // Month / Year or custom date range filter
      if (useMonthYearFilter) {
        if (monthYearFilter && tx.date.substring(0, 7) !== monthYearFilter) {
          return false;
        }
      } else {
        if (customStartDate && tx.date < customStartDate) return false;
        if (customEndDate && tx.date > customEndDate) return false;
      }

      // Type filter
      if (typeFilter !== 'all' && tx.type !== typeFilter) return false;

      // Category filter
      if (categoryFilter !== 'all' && tx.categoryId !== categoryFilter) return false;

      // Expense type filter
      if (expenseTypeFilter !== 'all' && tx.expenseType !== expenseTypeFilter) return false;

      // Payment method filter
      if (paymentMethodFilter !== 'all' && tx.paymentMethod !== paymentMethodFilter) return false;

      // Search text filter
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        const descMatch = tx.description.toLowerCase().includes(query);
        const notesMatch = tx.notes ? tx.notes.toLowerCase().includes(query) : false;
        const cat = categoryMap.get(tx.categoryId);
        const catMatch = cat ? cat.name.toLowerCase().includes(query) : false;

        if (!descMatch && !notesMatch && !catMatch) return false;
      }

      return true;
    });
  }, [
    transactions,
    useMonthYearFilter,
    monthYearFilter,
    typeFilter,
    categoryFilter,
    expenseTypeFilter,
    paymentMethodFilter,
    searchQuery,
    customStartDate,
    customEndDate,
    categoryMap,
  ]);

  // Sort descending by date
  const sortedTransactions = useMemo(() => {
    return [...filteredTransactions].sort((a, b) => b.date.localeCompare(a.date));
  }, [filteredTransactions]);

  // Filter totals
  const totalFilteredIncome = sortedTransactions
    .filter((tx) => tx.type === 'income')
    .reduce((s, tx) => s + tx.amount, 0);

  const totalFilteredExpense = sortedTransactions
    .filter((tx) => tx.type === 'expense')
    .reduce((s, tx) => s + tx.amount, 0);

  const handleClearFilters = () => {
    setUseMonthYearFilter(true);
    setMonthYearFilter(selectedMonthYear);
    setTypeFilter('all');
    setCategoryFilter('all');
    setExpenseTypeFilter('all');
    setPaymentMethodFilter('all');
    setSearchQuery('');
    setCustomStartDate('');
    setCustomEndDate('');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-extrabold text-slate-800 tracking-tight">
            Lançamentos Financeiros
          </h2>
          <p className="text-xs md:text-sm text-slate-500 font-medium">
            Cadastre, pesquise, edite e acompanhe suas entradas e saídas.
          </p>
        </div>

        <button
          onClick={onOpenNewTransaction}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl font-bold text-xs shadow-md transition"
        >
          <Plus className="w-4 h-4" />
          <span>NOVO LANÇAMENTO</span>
        </button>
      </div>

      {/* FILTER BAR CONTAINER */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-emerald-800" />
            <h3 className="font-bold text-sm text-slate-800">Filtros de Busca</h3>
          </div>

          <button
            onClick={handleClearFilters}
            className="flex items-center gap-1 text-xs font-semibold text-rose-600 hover:text-rose-800 hover:underline"
          >
            <FilterX className="w-3.5 h-3.5" />
            <span>LIMPAR FILTROS</span>
          </button>
        </div>

        {/* Filters Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 text-xs">
          {/* Text Search */}
          <div className="sm:col-span-2">
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Pesquisar por Descrição</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Ex: Mercado, Salário, Conta de luz..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-hidden focus:border-emerald-700 focus:bg-white transition"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
            </div>
          </div>

          {/* Month / Year Toggle Filter */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Modo do Período</label>
            <select
              value={useMonthYearFilter ? 'month' : 'custom'}
              onChange={(e) => setUseMonthYearFilter(e.target.value === 'month')}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-hidden focus:border-emerald-700"
            >
              <option value="month">Por Mês/Ano</option>
              <option value="custom">Período Personalizado</option>
            </select>
          </div>

          {/* Month/Year Picker or Custom Dates */}
          {useMonthYearFilter ? (
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Mês/Ano</label>
              <input
                type="month"
                value={monthYearFilter}
                onChange={(e) => setMonthYearFilter(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-hidden focus:border-emerald-700"
              />
            </div>
          ) : (
            <div className="sm:col-span-2 grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Data Inicial</label>
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-hidden focus:border-emerald-700"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Data Final</label>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-hidden focus:border-emerald-700"
                />
              </div>
            </div>
          )}

          {/* Tipo (Entrada/Saída) */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Tipo</label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-hidden focus:border-emerald-700"
            >
              <option value="all">Todos os tipos</option>
              <option value="income">Entrada</option>
              <option value="expense">Saída / Despesa</option>
            </select>
          </div>

          {/* Categoria */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Categoria</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-hidden focus:border-emerald-700"
            >
              <option value="all">Todas as categorias</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.group} › {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Fixo / Variável */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Fixo / Variável</label>
            <select
              value={expenseTypeFilter}
              onChange={(e) => setExpenseTypeFilter(e.target.value as any)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-hidden focus:border-emerald-700"
            >
              <option value="all">Todos</option>
              <option value="fixed">Fixo</option>
              <option value="variable">Variável</option>
            </select>
          </div>

          {/* Forma de Pagamento */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Forma de Pagamento</label>
            <select
              value={paymentMethodFilter}
              onChange={(e) => setPaymentMethodFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-hidden focus:border-emerald-700"
            >
              <option value="all">Todas as formas</option>
              <option value="pix">Pix</option>
              <option value="dinheiro">Dinheiro</option>
              <option value="debito">Débito</option>
              <option value="credito">Crédito</option>
              <option value="transferencia">Transferência</option>
              <option value="boleto">Boleto</option>
              <option value="outro">Outro</option>
            </select>
          </div>
        </div>
      </div>

      {/* FILTER SUMMARY BADGE BAR */}
      <div className="bg-emerald-950/5 border border-emerald-900/10 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-4">
          <span className="font-bold text-slate-700">
            Total filtrado ({sortedTransactions.length} itens):
          </span>
          <span className="text-emerald-700 font-extrabold">
            + {formatBRL(totalFilteredIncome)} (Entradas)
          </span>
          <span className="text-rose-600 font-extrabold">
            - {formatBRL(totalFilteredExpense)} (Saídas)
          </span>
        </div>

        <div className="text-slate-600 font-semibold">
          Saldo Líquido:{' '}
          <span
            className={
              totalFilteredIncome - totalFilteredExpense >= 0
                ? 'text-emerald-800 font-bold'
                : 'text-rose-600 font-bold'
            }
          >
            {formatBRL(totalFilteredIncome - totalFilteredExpense)}
          </span>
        </div>
      </div>

      {/* TRANSACTIONS TABLE / CARDS */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {sortedTransactions.length === 0 ? (
          <div className="py-16 text-center text-slate-400 space-y-3">
            <Receipt className="w-12 h-12 mx-auto text-slate-300" />
            <p className="font-semibold text-slate-600 text-sm">
              Nenhum lançamento encontrado para os filtros selecionados.
            </p>
            <button
              onClick={handleClearFilters}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition"
            >
              Limpar Filtros de Busca
            </button>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200/80">
                  <tr>
                    <th className="py-3.5 px-4">Data</th>
                    <th className="py-3.5 px-4">Tipo</th>
                    <th className="py-3.5 px-4">Descrição</th>
                    <th className="py-3.5 px-4">Categoria</th>
                    <th className="py-3.5 px-4">Forma Pgto</th>
                    <th className="py-3.5 px-4">Fixo / Variável</th>
                    <th className="py-3.5 px-4 text-right">Valor</th>
                    <th className="py-3.5 px-4 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sortedTransactions.map((tx) => {
                    const cat = categoryMap.get(tx.categoryId);
                    return (
                      <tr key={tx.id} className="hover:bg-slate-50/80 transition">
                        {/* Data */}
                        <td className="py-3.5 px-4 font-semibold text-slate-700 whitespace-nowrap">
                          {formatDateBR(tx.date)}
                        </td>

                        {/* Tipo */}
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                              tx.type === 'income'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {tx.type === 'income' ? (
                              <>
                                <ArrowUpRight className="w-3 h-3" />
                                Entrada
                              </>
                            ) : (
                              <>
                                <ArrowDownLeft className="w-3 h-3" />
                                Saída
                              </>
                            )}
                          </span>
                        </td>

                        {/* Descrição & Notes */}
                        <td className="py-3.5 px-4 max-w-xs">
                          <div className="font-bold text-slate-800 text-sm">{tx.description}</div>
                          {tx.notes && <div className="text-[11px] text-slate-400 truncate">{tx.notes}</div>}
                          {tx.installmentNumber && (
                            <div className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded-sm inline-block mt-0.5">
                              Parcela {tx.installmentNumber}/{tx.totalInstallments}
                            </div>
                          )}
                        </td>

                        {/* Categoria */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className="font-medium text-slate-700">{cat ? cat.name : 'Outros'}</span>
                          {cat && <span className="block text-[10px] text-slate-400">{cat.group}</span>}
                        </td>

                        {/* Forma de pagamento */}
                        <td className="py-3.5 px-4 whitespace-nowrap font-medium text-slate-600">
                          {PAYMENT_METHOD_LABELS[tx.paymentMethod] || tx.paymentMethod}
                        </td>

                        {/* Fixo/Variável */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                              tx.expenseType === 'fixed'
                                ? 'bg-slate-100 text-slate-700'
                                : 'bg-amber-50 text-amber-800 border border-amber-200/50'
                            }`}
                          >
                            {EXPENSE_TYPE_LABELS[tx.expenseType]}
                          </span>
                        </td>

                        {/* Valor */}
                        <td
                          className={`py-3.5 px-4 text-right font-extrabold text-sm whitespace-nowrap ${
                            tx.type === 'income' ? 'text-emerald-700' : 'text-rose-600'
                          }`}
                        >
                          {tx.type === 'income' ? '+' : '-'} {formatBRL(tx.amount)}
                        </td>

                        {/* Ações */}
                        <td className="py-3.5 px-4 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => onEditTransaction(tx)}
                              className="p-1.5 text-slate-500 hover:text-emerald-800 hover:bg-emerald-50 rounded-lg transition"
                              title="Editar Lançamento"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => onDeleteTransaction(tx)}
                              className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                              title="Excluir Lançamento"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards View */}
            <div className="block md:hidden divide-y divide-slate-100">
              {sortedTransactions.map((tx) => {
                const cat = categoryMap.get(tx.categoryId);
                return (
                  <div key={tx.id} className="p-4 space-y-2 hover:bg-slate-50 transition">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-500">{formatDateBR(tx.date)}</span>
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                          tx.type === 'income'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {tx.type === 'income' ? 'Entrada' : 'Saída'}
                      </span>
                    </div>

                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-bold text-slate-800 text-sm">{tx.description}</h4>
                        <p className="text-xs text-slate-500 font-medium">
                          {cat ? cat.name : 'Outros'} • {PAYMENT_METHOD_LABELS[tx.paymentMethod]}
                        </p>
                      </div>
                      <div
                        className={`text-base font-extrabold ${
                          tx.type === 'income' ? 'text-emerald-700' : 'text-rose-600'
                        }`}
                      >
                        {tx.type === 'income' ? '+' : '-'} {formatBRL(tx.amount)}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                        {EXPENSE_TYPE_LABELS[tx.expenseType]}
                      </span>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onEditTransaction(tx)}
                          className="px-2.5 py-1 text-xs font-bold text-slate-600 bg-slate-100 rounded-lg hover:bg-emerald-50 hover:text-emerald-800 transition"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => onDeleteTransaction(tx)}
                          className="px-2.5 py-1 text-xs font-bold text-rose-600 bg-rose-50 rounded-lg hover:bg-rose-100 transition"
                        >
                          Excluir
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
