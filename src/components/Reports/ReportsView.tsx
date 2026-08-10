import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Download,
  Calendar,
  Filter,
  PieChart as PieIcon,
  CreditCard,
  Layers,
  ArrowUpRight,
  ArrowDownLeft,
} from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Category, Transaction } from '../../types';
import { EXPENSE_TYPE_LABELS, formatBRL, formatDateBR, PAYMENT_METHOD_LABELS } from '../../utils/formatters';

interface ReportsViewProps {
  selectedMonthYear: string; // 'YYYY-MM'
  transactions: Transaction[];
  categories: Category[];
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  selectedMonthYear,
  transactions,
  categories,
}) => {
  const [periodMode, setPeriodMode] = useState<'month' | 'quarter' | 'year' | 'all'>('month');

  const categoryMap = new Map<string, Category>();
  categories.forEach((c) => categoryMap.set(c.id, c));

  // Filter transactions based on period mode
  const filteredTxs = transactions.filter((tx) => {
    if (periodMode === 'month') {
      return tx.date.substring(0, 7) === selectedMonthYear;
    }
    if (periodMode === 'quarter') {
      const txDate = new Date(tx.date);
      const [y, m] = selectedMonthYear.split('-').map(Number);
      const selectedDate = new Date(y, m - 1, 1);
      const diffMonths = (selectedDate.getFullYear() - txDate.getFullYear()) * 12 + (selectedDate.getMonth() - txDate.getMonth());
      return diffMonths >= 0 && diffMonths < 3;
    }
    if (periodMode === 'year') {
      const [y] = selectedMonthYear.split('-');
      return tx.date.substring(0, 4) === y;
    }
    return true; // 'all'
  });

  // Totals
  const totalIncome = filteredTxs
    .filter((tx) => tx.type === 'income')
    .reduce((s, tx) => s + tx.amount, 0);

  const totalExpense = filteredTxs
    .filter((tx) => tx.type === 'expense')
    .reduce((s, tx) => s + tx.amount, 0);

  const balance = totalIncome - totalExpense;

  // Breakdown by Payment Method
  const paymentMethodTotals: Record<string, number> = {};
  filteredTxs
    .filter((tx) => tx.type === 'expense')
    .forEach((tx) => {
      const label = PAYMENT_METHOD_LABELS[tx.paymentMethod] || tx.paymentMethod;
      paymentMethodTotals[label] = (paymentMethodTotals[label] || 0) + tx.amount;
    });

  const paymentChartData = Object.entries(paymentMethodTotals).map(([name, value]) => ({
    name,
    value,
  }));

  // Breakdown by Category
  const categoryTotals: Record<string, number> = {};
  filteredTxs
    .filter((tx) => tx.type === 'expense')
    .forEach((tx) => {
      const cat = categoryMap.get(tx.categoryId);
      const name = cat ? cat.name : 'Outros';
      categoryTotals[name] = (categoryTotals[name] || 0) + tx.amount;
    });

  const categoryChartData = Object.entries(categoryTotals)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  const COLORS = ['#2E4D3E', '#16A34A', '#0284C7', '#EAB308', '#8B5CF6', '#EC4899', '#F97316', '#64748B'];

  // Export CSV Handler
  const handleExportCSV = () => {
    if (filteredTxs.length === 0) {
      alert('Nenhum dado disponível para exportar no período selecionado.');
      return;
    }

    const headers = [
      'Data',
      'Tipo',
      'Descrição',
      'Categoria',
      'Grupo Categoria',
      'Valor (R$)',
      'Forma de Pagamento',
      'Tipo de Gasto',
      'Observações',
    ];

    const rows = filteredTxs.map((tx) => {
      const cat = categoryMap.get(tx.categoryId);
      return [
        formatDateBR(tx.date),
        tx.type === 'income' ? 'Entrada' : 'Saída',
        `"${tx.description.replace(/"/g, '""')}"`,
        `"${cat ? cat.name : 'Outros'}"`,
        `"${cat ? cat.group : 'Geral'}"`,
        tx.amount.toFixed(2).replace('.', ','),
        `"${PAYMENT_METHOD_LABELS[tx.paymentMethod] || tx.paymentMethod}"`,
        `"${EXPENSE_TYPE_LABELS[tx.expenseType] || tx.expenseType}"`,
        `"${(tx.notes || '').replace(/"/g, '""')}"`,
      ].join(';');
    });

    const csvContent = '\uFEFF' + [headers.join(';'), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Relatorio_Financeiro_${periodMode}_${selectedMonthYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-extrabold text-slate-800 tracking-tight">
            Relatórios & Exportação
          </h2>
          <p className="text-xs md:text-sm text-slate-500 font-medium">
            Gere consolidados de pagamentos e exporte a planilha em formato CSV/Excel.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl font-bold text-xs shadow-md transition"
        >
          <Download className="w-4 h-4" />
          <span>EXPORTAR EXCEL / CSV</span>
        </button>
      </div>

      {/* PERIOD SELECTOR TABS */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-emerald-800" />
          <span className="font-bold text-slate-700">Período do Relatório:</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setPeriodMode('month')}
            className={`px-3 py-1.5 rounded-xl font-bold transition ${
              periodMode === 'month'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Mês Selecionado ({selectedMonthYear})
          </button>
          <button
            onClick={() => setPeriodMode('quarter')}
            className={`px-3 py-1.5 rounded-xl font-bold transition ${
              periodMode === 'quarter'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Últimos 3 Meses
          </button>
          <button
            onClick={() => setPeriodMode('year')}
            className={`px-3 py-1.5 rounded-xl font-bold transition ${
              periodMode === 'year'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Ano Completo
          </button>
          <button
            onClick={() => setPeriodMode('all')}
            className={`px-3 py-1.5 rounded-xl font-bold transition ${
              periodMode === 'all'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Todo o Histórico
          </button>
        </div>
      </div>

      {/* SUMMARY STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
            Total Entradas
          </span>
          <div className="text-2xl font-extrabold text-emerald-700">{formatBRL(totalIncome)}</div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
            Total Despesas
          </span>
          <div className="text-2xl font-extrabold text-rose-600">{formatBRL(totalExpense)}</div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
            Resultado Líquido
          </span>
          <div
            className={`text-2xl font-extrabold ${
              balance >= 0 ? 'text-emerald-800' : 'text-rose-600'
            }`}
          >
            {formatBRL(balance)}
          </div>
        </div>
      </div>

      {/* CHARTS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart: Gastos por Forma de Pagamento */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-emerald-800" />
            <h3 className="font-bold text-base text-slate-800">Gastos por Forma de Pagamento</h3>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={paymentChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {paymentChartData.map((_, index) => (
                    <Cell key={`cell-p-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(val: any) => [formatBRL(Number(val)), 'Valor']} />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart: Maiores Categorias de Despesas */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <PieIcon className="w-5 h-5 text-emerald-800" />
            <h3 className="font-bold text-base text-slate-800">Maiores Categoria de Despesas</h3>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryChartData.slice(0, 6)} layout="vertical" margin={{ left: 10, right: 10 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F1F5F9" />
                <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={(val) => `R$${val}`} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fontWeight: 600 }} width={100} />
                <Tooltip formatter={(val: any) => [formatBRL(Number(val)), 'Gasto']} />
                <Bar dataKey="value" fill="#2E4D3E" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
