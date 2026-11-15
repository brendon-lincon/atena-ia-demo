import { addDays, format, startOfWeek } from 'date-fns';
import { ArrowDownToLine, ArrowUpFromLine, Landmark, Receipt } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useList } from '@/core/api/hooks';
import { looseRecord } from '@/core/api/loose';
import { defineResource } from '@/core/api/resource';
import { formatMoney } from '@/core/format';
import { duration } from '@/design/motion.generated';
import { Cascade, CascadeItem } from '@/design/patterns/cascade';
import { KpiCard } from '@/design/patterns/kpi-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/design/ui/misc';
import { o } from '@/modules/company/finance/overview-i18n';

const costs = defineResource('cost-entries', looseRecord);
const payables = defineResource('payables', looseRecord);
const receivables = defineResource('receivables', looseRecord);
const ALL = { pageSize: 500 };
const WEEKS = 8;
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
const num = (v: unknown) => (typeof v === 'number' ? v : 0);

/** Visão geral do financeiro: indicadores, custos por categoria e fluxo de caixa projetado. */
export default function FinanceOverview() {
  const cost = useList(costs, ALL).data?.data;
  const pay = useList(payables, ALL).data?.data;
  const rec = useList(receivables, ALL).data?.data;
  const [now] = useState(() => new Date());
  const model = useMemo(() => {
    const open = (rows: typeof pay) => (rows ?? []).filter((r) => r.status !== 'paid');
    const toReceive = open(rec).reduce((s, r) => s + num(r.amountCents), 0);
    const toPay = open(pay).reduce((s, r) => s + num(r.amountCents), 0);
    const posted = (cost ?? []).reduce((s, r) => s + num(r.amountCents), 0);
    const byCategory = (
      ['materials', 'labor', 'equipment', 'subcontract', 'logistics', 'indirect', 'safety'] as const
    ).map((key) => ({
      name: o(`categories.${key}`),
      value:
        (cost ?? []).filter((r) => r.category === key).reduce((s, r) => s + num(r.amountCents), 0) /
        100,
    }));
    const start = startOfWeek(now, { weekStartsOn: 1 });
    const weeks = Array.from({ length: WEEKS }, (_, i) => {
      const from = format(addDays(start, i * 7), 'yyyy-MM-dd');
      const to = format(addDays(start, i * 7 + 6), 'yyyy-MM-dd');
      const within = (rows: typeof pay) =>
        open(rows)
          .filter((r) => typeof r.dueDate === 'string' && r.dueDate >= from && r.dueDate <= to)
          .reduce((s, r) => s + num(r.amountCents), 0) / 100;
      return { label: format(addDays(start, i * 7), 'dd/MM'), in: within(rec), out: within(pay) };
    });
    return { toReceive, toPay, posted, byCategory, weeks };
  }, [cost, pay, rec, now]);
  const ms = duration.data * 1000;
  return (
    <div className="space-y-6">
      <Cascade className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <CascadeItem>
          <KpiCard
            label={o('receivable')}
            value={model.toReceive}
            format={(n) => formatMoney(n, { compact: true })}
            icon={<ArrowDownToLine className="size-4" />}
          />
        </CascadeItem>
        <CascadeItem>
          <KpiCard
            label={o('payable')}
            value={model.toPay}
            format={(n) => formatMoney(n, { compact: true })}
            icon={<ArrowUpFromLine className="size-4" />}
          />
        </CascadeItem>
        <CascadeItem>
          <KpiCard
            label={o('posted')}
            value={model.posted}
            format={(n) => formatMoney(n, { compact: true })}
            icon={<Receipt className="size-4" />}
          />
        </CascadeItem>
        <CascadeItem>
          <KpiCard
            label={o('balance')}
            value={model.toReceive - model.toPay}
            format={(n) => formatMoney(n, { compact: true })}
            icon={<Landmark className="size-4" />}
          />
        </CascadeItem>
      </Cascade>
      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{o('byCategory')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer>
                <BarChart data={model.byCategory} layout="vertical" margin={{ left: 24, right: 8 }}>
                  <CartesianGrid stroke="var(--border)" strokeDasharray="3 5" horizontal={false} />
                  <XAxis
                    type="number"
                    {...axis}
                    tickFormatter={(v: number) => formatMoney(v * 100, { compact: true })}
                  />
                  <YAxis type="category" dataKey="name" {...axis} width={100} />
                  <Tooltip
                    contentStyle={tooltipStyle}
                    cursor={{ fill: 'var(--muted)' }}
                    formatter={(v) => formatMoney(Number(v) * 100)}
                  />
                  <Bar
                    dataKey="value"
                    fill="var(--chart-2)"
                    radius={[0, 4, 4, 0]}
                    animationDuration={ms}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{o('cashflow')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer>
                <BarChart data={model.weeks} margin={{ top: 8, right: 8, left: 0 }}>
                  <CartesianGrid stroke="var(--border)" strokeDasharray="3 5" vertical={false} />
                  <XAxis dataKey="label" {...axis} />
                  <YAxis
                    {...axis}
                    width={64}
                    tickFormatter={(v: number) => formatMoney(v * 100, { compact: true })}
                  />
                  <Tooltip
                    contentStyle={tooltipStyle}
                    cursor={{ fill: 'var(--muted)' }}
                    formatter={(v) => formatMoney(Number(v) * 100)}
                  />
                  <Bar
                    dataKey="in"
                    name={o('in')}
                    fill="var(--success)"
                    radius={[4, 4, 0, 0]}
                    animationDuration={ms}
                  />
                  <Bar
                    dataKey="out"
                    name={o('out')}
                    fill="var(--chart-1)"
                    radius={[4, 4, 0, 0]}
                    animationDuration={ms}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
