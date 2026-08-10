import React, { useState } from 'react';
import {
  FolderTree,
  Plus,
  Edit2,
  Trash2,
  Tag,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { Category } from '../../types';

interface CategoriesViewProps {
  categories: Category[];
  onOpenNewCategory: () => void;
  onEditCategory: (category: Category) => void;
  onDeleteCategory: (category: Category) => void;
}

export const CategoriesView: React.FC<CategoriesViewProps> = ({
  categories,
  onOpenNewCategory,
  onEditCategory,
  onDeleteCategory,
}) => {
  const [selectedGroupFilter, setSelectedGroupFilter] = useState<string>('all');

  // Group categories by group name
  const groups = Array.from(new Set(categories.map((c) => c.group)));

  const filteredCategories = categories.filter((c) => {
    if (selectedGroupFilter !== 'all' && c.group !== selectedGroupFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-extrabold text-slate-800 tracking-tight">
            Gerenciamento de Categorias
          </h2>
          <p className="text-xs md:text-sm text-slate-500 font-medium">
            Organize suas movimentações em grupos e categorias personalizadas.
          </p>
        </div>

        <button
          onClick={onOpenNewCategory}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl font-bold text-xs shadow-md transition"
        >
          <Plus className="w-4 h-4" />
          <span>NOVA CATEGORIA</span>
        </button>
      </div>

      {/* GROUP FILTER TABS */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => setSelectedGroupFilter('all')}
          className={`px-3 py-1.5 rounded-xl font-bold text-xs whitespace-nowrap transition ${
            selectedGroupFilter === 'all'
              ? 'bg-emerald-950 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          Todas ({categories.length})
        </button>

        {groups.map((group) => {
          const count = categories.filter((c) => c.group === group).length;
          return (
            <button
              key={group}
              onClick={() => setSelectedGroupFilter(group)}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs whitespace-nowrap transition ${
                selectedGroupFilter === group
                  ? 'bg-emerald-950 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {group} ({count})
            </button>
          );
        })}
      </div>

      {/* CATEGORIES GRID BY GROUP */}
      <div className="space-y-6">
        {groups
          .filter((g) => selectedGroupFilter === 'all' || selectedGroupFilter === g)
          .map((groupName) => {
            const groupCats = categories.filter((c) => c.group === groupName);

            return (
              <div
                key={groupName}
                className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-3"
              >
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-emerald-800" />
                    <h3 className="font-extrabold text-sm text-slate-800 uppercase tracking-wider">
                      {groupName}
                    </h3>
                  </div>
                  <span className="text-xs font-semibold text-slate-400">
                    {groupCats.length} categorias
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {groupCats.map((cat) => (
                    <div
                      key={cat.id}
                      className="p-3.5 rounded-xl bg-slate-50 hover:bg-emerald-50/50 border border-slate-200/70 flex items-center justify-between transition group"
                    >
                      <div className="space-y-0.5">
                        <div className="font-bold text-slate-800 text-xs">{cat.name}</div>
                        <span
                          className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-sm ${
                            cat.type === 'income'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          {cat.type === 'income' ? 'Entrada' : 'Despesa'}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100">
                        <button
                          onClick={() => onEditCategory(cat)}
                          className="p-1 text-slate-400 hover:text-emerald-800 rounded-md transition"
                          title="Editar Nome"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        {!cat.isDefault ? (
                          <button
                            onClick={() => onDeleteCategory(cat)}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded-md transition"
                            title="Excluir Categoria"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <span className="p-1 text-slate-300" title="Categoria Padrão do Sistema">
                            <Lock className="w-3.5 h-3.5" />
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
};
