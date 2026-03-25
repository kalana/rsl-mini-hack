'use client';

interface ProgressBarProps {
  value: number; // 0–100
  color?: string;
  height?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  label?: string;
  animate?: boolean;
  className?: string;
}

export function ProgressBar({
  value,
  color,
  height = 'md',
  showLabel = false,
  label,
  animate = true,
  className = '',
}: ProgressBarProps) {
  const clampedValue = Math.min(Math.max(value, 0), 100);
  const heights = { sm: 'h-1.5', md: 'h-2.5', lg: 'h-4' };

  const defaultColor =
    clampedValue >= 85 ? '#f87171' :
    clampedValue >= 60 ? '#fb923c' :
    '#4ade80';

  const barColor = color ?? defaultColor;

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {(showLabel || label) && (
        <div className="flex justify-between text-xs text-[var(--color-muted)]">
          {label && <span>{label}</span>}
          {showLabel && <span>{Math.round(clampedValue)}%</span>}
        </div>
      )}
      <div className={`w-full bg-[var(--color-border-light)] rounded-full overflow-hidden ${heights[height]}`}>
        <div
          className={`${heights[height]} rounded-full ${animate ? 'transition-all duration-700 ease-out' : ''}`}
          style={{ width: `${clampedValue}%`, backgroundColor: barColor }}
        />
      </div>
    </div>
  );
}
