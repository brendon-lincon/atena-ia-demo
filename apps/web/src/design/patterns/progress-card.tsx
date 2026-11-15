import { Link } from 'react-router';
import { cn } from '@/design/cn';
import { Sparkline } from './sparkline';
import { ProgressRing } from './progress-ring';

export type LightTone = 'green' | 'yellow' | 'red' | 'gray';
const DOT: Record<LightTone, string> = {
  green: 'bg-success',
  yellow: 'bg-warning',
  red: 'bg-danger',
  gray: 'bg-border',
};

export interface ProgressCardProps {
  to: string;
  title: string;
  subtitle: string;
  progress: number;
  planned?: number;
  lights: { label: string; value: string; tone: LightTone }[];
  metrics: { label: string; value: string }[];
  trend?: number[];
  tag?: string;
}

/** Cartão de obra: anel de avanço, semáforos de prazo e custo, indicadores e minigráfico. */
export function ProgressCard({
  to,
  title,
  subtitle,
  progress,
  planned,
  lights,
  metrics,
  trend,
  tag,
}: ProgressCardProps) {
  return (
    <Link
      to={to}
      className="surface-card group flex h-full flex-col gap-4 p-5 transition-[box-shadow,transform] duration-[var(--duration-base)] hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="flex items-start gap-4">
        <ProgressRing value={progress} planned={planned} size={76} stroke={7}>
          <span className="text-base font-semibold tnum">{Math.round(progress)}%</span>
        </ProgressRing>
        <div className="min-w-0 flex-1">
          {tag && (
            <span className="mb-1 inline-block rounded-full bg-primary-soft px-2 py-0.5 text-xs font-medium">
              {tag}
            </span>
          )}
          <h3 className="line-clamp-2 text-lg leading-snug font-semibold tracking-tight">
            {title}
          </h3>
          <p className="truncate text-sm text-muted-foreground">{subtitle}</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-sm">
        {lights.map((light) => (
          <span key={light.label} className="inline-flex items-center gap-1.5">
            <span className={cn('size-2.5 rounded-full', DOT[light.tone])} />
            <span className="text-muted-foreground">{light.label}</span>
            <span className="font-medium tnum">{light.value}</span>
          </span>
        ))}
      </div>
      <div className="mt-auto flex items-end justify-between gap-3 border-t border-border pt-3">
        <dl className="flex gap-5">
          {metrics.map((m) => (
            <div key={m.label}>
              <dt className="text-xs text-muted-foreground">{m.label}</dt>
              <dd className="text-base font-semibold tnum">{m.value}</dd>
            </div>
          ))}
        </dl>
        {trend && trend.length > 1 && <Sparkline data={trend} width={84} height={28} />}
      </div>
    </Link>
  );
}
