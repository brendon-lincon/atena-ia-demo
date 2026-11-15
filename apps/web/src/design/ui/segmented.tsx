import { motion } from 'motion/react';
import { useId, type ReactNode } from 'react';
import { cn } from '@/design/cn';
import { spring } from '@/design/motion.generated';

export interface SegmentedOption<T extends string> {
  value: T;
  label: ReactNode;
  ariaLabel?: string;
}

/** Controle segmentado (alternar visualizações) com indicador deslizante. */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
  className,
}: {
  options: SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}) {
  const group = useId();
  return (
    <div role="radiogroup" className={cn('inline-flex rounded-md bg-muted p-1', className)}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          role="radio"
          aria-checked={option.value === value}
          aria-label={option.ariaLabel}
          onClick={() => onChange(option.value)}
          className={cn(
            'relative inline-flex h-8 items-center justify-center gap-1.5 rounded-sm px-3 text-sm font-medium transition-colors',
            option.value === value
              ? 'text-foreground'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          {option.value === value && (
            <motion.span
              layoutId={`seg-${group}`}
              transition={spring}
              className="absolute inset-0 rounded-sm bg-surface shadow-sm"
            />
          )}
          <span className="relative z-10 inline-flex items-center gap-1.5">{option.label}</span>
        </button>
      ))}
    </div>
  );
}
