import React, { useState, useEffect } from 'react';
import { X, CreditCard as CreditCardIcon, Layers, ShoppingBag } from 'lucide-react';
import { Category, CreditCard } from '../../types';
import { formatBRL } from '../../utils/formatters';

interface InstallmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (planData: {
    description: string;
    creditCardId: string;
    categoryId: string;
    purchaseDate: string;
    totalAmount: number;
    installments: number;
    expenseType: 'fixed' | 'variable';
  }) => void;
  categories: Category[];
  creditCards: CreditCard[];
}

export const InstallmentModal: React.FC<InstallmentModalProps> = ({
  isOpen,
  onClose,
  onSave,
  categories,
  creditCards,
}) => {
  const [description, setDescription] = useState('');
  const [creditCardId, setCreditCardId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0]);
  const [totalAmount, setTotalAmount] = useState<number | string>('');
  const [installments, setInstallments] = useState<number>(12);
  const [expenseType, setExpenseType] = useState<'fixed' | 'variable'>('variable');

  useEffect(() => {
    if (creditCards.length > 0 && !creditCardId) {
      setCreditCardId(creditCards[0].id);
    }
  }, [creditCards, creditCardId]);

  useEffect(() => {
    if (categories.length > 0 && !categoryId) {
      const expCat = categories.find((c) => c.type !== 'income');
      if (expCat) setCategoryId(expCat.id);
    }
  }, [categories, categoryId]);

  if (!isOpen) return null;

  const numAmount = typeof totalAmount === 'number' ? totalAmount : parseFloat(totalAmount) || 0;
  const installmentAmount = installments > 0 ? numAmount / installments : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || !creditCardId || !categoryId || numAmount <= 0 || installments <= 0) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    onSave({
      description: description.trim(),
      creditCardId,
      categoryId,
      purchaseDate,
      totalAmount: numAmount,
      installments,
      expenseType,
    });

    onClose();
    setDescription('');
    setTotalAmount('');
  };

  const expenseCategories = categories.filter((c) => c.type !== 'income');

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-100 text-indigo-800 rounded-xl">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-slate-800">Registrar Compra Parcelada</h3>
          </div>

          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Descrição do Produto / Compra *</label>
            <input
              type="text"
              required
              placeholder="Ex: Smart TV 55, Celular, Sofá da Sala..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-hidden focus:border-emerald-700"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Cartão de Crédito *</label>
              <select
                required
                value={creditCardId}
                onChange={(e) => setCreditCardId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-hidden focus:border-emerald-700"
              >
                <option value="">-- Selecione o Cartão --</option>
                {creditCards.map((card) => (
                  <option key={card.id} value={card.id}>
                    {card.name}
                  </option>
                ))}
              </select>
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
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Data da Compra *</label>
              <input
                type="date"
                required
                value={purchaseDate}
                onChange={(e) => setPurchaseDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-hidden focus:border-emerald-700"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Valor Total (R$) *</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                placeholder="1200.00"
                value={totalAmount}
                onChange={(e) => setTotalAmount(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-extrabold focus:outline-hidden focus:border-emerald-700"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Nº de Parcelas *</label>
              <select
                value={installments}
                onChange={(e) => setInstallments(parseInt(e.target.value, 10))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-hidden focus:border-emerald-700"
              >
                {Array.from({ length: 24 }).map((_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {i + 1}x {i === 0 ? '(À vista)' : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* DYNAMIC INSTALLMENT SUMMARY BOX */}
          {numAmount > 0 && installments > 0 && (
            <div className="p-3 bg-indigo-50/80 border border-indigo-100 rounded-xl space-y-1">
              <span className="text-[10px] uppercase font-bold text-indigo-500 block">
                Cálculo de Parcelamento
              </span>
              <div className="text-sm font-extrabold text-indigo-900">
                {installments}x de {formatBRL(installmentAmount)}
              </div>
              <p className="text-[10px] text-indigo-700">
                O sistema lançará automaticamente 1 parcela nos meses subsequentes a partir de {purchaseDate}.
              </p>
            </div>
          )}

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
              className="px-5 py-2 bg-indigo-800 hover:bg-indigo-900 text-white font-bold rounded-xl transition shadow-md"
            >
              GERAR PARCELAMENTO
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
