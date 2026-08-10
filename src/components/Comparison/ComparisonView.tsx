import React, { useState } from 'react';
import {
  BarChart2,
  ArrowUp,
  ArrowDown,
  Minus,
  TrendingUp,
  TrendingDown,
  Calendar,
} from 'lucide-react';
import { Category, Transaction } from '../../types';
import { formatBRL, formatMonthYearHeader } from '../../utils/formatters';

interface ComparisonViewProps {
  selectedMonthYear: string; // Default Month A ('YYYY-MM')
  transactions: Transaction[];
  categories: Category[];
}

export const ComparisonView: React.FC<ComparisonViewProps> = ({
  selectedMonthYear,
  transactions,
  categories,
}) => {
  // Month A defaults to selectedMonthYear, Month B defaults to previous month
  const [monthA, setMonthA] = useState<string>(selectedMonthYear);

  // Compute previous month key for default Month B
  const [yStr, mStr] = selectedMonthYear.split('-');
  const yNum = parseInt(yStr, 10);
  const mNum = parseInt(mStr, 10);
  const prevDate = new Date(yNum, mNum - 2, 1);
  const prevY = prevDate.getFullYear();
  const prevM = String(prevDate.getMonth() + 1).padStart(2, '0');
  const defaultMonthB = `${prevY}-${prevM}`;

  const [monthB, setMonthB] = useState<string>(defaultMonthB);

  const categoryMap = new Map<string, Category>();
  categories.forEach((c) => categoryMap.set(c.id, c));

  // Transactions for Month A and Month B
  const txsA = transactions.filter((tx) => tx.date.substring(0, 7) === monthA);
  const txsB = transactions.filter((tx) => tx.date.substring(0, 7) === monthB);

  // Stats Month A
  const incA = txsA.filter((tx) => tx.type === 'income').reduce((s, tx) => s + tx.amount, 0);
  const expA = txsA.filter((tx) => tx.type === 'expense').reduce((s, tx) => s + tx.amount, 0);
  const balA = incA - expA;
  const fixA = txsA
    .filter((tx) => tx.type === 'expense' && tx.expenseType === 'fixed')
    .reduce((s, tx) => s + tx.amount, 0);
  const varA = txsA
    .filter((tx) => tx.type === 'expense' && tx.expenseType === 'variable')
    .reduce((s, tx) => s + tx.amount, 0);

  // Stats Month B
  const incB = txsB.filter((tx) => tx.type === 'income').reduce((s, tx) => s + tx.amount, 0);
  const expB = txsB.filter((tx) => tx.type === 'expense').reduce((s, tx) => s + tx.amount, 0);
  const balB = incB - expB;
  const fixB = txsB
    .filter((tx) => tx.type === 'expense' && tx.expenseType === 'fixed')
    .reduce((s, tx) => s + tx.amount, 0);
  const varB = txsB
    .filter((tx) => tx.type === 'expense' && tx.expenseType === 'variable')
    .reduce((s, tx) => s + tx.amount, 0);

  // Differences
  const diffInc = incA - incB;
  const diffExp = expA - expB;
  const diffBal = balA - balB;
  const diffFix = fixA - fixB;
  const diffVar = varA - varB;

  // Category drilldown
  const categoryDrilldown = categories.map((cat) => {
    const valA = txsA
      .filter((tx) => tx.categoryId === cat.id)
      .reduce((s, tx) => s + tx.amount, 0);

    const valB = txsB
      .filter((tx) => tx.categoryId === cat.id)
      .reduce((s, tx) => s + tx.amount, 0);

    const diff = valA - valB;

    return {
      cat,
      valA,
      valB,
      diff,
    };
  }).filter((item) => item.valA > 0 || item.valB > 0);

  return (
    <div className="space-y-6 pb-12">
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-extrabold text-slate-800 tracking-tight">
            Comparação Entre Meses
          </h2>
          <p className="text-xs md:text-sm text-slate-500 font-medium">
            Análise lado a lado de receitas, despesas e variação por categoria.
          </p>
        </div>

        {/* Month Selectors */}
        <div className="flex flex-wrap items-center gap-2 bg-white p-2 rounded-2xl border border-slate-200/80 shadow-xs text-xs font-bold">
          <div className="flex items-center gap-1.5 px-2">
            <span className="text-slate-400">Mês Atual:</span>
            <input
              type="month"
              value={monthA}
              onChange={(e) => setMonthA(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold text-slate-800"
            />
          </div>

          <span className="text-slate-300 font-bold">VS</span>

          <div className="flex items-center gap-1.5 px-2">
            <span className="text-slate-400">Comparar Com:</span>
            <input
              type="month"
              value={monthB}
              onChange={(e) => setMonthB(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold text-slate-800"
            />
          </div>
        </div>
      </div>

      {/* COMPARISON METRIC CARDS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {/* Entradas */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Entradas</span>
          <div className="flex items-baseline justify-between text-xs font-semibold">
            <span className="text-slate-500">{formatMonthYearHeader(monthB)}:</span>
            <span className="font-bold text-slate-700">{formatBRL(incB)}</span>
          </div>
          <div className="flex items-baseline justify-between text-xs font-semibold">
            <span className="text-emerald-800 font-bold">{formatMonthYearHeader(monthA)}:</span>
            <span className="font-extrabold text-emerald-800 text-sm">{formatBRL(incA)}</span>
          </div>

          <div
            className={`flex items-center gap-1 text-xs font-extrabold pt-2 border-t border-slate-100 ${
              diffInc >= 0 ? 'text-emerald-700' : 'text-rose-600'
            }`}
          >
            {diffInc > 0 && <ArrowUp className="w-4 h-4" />}
            {diffInc < 0 && <ArrowDown className="w-4 h-4" />}
            {diffInc === 0 && <Minus className="w-4 h-4 text-slate-400" />}
            <span>Diferença: {diffInc > 0 ? '+' : ''}{formatBRL(diffInc)}</span>
          </div>
        </div>

        {/* Despesas */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Despesas Totais</span>
          <div className="flex items-baseline justify-between text-xs font-semibold">
            <span className="text-slate-500">{formatMonthYearHeader(monthB)}:</span>
            <span className="font-bold text-slate-700">{formatBRL(expB)}</span>
          </div>
          <div className="flex items-baseline justify-between text-xs font-semibold">
            <span className="text-rose-600 font-bold">{formatMonthYearHeader(monthA)}:</span>
            <span className="font-extrabold text-rose-600 text-sm">{formatBRL(expA)}</span>
          </div>

          <div
            className={`flex items-center gap-1 text-xs font-extrabold pt-2 border-t border-slate-100 ${
              diffExp <= 0 ? 'text-emerald-700' : 'text-rose-600'
            }`}
          >
            {diffExp > 0 && <ArrowUp className="w-4 h-4" />}
            {diffExp < 0 && <ArrowDown className="w-4 h-4" />}
            {diffExp === 0 && <Minus className="w-4 h-4 text-slate-400" />}
            <span>Diferença: {diffExp > 0 ? '+' : ''}{formatBRL(diffExp)}</span>
          </div>
        </div>

        {/* Saldo */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Saldo Final</span>
          <div className="flex items-baseline justify-between text-xs font-semibold">
            <span className="text-slate-500">{formatMonthYearHeader(monthB)}:</span>
            <span className="font-bold text-slate-700">{formatBRL(balB)}</span>
          </div>
          <div className="flex items-baseline justify-between text-xs font-semibold">
            <span className="text-slate-900 font-bold">{formatMonthYearHeader(monthA)}:</span>
            <span className="font-extrabold text-slate-900 text-sm">{formatBRL(balA)}</span>
          </div>

          <div
            className={`flex items-center gap-1 text-xs font-extrabold pt-2 border-t border-slate-100 ${
              diffBal >= 0 ? 'text-emerald-700' : 'text-rose-600'
            }`}
          >
            {diffBal > 0 && <ArrowUp className="w-4 h-4" />}
            {diffBal < 0 && <ArrowDown className="w-4 h-4" />}
            {diffBal === 0 && <Minus className="w-4 h-4 text-slate-400" />}
            <span>Diferença: {diffBal > 0 ? '+' : ''}{formatBRL(diffBal)}</span>
          </div>
        </div>

        {/* Despesas Fixas */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Despesas Fixas</span>
          <div className="flex items-baseline justify-between text-xs font-semibold">
            <span className="text-slate-500">{formatMonthYearHeader(monthB)}:</span>
            <span className="font-bold text-slate-700">{formatBRL(fixB)}</span>
          </div>
          <div className="flex items-baseline justify-between text-xs font-semibold">
            <span className="text-slate-900 font-bold">{formatMonthYearHeader(monthA)}:</span>
            <span className="font-extrabold text-slate-900 text-sm">{formatBRL(fixA)}</span>
          </div>

          <div
            className={`flex items-center gap-1 text-xs font-extrabold pt-2 border-t border-slate-100 ${
              diffFix <= 0 ? 'text-emerald-700' : 'text-rose-600'
            }`}
          >
            {diffFix > 0 && <ArrowUp className="w-4 h-4" />}
            {diffFix < 0 && <ArrowDown className="w-4 h-4" />}
            {diffFix === 0 && <Minus className="w-4 h-4 text-slate-400" />}
            <span>{diffFix > 0 ? '+' : ''}{formatBRL(diffFix)}</span>
          </div>
        </div>

        {/* Despesas Variáveis */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Despesas Variáveis</span>
          <div className="flex items-baseline justify-between text-xs font-semibold">
            <span className="text-slate-500">{formatMonthYearHeader(monthB)}:</span>
            <span className="font-bold text-slate-700">{formatBRL(varB)}</span>
          </div>
          <div className="flex items-baseline justify-between text-xs font-semibold">
            <span className="text-slate-900 font-bold">{formatMonthYearHeader(monthA)}:</span>
            <span className="font-extrabold text-slate-900 text-sm">{formatBRL(varA)}</span>
          </div>

          <div
            className={`flex items-center gap-1 text-xs font-extrabold pt-2 border-t border-slate-100 ${
              diffVar <= 0 ? 'text-emerald-700' : 'text-rose-600'
            }`}
          >
            {diffVar > 0 && <ArrowUp className="w-4 h-4" />}
            {diffVar < 0 && <ArrowDown className="w-4 h-4" />}
            {diffVar === 0 && <Minus className="w-4 h-4 text-slate-400" />}
            <span>{diffVar > 0 ? '+' : ''}{formatBRL(diffVar)}</span>
          </div>
        </div>
      </div>

      {/* DRILLDOWN TABLE: CATEGORY BY CATEGORY COMPARISON */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-base text-slate-800">Comparação Categoria por Categoria</h3>
            <p className="text-xs text-slate-500">
              Acompanhe onde os gastos aumentaram ou diminuíram em relação ao mês comparado.
            </p>
          </div>
        </div>

        {categoryDrilldown.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            Nenhum lançamento para comparar nestes períodos.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200/80">
                <tr>
                  <th className="py-3.5 px-4">Categoria</th>
                  <th className="py-3.5 px-4 text-right">{formatMonthYearHeader(monthB)}</th>
                  <th className="py-3.5 px-4 text-right">{formatMonthYearHeader(monthA)}</th>
                  <th className="py-3.5 px-4 text-right">Diferença (R$)</th>
                  <th className="py-3.5 px-4 text-center">Indicador Visual</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {categoryDrilldown.map(({ cat, valA, valB, diff }) => {
                  const isIncome = cat.type === 'income';
                  // For income: diff > 0 is good (green), diff < 0 is bad (red)
                  // For expense: diff > 0 is bad (red), diff < 0 is good (green)
                  const isPositiveOutcome = isIncome ? diff >= 0 : diff <= 0;

                  return (
                    <tr key={cat.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-800 text-sm">{cat.name}</div>
                        <span className="text-[10px] text-slate-400 font-bold">{cat.group}</span>
                      </td>

                      <td className="py-3.5 px-4 text-right font-medium text-slate-600">
                        {formatBRL(valB)}
                      </td>

                      <td className="py-3.5 px-4 text-right font-bold text-slate-900">
                        {formatBRL(valA)}
                      </td>

                      <td
                        className={`py-3.5 px-4 text-right font-extrabold text-sm ${
                          isPositiveOutcome ? 'text-emerald-700' : 'text-rose-600'
                        }`}
                      >
                        {diff > 0 ? '+' : ''}{formatBRL(diff)}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                            isPositiveOutcome
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {diff > 0 && <ArrowUp className="w-3 h-3" />}
                          {diff < 0 && <ArrowDown className="w-3 h-3" />}
                          {diff === 0 && <Minus className="w-3 h-3 text-slate-400" />}
                          <span>
                            {diff === 0
                              ? 'Sem alteração'
                              : isIncome
                              ? diff > 0
                                ? 'Aumento de renda'
                                : 'Queda de renda'
                              : diff > 0
                              ? 'Aumento de gasto'
                              : 'Redução de gasto'}
                          </span>
                        </span>
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
