interface EmptyStateProps {
  emoji?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ emoji = '📭', title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="text-5xl mb-4">{emoji}</div>
      <h3 className="text-base font-semibold text-[var(--color-heading)] mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-[var(--color-muted)] mb-6 max-w-xs">{description}</p>
      )}
      {action && <div>{action}</div>}
    </div>
  );
}
