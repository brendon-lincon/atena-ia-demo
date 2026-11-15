import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { Obra } from '@/core/entities';
import { formatMoney, formatPercent } from '@/core/format';
import { duration } from '@/design/motion.generated';
import { t } from '@/modules/home/dashboard/i18n';

const axis = {
  stroke: 'var(--border)',
  tick: { fill: 'var(--muted-foreground)', fontSize: 12 },
} as const;
const tooltipStyle = {
  background: 'var(--elevated)',
  border: '1px solid var(--border)',
  borderRadius: 12,
  color: 'var(--foreground)',
  fontSize: 13,
} as const;
const MS = duration.data * 1000;
const SHORT = 14;

const short = (name: string) =>
  name.length > SHORT
    ? name.replace('Base de Distribuição ', '').replace('Serviços civis — ', '').slice(0, SHORT)
    : name;

/** Custo orçado × realizado até a data, por obra. */
export function CostChart({ obras }: { obras: Obra[] }) {
  const data = obras
    .filter((o) => o.actualCostToDateCents > 0)
    .map((o) => ({
      name: short(o.name),
      budgeted: o.budgetedCostToDateCents / 100,
      actual: o.actualCostToDateCents / 100,
    }));
  return (
    <div className="h-64" role="img" aria-label={t('charts.cost')}>
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
          <CartesianGrid stroke="var(--border)" strokeDasharray="3 5" vertical={false} />
          <XAxis dataKey="name" {...axis} />
          <YAxis
            tickFormatter={(v: number) => formatMoney(v * 100, { compact: true })}
            {...axis}
            width={64}
          />
          <Tooltip
            contentStyle={tooltipStyle}
            cursor={{ fill: 'var(--muted)' }}
            formatter={(v) => formatMoney(Number(v) * 100)}
          />
          <Bar
            dataKey="budgeted"
            name={t('charts.budgeted')}
            fill="var(--chart-4)"
            radius={[4, 4, 0, 0]}
            animationDuration={MS}
          />
          <Bar
            dataKey="actual"
            name={t('charts.actual')}
            fill="var(--chart-1)"
            radius={[4, 4, 0, 0]}
            animationDuration={MS}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

/** Avanço previsto × real, por obra em execução. */
export function ProgressChart({ obras }: { obras: Obra[] }) {
  const data = obras
    .filter((o) => o.status !== 'mobilizing')
    .map((o) => ({
      name: short(o.name),
      planned: o.plannedPhysicalPct,
      real: o.actualPhysicalPct,
    }));
  return (
    <div className="h-64" role="img" aria-label={t('charts.progress')}>
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
          <CartesianGrid stroke="var(--border)" strokeDasharray="3 5" vertical={false} />
          <XAxis dataKey="name" {...axis} />
          <YAxis
            domain={[0, 100]}
            tickFormatter={(v: number) => formatPercent(v)}
            {...axis}
            width={48}
          />
          <Tooltip
            contentStyle={tooltipStyle}
            cursor={{ fill: 'var(--muted)' }}
            formatter={(v) => formatPercent(Number(v), 1)}
          />
          <Bar
            dataKey="planned"
            name={t('charts.planned')}
            fill="var(--chart-4)"
            radius={[4, 4, 0, 0]}
            animationDuration={MS}
          />
          <Bar
            dataKey="real"
            name={t('charts.real')}
            fill="var(--chart-2)"
            radius={[4, 4, 0, 0]}
            animationDuration={MS}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
