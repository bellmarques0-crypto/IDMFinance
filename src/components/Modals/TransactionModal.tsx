import React, { useState, useEffect } from 'react';
import { X, ArrowUpRight, ArrowDownLeft, Calendar, Tag, CreditCard as CreditCardIcon, DollarSign } from 'lucide-react';
import { Category, CreditCard, ExpenseType, PaymentMethod, RecurrenceType, Transaction, TransactionType } from '../../types';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (tx: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }) => void;
  editingTransaction?: Transaction | null;
  categories: Category[];
  creditCards: CreditCard[];
  initialType?: TransactionType;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingTransaction,
  categories,
  creditCards,
  initialType = 'expense',
}) => {
  const [type, setType] = useState<TransactionType>(initialType);
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState<string>('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [amount, setAmount] = useState<number | string>('');
  const [expenseType, setExpenseType] = useState<ExpenseType>('variable');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pix');
  const [notes, setNotes] = useState<string>('');
  const [recurrence, setRecurrence] = useState<RecurrenceType>('none');
  const [creditCardId, setCreditCardId] = useState<string>('');

  useEffect(() => {
    if (editingTransaction) {
      setType(editingTransaction.type);
      setDate(editingTransaction.date);
      setDescription(editingTransaction.description);
      setCategoryId(editingTransaction.categoryId);
      setAmount(editingTransaction.amount);
      setExpenseType(editingTransaction.expenseType);
      setPaymentMethod(editingTransaction.paymentMethod);
      setNotes(editingTransaction.notes || '');
      setRecurrence(editingTransaction.recurrence);
      setCreditCardId(editingTransaction.creditCardId || '');
    } else {
      setType(initialType);
      setDate(new Date().toISOString().split('T')[0]);
      setDescription('');
      setCategoryId('');
      setAmount('');
      setExpenseType('variable');
      setPaymentMethod('pix');
      setNotes('');
      setRecurrence('none');
      setCreditCardId('');
    }
  }, [editingTransaction, initialType, isOpen]);

  // Set default category when categories list changes or modal opens
  useEffect(() => {
    if (!categoryId && categories.length > 0) {
      const match = categories.find((c) =>
        type === 'income' ? c.type === 'income' : c.type !== 'income'
      );
      if (match) setCategoryId(match.id);
    }
  }, [type, categories, categoryId]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numericAmount = typeof amount === 'number' ? amount : parseFloat(amount);
    if (!description.trim() || !categoryId || isNaN(numericAmount) || numericAmount <= 0) {
      alert('Por favor, preencha todos os campos obrigatórios corretamente.');
      return;
    }

    onSave({
      id: editingTransaction?.id,
      type,
      date,
      description: description.trim(),
      categoryId,
      amount: numericAmount,
      expenseType,
      paymentMethod,
      notes: notes.trim() || undefined,
      recurrence,
      creditCardId: paymentMethod === 'credito' ? creditCardId || undefined : undefined,
    });

    onClose();
  };

  const filteredCategories = categories.filter((c) =>
    type === 'income' ? c.type === 'income' : c.type !== 'income'
  );

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-100 my-8 animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div
              className={`p-2 rounded-xl ${
                type === 'income' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
              }`}
            >
              {type === 'income' ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownLeft className="w-5 h-5" />}
            </div>
            <h3 className="font-bold text-base text-slate-800">
              {editingTransaction ? 'Editar Lançamento' : 'Novo Lançamento Financeiro'}
            </h3>
          </div>

          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* TYPE SELECTOR PILLS */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl font-bold">
            <button
              type="button"
              onClick={() => setType('income')}
              className={`py-2 rounded-lg text-xs transition flex items-center justify-center gap-1.5 ${
                type === 'income'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ArrowUpRight className="w-4 h-4" />
              <span>Entrada (Receita)</span>
            </button>

            <button
              type="button"
              onClick={() => setType('expense')}
              className={`py-2 rounded-lg text-xs transition flex items-center justify-center gap-1.5 ${
                type === 'expense'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ArrowDownLeft className="w-4 h-4" />
              <span>Saída (Despesa)</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* DATA */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">Data (DD/MM/AAAA) *</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-hidden focus:border-emerald-700"
              />
            </div>

            {/* VALOR */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">Valor (R$) *</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0,00"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-extrabold text-slate-900 focus:outline-hidden focus:border-emerald-700"
              />
            </div>
          </div>

          {/* DESCRIÇÃO */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">Descrição *</label>
            <input
              type="text"
              required
              placeholder="Ex: Salário, Supermercado, Luz..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-hidden focus:border-emerald-700"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* CATEGORIA */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">Categoria *</label>
              <select
                required
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-hidden focus:border-emerald-700"
              >
                <option value="">-- Selecione --</option>
                {filteredCategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.group} › {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* TIPO DE GASTO (FIXO/VARIÁVEL) */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">Tipo de Gasto *</label>
              <select
                value={expenseType}
                onChange={(e) => setExpenseType(e.target.value as ExpenseType)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-hidden focus:border-emerald-700"
              >
                <option value="variable">Variável</option>
                <option value="fixed">Fixo</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* FORMA DE PAGAMENTO */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">Forma de Pagamento *</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-hidden focus:border-emerald-700"
              >
                <option value="pix">Pix</option>
                <option value="dinheiro">Dinheiro</option>
                <option value="debito">Débito</option>
                <option value="credito">Crédito</option>
                <option value="transferencia">Transferência</option>
                <option value="boleto">Boleto</option>
                <option value="outro">Outro</option>
              </select>
            </div>

            {/* RECORRÊNCIA */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">Recorrência</label>
              <select
                value={recurrence}
                onChange={(e) => setRecurrence(e.target.value as RecurrenceType)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-hidden focus:border-emerald-700"
              >
                <option value="none">Não recorrente</option>
                <option value="monthly">Mensal</option>
                <option value="weekly">Semanal</option>
                <option value="yearly">Anual</option>
              </select>
            </div>
          </div>

          {/* CARTÃO DE CRÉDITO (Se Forma de Pagamento = Crédito) */}
          {paymentMethod === 'credito' && creditCards.length > 0 && (
            <div>
              <label className="block font-bold text-slate-700 mb-1">Cartão de Crédito</label>
              <select
                value={creditCardId}
                onChange={(e) => setCreditCardId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-hidden focus:border-emerald-700"
              >
                <option value="">-- Selecione o Cartão --</option>
                {creditCards.map((card) => (
                  <option key={card.id} value={card.id}>
                    {card.name} (Vencimento Dia {card.dueDay})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* OBSERVAÇÃO */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">Observação (Opcional)</label>
            <textarea
              rows={2}
              placeholder="Notas adicionais sobre a movimentação..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-hidden focus:border-emerald-700"
            />
          </div>

          {/* FOOTER BUTTONS */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition"
            >
              CANCELAR
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl text-xs transition shadow-md"
            >
              SALVAR LANÇAMENTO
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
