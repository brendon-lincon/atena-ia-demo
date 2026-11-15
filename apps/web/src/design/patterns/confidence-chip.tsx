import { createT } from '@/core/i18n/create-t';
import { messages } from '@/core/i18n/messages';
import { cn } from '@/design/cn';
import { Tooltip } from '@/design/ui/overlay';

const t = createT(messages);
export type ConfidenceLevel = 'high' | 'medium' | 'low';

export function confidenceLevel(value: number): ConfidenceLevel {
  if (value >= 0.9) return 'high';
  return value >= 0.7 ? 'medium' : 'low';
}

const TONE: Record<ConfidenceLevel, string> = {
  high: 'bg-success-soft text-success-text',
  medium: 'bg-primary-soft text-foreground',
  low: 'bg-warning-soft text-warning-text ring-1 ring-warning/50',
};

/** Confiança de uma leitura automática (0 a 1). Baixa confiança fica em destaque. */
export function ConfidenceChip({ value, className }: { value: number; className?: string }) {
  const level = confidenceLevel(value);
  const percent = Math.round(value * 100);
  return (
    <Tooltip label={t('confidence.value', { value: percent })}>
      <span
        className={cn(
          'inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium tnum',
          TONE[level],
          className,
        )}
      >
        <span className="flex items-end gap-px" aria-hidden>
          {[0.4, 0.7, 1].map((h, i) => (
            <span
              key={i}
              className={cn(
                'w-[3px] rounded-[1px] bg-current',
                level === 'low' && i > 0 && 'opacity-30',
                level === 'medium' && i > 1 && 'opacity-30',
              )}
              style={{ height: `${h * 10}px` }}
            />
          ))}
        </span>
        {percent}%<span className="sr-only">{t(`confidence.${level}`)}</span>
      </span>
    </Tooltip>
  );
}
