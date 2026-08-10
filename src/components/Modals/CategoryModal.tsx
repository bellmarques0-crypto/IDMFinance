import React, { useState, useEffect } from 'react';
import { X, Tag } from 'lucide-react';
import { Category } from '../../types';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (cat: Omit<Category, 'id'> & { id?: string }) => void;
  editingCategory?: Category | null;
}

const DEFAULT_GROUPS = [
  'MORADIA',
  'CONTAS DA CASA',
  'TRANSPORTE',
  'ALIMENTAÇÃO',
  'SAÚDE',
  'EDUCAÇÃO',
  'LAZER',
  'PESSOAL',
  'ENTRADAS',
  'OUTROS',
];

export const CategoryModal: React.FC<CategoryModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingCategory,
}) => {
  const [name, setName] = useState('');
  const [group, setGroup] = useState('PESSOAL');
  const [type, setType] = useState<'income' | 'expense' | 'both'>('expense');

  useEffect(() => {
    if (editingCategory) {
      setName(editingCategory.name);
      setGroup(editingCategory.group);
      setType(editingCategory.type);
    } else {
      setName('');
      setGroup('PESSOAL');
      setType('expense');
    }
  }, [editingCategory, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSave({
      id: editingCategory?.id,
      name: name.trim(),
      group,
      type,
      active: true,
      isDefault: editingCategory?.isDefault || false,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
              <Tag className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-slate-800">
              {editingCategory ? 'Editar Categoria' : 'Nova Categoria'}
            </h3>
          </div>

          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Nome da Categoria *</label>
            <input
              type="text"
              required
              placeholder="Ex: Farmácia, Petshop, Livros..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-hidden focus:border-emerald-700"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Grupo Principal *</label>
            <select
              value={group}
              onChange={(e) => setGroup(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-hidden focus:border-emerald-700 uppercase"
            >
              {DEFAULT_GROUPS.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Finalidade *</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as any)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-hidden focus:border-emerald-700"
            >
              <option value="expense">Despesa / Saída</option>
              <option value="income">Entrada / Receita</option>
              <option value="both">Ambos</option>
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
              SALVAR CATEGORIA
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
