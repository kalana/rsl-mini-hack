import type { Category } from '@/types';

interface CategoryBadgeProps {
  category: Category | undefined;
  size?: 'sm' | 'md' | 'lg';
  showName?: boolean;
}

export function CategoryBadge({ category, size = 'md', showName = false }: CategoryBadgeProps) {
  const sizes = {
    sm: 'w-7 h-7 text-sm',
    md: 'w-9 h-9 text-base',
    lg: 'w-12 h-12 text-xl',
  };

  if (!category) {
    return (
      <div className={`${sizes[size]} rounded-full bg-[var(--color-border-light)] flex items-center justify-center text-[var(--color-muted)]`}>
        ?
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <div
        className={`${sizes[size]} rounded-full flex items-center justify-center flex-shrink-0`}
        style={{ backgroundColor: `${category.color}20`, color: category.color }}
      >
        {category.icon}
      </div>
      {showName && (
        <span className="text-sm font-medium text-[var(--color-heading)]">{category.name}</span>
      )}
    </div>
  );
}
