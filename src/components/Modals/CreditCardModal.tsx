import React, { useState } from 'react';
import { X, CreditCard as CreditCardIcon } from 'lucide-react';
import { CreditCard } from '../../types';

interface CreditCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (card: Omit<CreditCard, 'id'>) => void;
}

export const CreditCardModal: React.FC<CreditCardModalProps> = ({ isOpen, onClose, onSave }) => {
  const [name, setName] = useState('');
  const [closingDay, setClosingDay] = useState(25);
  const [dueDay, setDueDay] = useState(5);
  const [limit, setLimit] = useState<number | string>(5000);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numLimit = typeof limit === 'number' ? limit : parseFloat(limit);
    if (!name.trim() || isNaN(numLimit) || numLimit <= 0) {
      alert('Preencha os campos corretamente.');
      return;
    }

    onSave({
      name: name.trim(),
      closingDay,
      dueDay,
      limit: numLimit,
    });

    onClose();
    setName('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-slate-800 text-emerald-400 rounded-xl">
              <CreditCardIcon className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-slate-800">Cadastrar Cartão de Crédito</h3>
          </div>

          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Nome do Cartão *</label>
            <input
              type="text"
              required
              placeholder="Ex: Nubank, Itaú Platinum, Santander..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-hidden focus:border-emerald-700"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Dia Fechamento Fatura *</label>
              <select
                value={closingDay}
                onChange={(e) => setClosingDay(parseInt(e.target.value, 10))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-hidden focus:border-emerald-700"
              >
                {Array.from({ length: 31 }).map((_, i) => (
                  <option key={i + 1} value={i + 1}>
                    Dia {i + 1}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Dia Vencimento Fatura *</label>
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
            <label className="block font-bold text-slate-700 mb-1">Limite Total do Cartão (R$) *</label>
            <input
              type="number"
              step="100"
              required
              placeholder="5000"
              value={limit}
              onChange={(e) => setLimit(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-extrabold focus:outline-hidden focus:border-emerald-700"
            />
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
              className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl transition shadow-md"
            >
              SALVAR CARTÃO
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
