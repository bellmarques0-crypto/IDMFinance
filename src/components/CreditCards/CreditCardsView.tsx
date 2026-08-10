import React, { useState } from 'react';
import {
  CreditCard as CreditCardIcon,
  Plus,
  Calendar,
  Layers,
  ShoppingBag,
  Trash2,
  Edit2,
  CheckCircle,
} from 'lucide-react';
import { Category, CreditCard, InstallmentPlan, Transaction } from '../../types';
import { formatBRL, formatDateBR } from '../../utils/formatters';

interface CreditCardsViewProps {
  creditCards: CreditCard[];
  installmentPlans: InstallmentPlan[];
  transactions: Transaction[];
  categories: Category[];
  onOpenNewCreditCard: () => void;
  onOpenNewInstallment: () => void;
  onDeleteCreditCard: (id: string) => void;
}

export const CreditCardsView: React.FC<CreditCardsViewProps> = ({
  creditCards,
  installmentPlans,
  transactions,
  categories,
  onOpenNewCreditCard,
  onOpenNewInstallment,
  onDeleteCreditCard,
}) => {
  const categoryMap = new Map<string, Category>();
  categories.forEach((c) => categoryMap.set(c.id, c));

  const cardMap = new Map<string, CreditCard>();
  creditCards.forEach((c) => cardMap.set(c.id, c));

  return (
    <div className="space-y-6 pb-12">
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-extrabold text-slate-800 tracking-tight">
            Cartões de Crédito & Compras Parceladas
          </h2>
          <p className="text-xs md:text-sm text-slate-500 font-medium">
            Gerencie limites, faturas e parcelamentos futuros com divisão automática por mês.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenNewCreditCard}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold text-xs transition"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Cartão</span>
          </button>

          <button
            onClick={onOpenNewInstallment}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl font-bold text-xs shadow-md transition"
          >
            <Plus className="w-4 h-4" />
            <span>NOVA COMPRA PARCELADA</span>
          </button>
        </div>
      </div>

      {/* CARDS LIST GRID */}
      <div className="space-y-4">
        <h3 className="font-bold text-base text-slate-800">Meus Cartões Cadastrados</h3>

        {creditCards.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 border border-slate-200/80 text-center text-slate-400 text-xs space-y-2">
            <CreditCardIcon className="w-10 h-10 mx-auto text-slate-300" />
            <p className="font-semibold text-slate-600">Nenhum cartão cadastrado ainda.</p>
            <button
              onClick={onOpenNewCreditCard}
              className="px-4 py-2 bg-slate-800 text-white font-bold rounded-xl text-xs hover:bg-slate-900"
            >
              Cadastrar Cartão
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {creditCards.map((card) => {
              // Calculate current usage from credit card transactions
              const cardTxs = transactions.filter(
                (tx) => tx.creditCardId === card.id || tx.paymentMethod === 'credito'
              );
              const totalUsed = cardTxs.reduce((s, tx) => s + tx.amount, 0);
              const availableLimit = card.limit - totalUsed;
              const usedPercent = card.limit > 0 ? (totalUsed / card.limit) * 100 : 0;

              return (
                <div
                  key={card.id}
                  className="bg-linear-to-br from-slate-900 via-slate-800 to-emerald-950 text-white rounded-2xl p-5 shadow-lg relative overflow-hidden flex flex-col justify-between space-y-4 border border-slate-700/50"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CreditCardIcon className="w-6 h-6 text-emerald-400" />
                      <h4 className="font-bold text-base text-white tracking-wide">{card.name}</h4>
                    </div>

                    <button
                      onClick={() => onDeleteCreditCard(card.id)}
                      className="text-slate-400 hover:text-rose-400 transition"
                      title="Excluir Cartão"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Fechamento</span>
                      <span className="font-semibold text-slate-200">Dia {card.closingDay}</span>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Vencimento</span>
                      <span className="font-semibold text-emerald-400">Dia {card.dueDay}</span>
                    </div>
                  </div>

                  {/* Limit meter */}
                  <div className="space-y-1.5 pt-2 border-t border-slate-700/60">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-slate-300">Limite Total: {formatBRL(card.limit)}</span>
                      <span className="text-emerald-400">Uso: {usedPercent.toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-slate-700/60 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ${
                          usedPercent > 90
                            ? 'bg-rose-500'
                            : usedPercent > 70
                            ? 'bg-amber-400'
                            : 'bg-emerald-400'
                        }`}
                        style={{ width: `${Math.min(100, usedPercent)}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* INSTALLMENT PURCHASES SECTION */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-base text-slate-800">Compras Parceladas Ativas</h3>
            <p className="text-xs text-slate-500">
              Acompanhe o valor total da compra e a divisão mensal das parcelas no cartão.
            </p>
          </div>
        </div>

        {installmentPlans.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs space-y-2">
            <ShoppingBag className="w-10 h-10 mx-auto text-slate-300" />
            <p className="font-semibold text-slate-600">Nenhuma compra parcelada registrada.</p>
            <button
              onClick={onOpenNewInstallment}
              className="px-4 py-2 bg-emerald-800 text-white font-bold rounded-xl text-xs hover:bg-emerald-900 transition"
            >
              Registrar Compra Parcelada
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200/80">
                <tr>
                  <th className="py-3.5 px-4">Descrição</th>
                  <th className="py-3.5 px-4">Cartão</th>
                  <th className="py-3.5 px-4">Categoria</th>
                  <th className="py-3.5 px-4">Data Compra</th>
                  <th className="py-3.5 px-4 text-center">Parcelas</th>
                  <th className="py-3.5 px-4 text-right">Valor da Parcela</th>
                  <th className="py-3.5 px-4 text-right">Valor Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {installmentPlans.map((plan) => {
                  const card = cardMap.get(plan.creditCardId);
                  const cat = categoryMap.get(plan.categoryId);

                  return (
                    <tr key={plan.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-800 text-sm">{plan.description}</div>
                        <span className="text-[10px] text-slate-400">Cartão de Crédito</span>
                      </td>

                      <td className="py-3.5 px-4 font-semibold text-slate-700">
                        {card ? card.name : 'Cartão'}
                      </td>

                      <td className="py-3.5 px-4 font-medium text-slate-600">
                        {cat ? cat.name : 'Outros'}
                      </td>

                      <td className="py-3.5 px-4 font-medium text-slate-600">
                        {formatDateBR(plan.purchaseDate)}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 font-extrabold rounded-lg text-xs">
                          {plan.installments}x
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right font-extrabold text-slate-900">
                        {formatBRL(plan.installmentAmount)}
                      </td>

                      <td className="py-3.5 px-4 text-right font-extrabold text-rose-600 text-sm">
                        {formatBRL(plan.totalAmount)}
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
