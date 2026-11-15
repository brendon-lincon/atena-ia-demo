import {
  Area,
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip as ChartTooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { createT } from '@/core/i18n/create-t';
import { messages } from '@/core/i18n/messages';
import { formatDateShort, formatPercent } from '@/core/format';
import { duration } from '@/design/motion.generated';
import { EmptyState } from './empty-state';

const t = createT(messages);
const DATA_MS = duration.data * 1000;
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

export interface SCurvePoint {
  date: string;
  planned: number;
  actual?: number;
}

/** Curva S: previsto × realizado acumulados (%), com marca de hoje; o traçado se desenha ao entrar. */
export function SCurve({
  data,
  todayDate,
  height = 320,
}: {
  data: SCurvePoint[];
  todayDate?: string;
  height?: number;
}) {
  if (data.length === 0) return <EmptyState title={t('chart.noData')} className="py-8" />;
  return (
    <div style={{ height }} role="img" aria-label={`${t('chart.planned')} × ${t('chart.actual')}`}>
      <ResponsiveContainer>
        <ComposedChart data={data} margin={{ top: 12, right: 12, bottom: 0, left: -12 }}>
          <defs>
            <linearGradient id="s-actual" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="var(--chart-2)" stopOpacity="0.28" />
              <stop offset="1" stopColor="var(--chart-2)" stopOpacity="0" />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="var(--border)" strokeDasharray="3 5" vertical={false} />
          <XAxis dataKey="date" tickFormatter={formatDateShort} {...axis} minTickGap={36} />
          <YAxis
            domain={[0, 100]}
            tickFormatter={(v: number) => formatPercent(v)}
            {...axis}
            width={52}
          />
          <ChartTooltip
            contentStyle={tooltipStyle}
            labelFormatter={(label) => (typeof label === 'string' ? formatDateShort(label) : '')}
            formatter={(value) => formatPercent(Number(value), 1)}
          />
          {todayDate && (
            <ReferenceLine
              x={todayDate}
              stroke="var(--primary)"
              strokeDasharray="4 4"
              label={{
                value: t('gantt.today'),
                fill: 'var(--primary)',
                fontSize: 12,
                position: 'insideTopRight',
              }}
            />
          )}
          <Area
            type="monotone"
            dataKey="actual"
            name={t('chart.actual')}
            stroke="none"
            fill="url(#s-actual)"
            animationDuration={DATA_MS}
          />
          <Line
            type="monotone"
            dataKey="planned"
            name={t('chart.planned')}
            stroke="var(--chart-4)"
            strokeWidth={2.5}
            strokeDasharray="6 5"
            dot={false}
            animationDuration={DATA_MS}
          />
          <Line
            type="monotone"
            dataKey="actual"
            name={t('chart.actual')}
            stroke="var(--chart-2)"
            strokeWidth={3}
            dot={false}
            animationDuration={DATA_MS}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

export interface HistogramBar {
  label: string;
  values: Record<string, number>;
  capacity?: number;
}

/** Histograma de recursos por período e função; excesso sobre a capacidade fica destacado em vermelho. */
export function Histogram({
  data,
  roles,
  height = 320,
}: {
  data: HistogramBar[];
  roles: { key: string; label: string }[];
  height?: number;
}) {
  const rows = data.map((bar) => ({
    label: bar.label,
    capacity: bar.capacity,
    ...bar.values,
    total: Object.values(bar.values).reduce((sum, n) => sum + n, 0),
  }));
  const conflicts = rows.filter((row) => row.capacity !== undefined && row.total > row.capacity);
  return (
    <div style={{ height }} role="img" aria-label={t('histogram.capacity')}>
      <ResponsiveContainer>
        <ComposedChart data={rows} margin={{ top: 12, right: 12, bottom: 0, left: -12 }}>
          <CartesianGrid stroke="var(--border)" strokeDasharray="3 5" vertical={false} />
          <XAxis dataKey="label" {...axis} />
          <YAxis {...axis} width={44} allowDecimals={false} />
          <ChartTooltip contentStyle={tooltipStyle} cursor={{ fill: 'var(--muted)' }} />
          {conflicts.map((c) => (
            <ReferenceArea
              key={c.label}
              x1={c.label}
              x2={c.label}
              fill="var(--danger)"
              fillOpacity={0.14}
              stroke="var(--danger)"
              strokeOpacity={0.5}
              label={{
                value: t('histogram.conflict'),
                fill: 'var(--danger-text)',
                fontSize: 11,
                position: 'top',
              }}
            />
          ))}
          {roles.map((role, index) => (
            <Bar
              key={role.key}
              dataKey={role.key}
              name={role.label}
              stackId="a"
              fill={`var(--chart-${(index % 5) + 1})`}
              radius={index === roles.length - 1 ? [4, 4, 0, 0] : 0}
              animationDuration={DATA_MS}
            />
          ))}
          <Line
            type="stepAfter"
            dataKey="capacity"
            name={t('histogram.capacity')}
            stroke="var(--foreground)"
            strokeWidth={2}
            strokeDasharray="5 4"
            dot={false}
            animationDuration={DATA_MS}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
