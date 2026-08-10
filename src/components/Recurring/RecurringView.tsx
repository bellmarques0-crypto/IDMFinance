import React, { useState } from 'react';
import {
  CalendarClock,
  Plus,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Edit2,
  Trash2,
  Receipt,
  Calendar,
  Check,
} from 'lucide-react';
import { Category, RecurringExpense, RecurringExpensePayment, Transaction } from '../../types';
import { formatBRL, PAYMENT_METHOD_LABELS } from '../../utils/formatters';

interface RecurringViewProps {
  selectedMonthYear: string; // 'YYYY-MM'
  recurringExpenses: RecurringExpense[];
  payments: RecurringExpensePayment[];
  transactions: Transaction[];
  categories: Category[];
  onOpenNewRecurring: () => void;
  onEditRecurring: (item: RecurringExpense) => void;
  onDeleteRecurring: (item: RecurringExpense) => void;
  onMarkAsPaid: (recurringId: string, monthYear: string, actualAmount: number, paidDate: string) => void;
}

export const RecurringView: React.FC<RecurringViewProps> = ({
  selectedMonthYear,
  recurringExpenses,
  payments,
  transactions,
  categories,
  onOpenNewRecurring,
  onEditRecurring,
  onDeleteRecurring,
  onMarkAsPaid,
}) => {
  const [editingPaymentModal, setEditingPaymentModal] = useState<{
    recurring: RecurringExpense;
    amount: number;
    paidDate: string;
  } | null>(null);

  const categoryMap = new Map<string, Category>();
  categories.forEach((cat) => categoryMap.set(cat.id, cat));

  const [yearStr, monthStr] = selectedMonthYear.split('-');
  const selectedYear = parseInt(yearStr, 10);
  const selectedMonth = parseInt(monthStr, 10);

  // Today's day number for overdue calculation
  const today = new Date();
  const isCurrentRealMonth =
    today.getFullYear() === selectedYear && today.getMonth() + 1 === selectedMonth;
  const currentDayNum = today.getDate();

  // Combine templates with current month status
  const recurringRows = recurringExpenses.map((rec) => {
    // Check if recorded as paid in recurring_payments table
    const payment = payments.find(
      (p) => p.recurringExpenseId === rec.id && p.monthYear === selectedMonthYear
    );

    // Also check if a transaction with same description/category exists in transactions for this month
    const matchingTx = transactions.find(
      (tx) =>
        tx.date.substring(0, 7) === selectedMonthYear &&
        tx.type === 'expense' &&
        (tx.description.toLowerCase() === rec.description.toLowerCase() ||
          tx.categoryId === rec.categoryId)
    );

    const isPaid = !!payment || !!matchingTx;

    let status: 'pending' | 'paid' | 'overdue' = 'pending';
    if (isPaid) {
      status = 'paid';
    } else if (isCurrentRealMonth && rec.dueDay < currentDayNum) {
      status = 'overdue';
    }

    return {
      rec,
      payment,
      matchingTx,
      status,
    };
  });

  const totalExpected = recurringExpenses.reduce((s, r) => s + r.amount, 0);
  const totalPaid = recurringRows
    .filter((r) => r.status === 'paid')
    .reduce((s, r) => s + (r.matchingTx ? r.matchingTx.amount : r.rec.amount), 0);

  const totalPending = totalExpected - totalPaid;

  const handleOpenPayModal = (rec: RecurringExpense) => {
    const todayISO = new Date().toISOString().split('T')[0];
    const defaultDate = isCurrentRealMonth
      ? todayISO
      : `${selectedMonthYear}-${String(rec.dueDay).padStart(2, '0')}`;

    setEditingPaymentModal({
      recurring: rec,
      amount: rec.amount,
      paidDate: defaultDate,
    });
  };

  const handleConfirmPay = () => {
    if (!editingPaymentModal) return;
    onMarkAsPaid(
      editingPaymentModal.recurring.id,
      selectedMonthYear,
      editingPaymentModal.amount,
      editingPaymentModal.paidDate
    );
    setEditingPaymentModal(null);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-extrabold text-slate-800 tracking-tight">
            Despesas Fixas & Controle de Vencimentos
          </h2>
          <p className="text-xs md:text-sm text-slate-500 font-medium">
            Gerencie pagamentos recorrentes mensais e confirme quitações sem alterar o histórico anterior.
          </p>
        </div>

        <button
          onClick={onOpenNewRecurring}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl font-bold text-xs shadow-md transition"
        >
          <Plus className="w-4 h-4" />
          <span>NOVA DESPESA FIXA</span>
        </button>
      </div>

      {/* SUMMARY METRICS BANNER */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center gap-3">
          <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl">
            <CalendarClock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Previsto no Mês
            </span>
            <span className="text-lg font-extrabold text-slate-800">{formatBRL(totalExpected)}</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center gap-3">
          <div className="p-3 bg-emerald-100 text-emerald-800 rounded-xl">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Já Pago no Mês
            </span>
            <span className="text-lg font-extrabold text-emerald-800">{formatBRL(totalPaid)}</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center gap-3">
          <div className="p-3 bg-amber-50 text-amber-700 rounded-xl">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Pendente / Restante
            </span>
            <span className="text-lg font-extrabold text-amber-700">
              {formatBRL(Math.max(0, totalPending))}
            </span>
          </div>
        </div>
      </div>

      {/* TABLE OF RECURRING EXPENSES & DUE DATES */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden space-y-4 p-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-base text-slate-800">Controle de Vencimentos do Mês</h3>
            <p className="text-xs text-slate-500">
              Clique em "Marcar como Pago" para registrar a saída no orçamento do mês.
            </p>
          </div>
        </div>

        {recurringExpenses.length === 0 ? (
          <div className="py-12 text-center text-slate-400 space-y-3">
            <CalendarClock className="w-12 h-12 mx-auto text-slate-300" />
            <p className="font-semibold text-slate-600 text-sm">
              Nenhuma despesa fixa cadastrada ainda.
            </p>
            <button
              onClick={onOpenNewRecurring}
              className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs rounded-xl transition"
            >
              Cadastrar Primeira Despesa Fixa
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200/80">
                <tr>
                  <th className="py-3.5 px-4">Despesa</th>
                  <th className="py-3.5 px-4">Categoria</th>
                  <th className="py-3.5 px-4">Vencimento</th>
                  <th className="py-3.5 px-4">Forma Pgto</th>
                  <th className="py-3.5 px-4 text-right">Valor Previsto</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recurringRows.map(({ rec, status, matchingTx }) => {
                  const cat = categoryMap.get(rec.categoryId);
                  return (
                    <tr key={rec.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-800 text-sm">{rec.description}</div>
                        <span className="text-[10px] text-slate-400 font-medium">Recorrente Mensal</span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-slate-700">{cat ? cat.name : 'Outros'}</span>
                        {cat && <span className="block text-[10px] text-slate-400">{cat.group}</span>}
                      </td>

                      <td className="py-3.5 px-4 font-bold text-slate-700">
                        Dia {rec.dueDay}
                      </td>

                      <td className="py-3.5 px-4 font-medium text-slate-600">
                        {PAYMENT_METHOD_LABELS[rec.paymentMethod] || rec.paymentMethod}
                      </td>

                      <td className="py-3.5 px-4 text-right font-extrabold text-sm text-slate-900">
                        {formatBRL(matchingTx ? matchingTx.amount : rec.amount)}
                      </td>

                      {/* Status Badge */}
                      <td className="py-3.5 px-4 text-center">
                        {status === 'paid' && (
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full font-extrabold text-[10px]">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            PAGO
                          </span>
                        )}
                        {status === 'pending' && (
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-100 text-amber-900 rounded-full font-extrabold text-[10px]">
                            <Clock className="w-3.5 h-3.5 text-amber-600" />
                            PENDENTE
                          </span>
                        )}
                        {status === 'overdue' && (
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-rose-100 text-rose-800 rounded-full font-extrabold text-[10px]">
                            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                            ATRASADO
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {status !== 'paid' ? (
                            <button
                              onClick={() => handleOpenPayModal(rec)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-extrabold rounded-xl transition shadow-xs"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Marcar como Pago</span>
                            </button>
                          ) : (
                            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg">
                              ✓ Registrado
                            </span>
                          )}

                          <button
                            onClick={() => onEditRecurring(rec)}
                            className="p-1.5 text-slate-400 hover:text-emerald-800 hover:bg-emerald-50 rounded-lg transition"
                            title="Editar Regra Recorrente"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => onDeleteRecurring(rec)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                            title="Excluir Regra Recorrente"
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
        )}
      </div>

      {/* MODAL: MARCAR COMO PAGO / AJUSTAR VALOR DO MÊS */}
      {editingPaymentModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className="p-2.5 bg-emerald-100 text-emerald-800 rounded-xl">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-800">Confirmar Pagamento</h3>
                <p className="text-xs text-slate-500">{editingPaymentModal.recurring.description}</p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Valor Pago no Mês Atual (R$)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={editingPaymentModal.amount}
                  onChange={(e) =>
                    setEditingPaymentModal({
                      ...editingPaymentModal,
                      amount: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-hidden focus:border-emerald-700"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Nota: Alterar o valor aqui registra a despesa real do mês sem alterar regras anteriores.
                </p>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Data do Pagamento</label>
                <input
                  type="date"
                  value={editingPaymentModal.paidDate}
                  onChange={(e) =>
                    setEditingPaymentModal({
                      ...editingPaymentModal,
                      paidDate: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-hidden focus:border-emerald-700"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setEditingPaymentModal(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmPay}
                className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl text-xs transition shadow-md"
              >
                Confirmar Pagamento
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
