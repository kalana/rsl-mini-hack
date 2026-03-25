'use client';
import { useState } from 'react';
import { useCategoryStore } from '@/store/categoryStore';
import { useTransactionStore } from '@/store/transactionStore';
import { useAuthStore } from '@/store/authStore';
import { useToast } from '@/hooks/useToast';
import { addCategory, updateCategory, deleteCategory } from '@/lib/firebase/firestore';
import { CATEGORY_COLORS, CATEGORY_ICONS } from '@/constants/categories';
import type { Category } from '@/types';

export function CategoryManager() {
  const categories = useCategoryStore((s) => s.categories);
  const { addOptimistic, updateOptimistic, removeOptimistic } = useCategoryStore();
  const transactions = useTransactionStore((s) => s.transactions);
  const userId = useAuthStore((s) => s.user?.id);
  const toast = useToast();

  const [editingId, setEditingId] = useState<string | 'new' | null>(null);
  const [name, setName] = useState('');
  const [color, setColor] = useState(CATEGORY_COLORS[0]);
  const [icon, setIcon] = useState(CATEGORY_ICONS[0]);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  function startNew() {
    setEditingId('new');
    setName('');
    setColor(CATEGORY_COLORS[0]);
    setIcon(CATEGORY_ICONS[0]);
  }

  function startEdit(cat: Category) {
    setEditingId(cat.id);
    setName(cat.name);
    setColor(cat.color);
    setIcon(cat.icon);
  }

  function cancel() {
    setEditingId(null);
  }

  async function handleSave() {
    if (!userId || !name.trim()) return;
    if (editingId === 'new') {
      const tempId = `temp-${Date.now()}`;
      const newCat: Category = { id: tempId, userId, name: name.trim(), color, icon, isDefault: false };
      addOptimistic(newCat);
      setEditingId(null);
      try {
        const realId = await addCategory({ userId, name: name.trim(), color, icon, isDefault: false });
        updateOptimistic(tempId, { id: realId });
        toast.success('Category created');
      } catch {
        removeOptimistic(tempId);
        toast.error('Failed to create category');
      }
    } else if (editingId) {
      updateOptimistic(editingId, { name: name.trim(), color, icon });
      setEditingId(null);
      try {
        await updateCategory(editingId, { name: name.trim(), color, icon });
        toast.success('Category updated');
      } catch {
        toast.error('Failed to update category');
      }
    }
  }

  async function handleDelete(cat: Category) {
    const count = transactions.filter((t) => t.categoryId === cat.id).length;
    if (count > 0) {
      setDeleteConfirmId(cat.id);
      return;
    }
    removeOptimistic(cat.id);
    try {
      await deleteCategory(cat.id);
      toast.success('Category deleted');
    } catch {
      toast.error('Failed to delete category');
    }
    setDeleteConfirmId(null);
  }

  return (
    <div className="space-y-2">
      {categories.map((cat) => (
        <div key={cat.id}>
          {editingId === cat.id ? (
            <EditForm
              name={name} setName={setName}
              color={color} setColor={setColor}
              icon={icon} setIcon={setIcon}
              onSave={handleSave} onCancel={cancel}
            />
          ) : (
            <div className="flex items-center gap-3 p-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-base flex-shrink-0"
                style={{ backgroundColor: `${cat.color}20`, color: cat.color }}
              >
                {cat.icon}
              </div>
              <span className="flex-1 text-sm font-medium text-[var(--color-heading)]">{cat.name}</span>
              {cat.isDefault && (
                <span className="text-xs text-[var(--color-muted)] bg-[var(--color-border-light)] px-2 py-0.5 rounded-full">default</span>
              )}
              <button onClick={() => startEdit(cat)} className="text-xs text-[var(--color-primary-500)] hover:underline">Edit</button>
              {!cat.isDefault && (
                <>
                  {deleteConfirmId === cat.id ? (
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-[var(--color-expense)]">
                        {transactions.filter(t => t.categoryId === cat.id).length} transactions affected
                      </p>
                      <button
                        onClick={async () => {
                          removeOptimistic(cat.id);
                          setDeleteConfirmId(null);
                          try { await deleteCategory(cat.id); toast.success('Deleted'); }
                          catch { toast.error('Failed'); }
                        }}
                        className="text-xs text-white bg-[var(--color-expense)] px-2 py-0.5 rounded-lg"
                      >
                        Confirm
                      </button>
                      <button onClick={() => setDeleteConfirmId(null)} className="text-xs text-[var(--color-muted)]">Cancel</button>
                    </div>
                  ) : (
                    <button onClick={() => handleDelete(cat)} className="text-xs text-[var(--color-expense)] hover:underline">Delete</button>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      ))}

      {editingId === 'new' ? (
        <EditForm
          name={name} setName={setName}
          color={color} setColor={setColor}
          icon={icon} setIcon={setIcon}
          onSave={handleSave} onCancel={cancel}
        />
      ) : (
        <button
          onClick={startNew}
          className="w-full p-3 rounded-xl border-2 border-dashed border-[var(--color-border)] text-sm text-[var(--color-muted)] hover:border-[var(--color-primary-400)] hover:text-[var(--color-primary-500)] transition-colors"
        >
          + Add Category
        </button>
      )}
    </div>
  );
}

function EditForm({
  name, setName, color, setColor, icon, setIcon, onSave, onCancel,
}: {
  name: string; setName: (v: string) => void;
  color: string; setColor: (v: string) => void;
  icon: string; setIcon: (v: string) => void;
  onSave: () => void; onCancel: () => void;
}) {
  return (
    <div className="p-3 rounded-xl border-2 border-[var(--color-primary-300)] bg-[var(--color-primary-50)] space-y-3">
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Category name"
        className="w-full text-sm rounded-lg border border-[var(--color-border)] px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-400)]"
        autoFocus
      />
      <div>
        <p className="text-xs text-[var(--color-muted)] mb-1.5">Color</p>
        <div className="flex flex-wrap gap-1.5">
          {CATEGORY_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              className={`w-6 h-6 rounded-full transition-transform ${color === c ? 'scale-125 ring-2 ring-offset-1 ring-[var(--color-heading)]' : ''}`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
      </div>
      <div>
        <p className="text-xs text-[var(--color-muted)] mb-1.5">Icon</p>
        <div className="flex flex-wrap gap-1">
          {CATEGORY_ICONS.map((em) => (
            <button
              key={em}
              type="button"
              onClick={() => setIcon(em)}
              className={`w-8 h-8 rounded-lg text-base flex items-center justify-center transition-all ${icon === em ? 'bg-[var(--color-primary-100)] ring-2 ring-[var(--color-primary-400)]' : 'hover:bg-[var(--color-border-light)]'}`}
            >
              {em}
            </button>
          ))}
        </div>
      </div>
      <div className="flex gap-2">
        <button onClick={onSave} className="flex-1 py-2 rounded-lg bg-[var(--color-primary-500)] text-white text-sm font-semibold hover:bg-[var(--color-primary-600)]">
          Save
        </button>
        <button onClick={onCancel} className="flex-1 py-2 rounded-lg bg-[var(--color-surface)] text-[var(--color-body)] text-sm border border-[var(--color-border)]">
          Cancel
        </button>
      </div>
    </div>
  );
}
