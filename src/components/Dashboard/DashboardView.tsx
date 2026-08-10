import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  Scale,
  CalendarCheck,
  Layers,
  Percent,
  AlertCircle,
  Tag,
  Receipt,
  ArrowRight,
  ShieldCheck,
  PlusCircle,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  CartesianGrid,
} from 'recharts';
import { Category, Transaction } from '../../types';
import { formatBRL, formatDateBR, PAYMENT_METHOD_LABELS } from '../../utils/formatters';

interface DashboardViewProps {
  selectedMonthYear: string; // 'YYYY-MM'
  transactions: Transaction[];
  categories: Category[];
  onNavigateToTab: (tab: any) => void;
  onOpenNewTransaction: (type: 'income' | 'expense') => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  selectedMonthYear,
  transactions,
  categories,
  onNavigateToTab,
  onOpenNewTransaction,
}) => {
  // Filter transactions for selected month
  const currentMonthTransactions = transactions.filter(
    (tx) => tx.date.substring(0, 7) === selectedMonthYear
  );

  // Totals for current month
  const totalIncome = currentMonthTransactions
    .filter((tx) => tx.type === 'income')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const totalExpense = currentMonthTransactions
    .filter((tx) => tx.type === 'expense')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const balance = totalIncome - totalExpense;

  const totalFixedExpense = currentMonthTransactions
    .filter((tx) => tx.type === 'expense' && tx.expenseType === 'fixed')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const totalVariableExpense = currentMonthTransactions
    .filter((tx) => tx.type === 'expense' && tx.expenseType === 'variable')
    .reduce((sum, tx) => sum + tx.amount, 0);

  // Percentage committed: (Total Expense / Total Income) * 100
  const committedPercent = totalIncome > 0 ? (totalExpense / totalIncome) * 100 : 0;

  // Find category map
  const categoryMap = new Map<string, Category>();
  categories.forEach((cat) => categoryMap.set(cat.id, cat));

  // Find biggest expense category in selected month
  const categoryExpenses: Record<string, { name: string; total: number }> = {};
  currentMonthTransactions
    .filter((tx) => tx.type === 'expense')
    .forEach((tx) => {
      const cat = categoryMap.get(tx.categoryId);
      const catName = cat ? cat.name : 'Outros';
      if (!categoryExpenses[catName]) {
        categoryExpenses[catName] = { name: catName, total: 0 };
      }
      categoryExpenses[catName].total += tx.amount;
    });

  const categoryExpenseList = Object.values(categoryExpenses).sort((a, b) => b.total - a.total);
  const topExpenseCategory = categoryExpenseList[0] || { name: 'Nenhum', total: 0 };

  // Find biggest individual expense transaction
  const sortedExpenses = [...currentMonthTransactions]
    .filter((tx) => tx.type === 'expense')
    .sort((a, b) => b.amount - a.amount);
  const topIndividualExpense = sortedExpenses[0];

  // --- CHART 1: Entradas x Saídas x Saldo por mês (Past 6 Months) ---
  const [currentYear, currentMonthNum] = selectedMonthYear.split('-').map(Number);
  const past6Months: string[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(currentYear, currentMonthNum - 1 - i, 1);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    past6Months.push(`${yyyy}-${mm}`);
  }

  const chart1Data = past6Months.map((mKey) => {
    const monthTxs = transactions.filter((tx) => tx.date.substring(0, 7) === mKey);
    const inc = monthTxs.filter((tx) => tx.type === 'income').reduce((s, tx) => s + tx.amount, 0);
    const exp = monthTxs.filter((tx) => tx.type === 'expense').reduce((s, tx) => s + tx.amount, 0);
    const bal = inc - exp;
    const [y, m] = mKey.split('-');
    const monthShortNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const name = `${monthShortNames[parseInt(m, 10) - 1]}/${y.substring(2)}`;

    return {
      name,
      Entradas: inc,
      Saídas: exp,
      Saldo: bal,
    };
  });

  // --- CHART 2: Gastos por Categoria (Pie/Donut) ---
  const COLORS = ['#2E4D3E', '#16A34A', '#0284C7', '#EAB308', '#8B5CF6', '#EC4899', '#F97316', '#64748B'];
  const chart2Data = categoryExpenseList.map((item) => ({
    name: item.name,
    value: item.total,
  }));

  // --- CHART 3: Evolução Mensal das Despesas ---
  const chart3Data = chart1Data.map((d) => ({
    name: d.name,
    Despesas: d.Saídas,
  }));

  // --- CHART 4: Gastos Fixos x Variáveis no Mês ---
  const chart4Data = [
    { name: 'Fixos', valor: totalFixedExpense, fill: '#2E4D3E' },
    { name: 'Variáveis', valor: totalVariableExpense, fill: '#16A34A' },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* SECTION HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-xl md:text-2xl font-extrabold text-slate-800 tracking-tight">
            Visão Geral das Finanças
          </h2>
          <p className="text-xs md:text-sm text-slate-500 font-medium">
            Acompanhe a saúde financeira, receitas e despesas do mês selecionado.
          </p>
        </div>

        <button
          onClick={() => onNavigateToTab('reports')}
          className="self-start sm:self-auto flex items-center gap-1.5 text-xs font-bold text-emerald-800 hover:text-emerald-950 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 px-3 py-1.5 rounded-xl transition"
        >
          <span>Ver Relatórios Detalhados</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* TOP CARDS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Entradas */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Entradas</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-xl md:text-2xl font-extrabold text-emerald-700 tracking-tight">
              {formatBRL(totalIncome)}
            </div>
            <p className="text-[11px] text-slate-400 font-medium mt-1">Total recebido no mês</p>
          </div>
        </div>

        {/* Despesas */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Despesas</span>
            <div className="p-2 bg-rose-50 text-rose-600 rounded-xl">
              <TrendingDown className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-xl md:text-2xl font-extrabold text-rose-600 tracking-tight">
              {formatBRL(totalExpense)}
            </div>
            <p className="text-[11px] text-slate-400 font-medium mt-1">Total gasto no mês</p>
          </div>
        </div>

        {/* Saldo */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Saldo Final</span>
            <div className={`p-2 rounded-xl ${balance >= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
              <Scale className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className={`text-xl md:text-2xl font-extrabold tracking-tight ${balance >= 0 ? 'text-emerald-800' : 'text-rose-600'}`}>
              {formatBRL(balance)}
            </div>
            <p className="text-[11px] text-slate-400 font-medium mt-1">Entradas - Despesas</p>
          </div>
        </div>

        {/* Despesas Fixas */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Gastos Fixos</span>
            <div className="p-2 bg-emerald-950/5 text-emerald-900 rounded-xl">
              <CalendarCheck className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-xl md:text-2xl font-extrabold text-slate-800 tracking-tight">
              {formatBRL(totalFixedExpense)}
            </div>
            <p className="text-[11px] text-slate-400 font-medium mt-1">Compromissos mensais</p>
          </div>
        </div>

        {/* Despesas Variáveis */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Gastos Variáveis</span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
              <Layers className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-xl md:text-2xl font-extrabold text-slate-800 tracking-tight">
              {formatBRL(totalVariableExpense)}
            </div>
            <p className="text-[11px] text-slate-400 font-medium mt-1">Compras e imprevistos</p>
          </div>
        </div>

        {/* % Comprometido */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">% Comprometido</span>
            <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
              <Percent className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight">
              {committedPercent.toFixed(1)}%
            </div>

            {/* Progress bar */}
            <div className="w-full bg-slate-100 rounded-full h-2 mt-2 overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  committedPercent > 90
                    ? 'bg-rose-500'
                    : committedPercent > 70
                    ? 'bg-amber-500'
                    : 'bg-emerald-600'
                }`}
                style={{ width: `${Math.min(100, committedPercent)}%` }}
              />
            </div>
            <p className="text-[10px] text-slate-400 font-medium mt-1">Da renda total mensal</p>
          </div>
        </div>
      </div>

      {/* HIGHLIGHT RESUMO DO MÊS BANNER */}
      <div className="bg-linear-to-r from-emerald-950 via-emerald-900 to-emerald-950 text-white rounded-2xl p-5 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-800/80 rounded-xl text-emerald-300 border border-emerald-700/60">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-base font-bold text-emerald-100">Resumo Destaques do Mês</h3>
            <p className="text-xs text-emerald-300/80 mt-0.5">
              Rápida identificação do maior grupo de despesa e da maior compra individual.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 bg-emerald-900/50 p-3 rounded-xl border border-emerald-800/80">
          <div className="flex items-center gap-2 border-r border-emerald-800/80 pr-4">
            <Tag className="w-4 h-4 text-emerald-400" />
            <div>
              <span className="text-[10px] uppercase font-bold text-emerald-300/70 block">Maior Categoria</span>
              <span className="text-xs font-bold text-white">
                {topExpenseCategory.name} ({formatBRL(topExpenseCategory.total)})
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Receipt className="w-4 h-4 text-emerald-400" />
            <div>
              <span className="text-[10px] uppercase font-bold text-emerald-300/70 block">Maior Gasto Individual</span>
              <span className="text-xs font-bold text-white">
                {topIndividualExpense ? `${topIndividualExpense.description} (${formatBRL(topIndividualExpense.amount)})` : 'Nenhum lançamento'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* CHARTS GRID SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico 1 — Entradas x Saídas x Saldo */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-slate-800">Entradas x Saídas</h3>
              <p className="text-xs text-slate-500">Comparação financeira dos últimos 6 meses</p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chart1Data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748B' }} />
                <YAxis
                  tick={{ fontSize: 11, fill: '#64748B' }}
                  tickFormatter={(val) => `R$${val >= 1000 ? (val / 1000).toFixed(0) + 'k' : val}`}
                />
                <Tooltip
                  formatter={(val: any) => [formatBRL(Number(val)), '']}
                  contentStyle={{ backgroundColor: '#1E293B', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
                <Bar dataKey="Entradas" fill="#16A34A" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Saídas" fill="#DC2626" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Saldo" fill="#2E4D3E" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfico 2 — Gastos por Categoria */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-slate-800">Gastos por Categoria</h3>
              <p className="text-xs text-slate-500">Distribuição das despesas do mês selecionado</p>
            </div>
          </div>

          {chart2Data.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-slate-400 text-xs">
              <AlertCircle className="w-8 h-8 mb-2 text-slate-300" />
              <span>Nenhum gasto registrado neste mês</span>
            </div>
          ) : (
            <div className="h-64 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chart2Data}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {chart2Data.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: any) => [formatBRL(Number(val)), 'Valor']}
                    contentStyle={{ backgroundColor: '#1E293B', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                  />
                  <Legend
                    layout="vertical"
                    align="right"
                    verticalAlign="middle"
                    wrapperStyle={{ fontSize: '11px', maxHeight: '200px', overflowY: 'auto' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Gráfico 3 — Evolução Mensal das Despesas */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-slate-800">Evolução Mensal das Despesas</h3>
              <p className="text-xs text-slate-500">Tendência histórica do total gasto mês a mês</p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chart3Data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorDespesas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2E4D3E" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#2E4D3E" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748B' }} />
                <YAxis
                  tick={{ fontSize: 11, fill: '#64748B' }}
                  tickFormatter={(val) => `R$${val >= 1000 ? (val / 1000).toFixed(0) + 'k' : val}`}
                />
                <Tooltip
                  formatter={(val: any) => [formatBRL(Number(val)), 'Total Gasto']}
                  contentStyle={{ backgroundColor: '#1E293B', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="Despesas" stroke="#2E4D3E" strokeWidth={3} fillOpacity={1} fill="url(#colorDespesas)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfico 4 — Gastos Fixos x Variáveis */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-slate-800">Gastos Fixos x Variáveis</h3>
              <p className="text-xs text-slate-500">Proporção entre custos fixos e oscilantes do mês</p>
            </div>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chart4Data} layout="vertical" margin={{ top: 20, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F1F5F9" />
                <XAxis type="number" tickFormatter={(val) => `R$${val}`} tick={{ fontSize: 11, fill: '#64748B' }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fontWeight: 600, fill: '#334155' }} width={80} />
                <Tooltip
                  formatter={(val: any) => [formatBRL(Number(val)), 'Valor']}
                  contentStyle={{ backgroundColor: '#1E293B', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="valor" radius={[0, 6, 6, 0]} barSize={28}>
                  {chart4Data.map((entry, index) => (
                    <Cell key={`cell-fv-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* RECENT TRANSACTIONS TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-base text-slate-800">Últimos Lançamentos do Mês</h3>
            <p className="text-xs text-slate-500">
              Mostrando os mais recentes de {currentMonthTransactions.length} lançamentos.
            </p>
          </div>

          <button
            onClick={() => onNavigateToTab('transactions')}
            className="text-xs font-bold text-emerald-800 hover:text-emerald-950 hover:underline flex items-center gap-1"
          >
            <span>Ver Todos</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {currentMonthTransactions.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            <Receipt className="w-10 h-10 mx-auto mb-2 text-slate-300" />
            <p className="font-semibold text-slate-600">Nenhum lançamento no mês atual.</p>
            <button
              onClick={() => onOpenNewTransaction('expense')}
              className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-800 text-white rounded-xl text-xs font-semibold hover:bg-emerald-900 transition"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Adicionar Lançamento</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-100">
                <tr>
                  <th className="py-3 px-3">Data</th>
                  <th className="py-3 px-3">Tipo</th>
                  <th className="py-3 px-3">Descrição</th>
                  <th className="py-3 px-3">Categoria</th>
                  <th className="py-3 px-3">Forma Pgto</th>
                  <th className="py-3 px-3 text-right">Valor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {currentMonthTransactions.slice(0, 6).map((tx) => {
                  const cat = categoryMap.get(tx.categoryId);
                  return (
                    <tr key={tx.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-3 font-medium text-slate-700">{formatDateBR(tx.date)}</td>
                      <td className="py-3 px-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-md font-semibold text-[10px] ${
                            tx.type === 'income'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {tx.type === 'income' ? 'Entrada' : 'Saída'}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-semibold text-slate-800">{tx.description}</td>
                      <td className="py-3 px-3">{cat ? cat.name : 'Outros'}</td>
                      <td className="py-3 px-3">{PAYMENT_METHOD_LABELS[tx.paymentMethod] || tx.paymentMethod}</td>
                      <td
                        className={`py-3 px-3 text-right font-bold ${
                          tx.type === 'income' ? 'text-emerald-700' : 'text-rose-600'
                        }`}
                      >
                        {tx.type === 'income' ? '+' : '-'} {formatBRL(tx.amount)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
