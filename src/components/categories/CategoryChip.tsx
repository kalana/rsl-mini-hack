import type { Category } from '@/types';

interface CategoryChipProps {
  category: Category;
  selected: boolean;
  onClick: () => void;
}

export function CategoryChip({ category, selected, onClick }: CategoryChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-[var(--radius-chip)] text-sm font-medium transition-all duration-150 border ${
        selected
          ? 'border-current text-white'
          : 'border-[var(--color-border)] text-[var(--color-body)] bg-[var(--color-surface)] hover:border-gray-400'
      }`}
      style={
        selected
          ? { backgroundColor: category.color, borderColor: category.color }
          : {}
      }
    >
      <span>{category.icon}</span>
      <span>{category.name}</span>
    </button>
  );
}
