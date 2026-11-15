import { useMemo } from 'react';
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { EapItem, ScheduleActivity } from '@/core/entities';
import { formatMoney } from '@/core/format';
import { duration } from '@/design/motion.generated';
import { SCurve } from '@/design/patterns/charts';
import { Card, CardContent, CardHeader, CardTitle } from '@/design/ui/misc';
import { physicalFinancial, sCurve } from '@/modules/works/planning/lib/curves';
import { t } from '@/modules/works/planning/i18n';

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

export function SCurveTab({
  activities,
  eap,
  today,
}: {
  activities: ScheduleActivity[];
  eap: EapItem[];
  today: Date;
}) {
  const data = useMemo(() => sCurve(activities, eap, today), [activities, eap, today]);
  const last = [...data].reverse().find((p) => p.actual !== undefined);
  const gap = last ? Math.abs(last.planned - (last.actual ?? 0)) : 0;
  const todayIso = last?.date;
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('scurve.title')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {last && (
          <p className="text-base text-muted-foreground">
            {t('scurve.gap', {
              gap: gap.toFixed(1).replace('.', ','),
              direction: (last.actual ?? 0) <= last.planned ? t('scurve.below') : t('scurve.above'),
            })}
          </p>
        )}
        <SCurve data={data} todayDate={todayIso} height={360} />
      </CardContent>
    </Card>
  );
}

export function FinancialTab({
  activities,
  eap,
}: {
  activities: ScheduleActivity[];
  eap: EapItem[];
}) {
  const data = useMemo(
    () =>
      physicalFinancial(activities, eap).map((p) => ({
        ...p,
        period: p.plannedCents / 100,
        accumulated: p.accumulatedCents / 100,
      })),
    [activities, eap],
  );
  const ms = duration.data * 1000;
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('financial.period')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">{t('financial.hint')}</p>
        <div className="h-96">
          <ResponsiveContainer>
            <ComposedChart data={data} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
              <CartesianGrid stroke="var(--border)" strokeDasharray="3 5" vertical={false} />
              <XAxis dataKey="label" {...axis} minTickGap={20} />
              <YAxis
                yAxisId="left"
                tickFormatter={(v: number) => formatMoney(v * 100, { compact: true })}
                {...axis}
                width={70}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                tickFormatter={(v: number) => formatMoney(v * 100, { compact: true })}
                {...axis}
                width={70}
              />
              <Tooltip
                contentStyle={tooltipStyle}
                cursor={{ fill: 'var(--muted)' }}
                formatter={(v) => formatMoney(Number(v) * 100)}
              />
              <Bar
                yAxisId="left"
                dataKey="period"
                name={t('financial.period')}
                fill="var(--chart-3)"
                radius={[4, 4, 0, 0]}
                animationDuration={ms}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="accumulated"
                name={t('financial.accumulated')}
                stroke="var(--chart-1)"
                strokeWidth={3}
                dot={false}
                animationDuration={ms}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
