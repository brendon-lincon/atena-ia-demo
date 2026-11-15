import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/design/cn';
import { AnimatedNumber } from './animated-number';
import { Sparkline } from './sparkline';

export interface KpiCardProps {
  label: string;
  value: number;
  format: (n: number) => string;
  delta?: { value: string; tone: 'good' | 'bad' | 'neutral'; direction: 'up' | 'down' | 'flat' };
  trend?: number[];
  icon?: ReactNode;
  footnote?: string;
  className?: string;
}

const DELTA_TONE = {
  good: 'text-success-text',
  bad: 'text-danger-text',
  neutral: 'text-muted-foreground',
} as const;

/** Indicador com número que conta, variação e minigráfico. */
export function KpiCard({
  label,
  value,
  format,
  delta,
  trend,
  icon,
  footnote,
  className,
}: KpiCardProps) {
  const Arrow =
    delta?.direction === 'up' ? ArrowUpRight : delta?.direction === 'down' ? ArrowDownRight : Minus;
  return (
    <div className={cn('surface-card flex flex-col gap-3 p-5', className)}>
      <div className="flex items-center justify-between gap-2 text-muted-foreground">
        <span className="text-sm font-medium">{label}</span>
        {icon}
      </div>
      <div className="flex items-end justify-between gap-3">
        <AnimatedNumber
          value={value}
          format={format}
          className="text-3xl font-semibold tracking-tight tnum"
        />
        {trend && <Sparkline data={trend} />}
      </div>
      {(delta ?? footnote) && (
        <div className="flex items-center gap-2 text-sm">
          {delta && (
            <span
              className={cn('inline-flex items-center gap-0.5 font-medium', DELTA_TONE[delta.tone])}
            >
              <Arrow className="size-4" />
              {delta.value}
            </span>
          )}
          {footnote && <span className="text-muted-foreground">{footnote}</span>}
        </div>
      )}
    </div>
  );
}
