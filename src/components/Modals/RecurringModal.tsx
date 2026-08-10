import React, { useState, useEffect } from 'react';
import { X, CalendarClock } from 'lucide-react';
import { Category, ExpenseType, PaymentMethod, RecurringExpense } from '../../types';

interface RecurringModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: Omit<RecurringExpense, 'id' | 'createdAt'> & { id?: string }) => void;
  editingRecurring?: RecurringExpense | null;
  categories: Category[];
}

export const RecurringModal: React.FC<RecurringModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingRecurring,
  categories,
}) => {
  const [description, setDescription] = useState<string>('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [amount, setAmount] = useState<number | string>('');
  const [dueDay, setDueDay] = useState<number>(10);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('boleto');

  useEffect(() => {
    if (editingRecurring) {
      setDescription(editingRecurring.description);
      setCategoryId(editingRecurring.categoryId);
      setAmount(editingRecurring.amount);
      setDueDay(editingRecurring.dueDay);
      setPaymentMethod(editingRecurring.paymentMethod);
    } else {
      setDescription('');
      setCategoryId('');
      setAmount('');
      setDueDay(10);
      setPaymentMethod('boleto');
    }
  }, [editingRecurring, isOpen]);

  useEffect(() => {
    if (!categoryId && categories.length > 0) {
      const firstExp = categories.find((c) => c.type !== 'income');
      if (firstExp) setCategoryId(firstExp.id);
    }
  }, [categories, categoryId]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = typeof amount === 'number' ? amount : parseFloat(amount);
    if (!description.trim() || !categoryId || isNaN(numAmount) || numAmount <= 0) {
      alert('Por favor, preencha os campos obrigatórios corretamente.');
      return;
    }

    onSave({
      id: editingRecurring?.id,
      description: description.trim(),
      categoryId,
      amount: numAmount,
      dueDay,
      frequency: 'monthly',
      paymentMethod,
      expenseType: 'fixed',
      active: true,
    });

    onClose();
  };

  const expenseCategories = categories.filter((c) => c.type !== 'income');

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
              <CalendarClock className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-slate-800">
              {editingRecurring ? 'Editar Despesa Fixa Recorrente' : 'Cadastrar Despesa Fixa Recorrente'}
            </h3>
          </div>

          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Descrição da Despesa *</label>
            <input
              type="text"
              required
              placeholder="Ex: Financiamento Casa, Financiamento Carro, Aluguel..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-hidden focus:border-emerald-700"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Valor Previsto Mensal (R$) *</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                placeholder="0,00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-extrabold focus:outline-hidden focus:border-emerald-700"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Dia do Vencimento *</label>
              <select
                value={dueDay}
                onChange={(e) => setDueDay(parseInt(e.target.value, 10))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-hidden focus:border-emerald-700"
              >
                {Array.from({ length: 31 }).map((_, i) => (
                  <option key={i + 1} value={i + 1}>
                    Dia {i + 1}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Categoria *</label>
            <select
              required
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-hidden focus:border-emerald-700"
            >
              <option value="">-- Selecione a Categoria --</option>
              {expenseCategories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.group} › {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Forma de Pagamento Padrão *</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-hidden focus:border-emerald-700"
            >
              <option value="pix">Pix</option>
              <option value="dinheiro">Dinheiro</option>
              <option value="debito">Débito</option>
              <option value="credito">Crédito</option>
              <option value="transferencia">Transferência</option>
              <option value="boleto">Boleto</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition"
            >
              CANCELAR
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl transition shadow-md"
            >
              SALVAR REGRA
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
