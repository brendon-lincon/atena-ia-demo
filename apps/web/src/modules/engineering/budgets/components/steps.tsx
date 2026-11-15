import { Check, FileUp } from 'lucide-react';
import { useState } from 'react';
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
import { formatMoney, formatNumber, formatPercent } from '@/core/format';
import { duration } from '@/design/motion.generated';
import { AnimatedNumber } from '@/design/patterns/animated-number';
import { ConfidenceChip } from '@/design/patterns/confidence-chip';
import { SourceTag } from '@/design/patterns/source-tag';
import { StatusBadge } from '@/design/patterns/status-badge';
import { cn } from '@/design/cn';
import { Button } from '@/design/ui/button';
import { Input, Label, Select, Slider, Textarea } from '@/design/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/design/ui/misc';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from '@/design/ui/table';
import type { Budget, BudgetItem, Composition } from '@/modules/engineering/budgets/api';
import { t } from '@/modules/engineering/budgets/i18n';
import {
  abcCurve,
  spreadByPeriod,
  type PricingResult,
} from '@/modules/engineering/budgets/lib/pricing';

const LEVELS = ['cost_estimate', 'preliminary', 'analytic', 'synthetic'] as const;
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
const LOW = 0.7;
const MS = duration.data * 1000;
const PERIODS = 8;

export function InputStep({
  level,
  onLevel,
  files,
  file,
  onFile,
  mode,
  onMode,
}: {
  level: Budget['level'];
  onLevel: (l: Budget['level']) => void;
  files: { id: string; name: string }[];
  file: string;
  onFile: (id: string) => void;
  mode: 'upload' | 'paste';
  onMode: (m: 'upload' | 'paste') => void;
}) {
  return (
    <div className="space-y-6">
      <section className="space-y-3">
        <h3 className="text-lg font-semibold tracking-tight">{t('input.level')}</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          {LEVELS.map((l) => (
            <button
              key={l}
              type="button"
              aria-pressed={level === l}
              onClick={() => onLevel(l)}
              className={cn(
                'surface-card space-y-1 p-4 text-left transition-shadow hover:shadow-md',
                level === l && 'ring-2 ring-primary',
              )}
            >
              <span className="flex items-center justify-between text-base font-semibold">
                {t(`levels.${l}`)}
                {level === l && <Check className="size-4 text-primary" />}
              </span>
              <span className="block text-sm text-muted-foreground">
                {t(`levelInfo.${l}.input`)}
              </span>
              <span className="block text-xs text-muted-foreground">
                {t(`levelInfo.${l}.norm`)} · {t(`levelInfo.${l}.precision`)}
              </span>
            </button>
          ))}
        </div>
      </section>
      <section className="space-y-3">
        <h3 className="text-lg font-semibold tracking-tight">{t('input.entry')}</h3>
        <div className="flex gap-2">
          <Button
            variant={mode === 'upload' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => onMode('upload')}
          >
            <FileUp /> {t('input.upload')}
          </Button>
          <Button
            variant={mode === 'paste' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => onMode('paste')}
          >
            {t('input.paste')}
          </Button>
        </div>
        {mode === 'upload' ? (
          <div className="space-y-1.5">
            <p className="text-sm text-muted-foreground">{t('input.sample')}</p>
            <Label htmlFor="proj">{t('input.file')}</Label>
            <Select id="proj" value={file} onChange={(e) => onFile(e.target.value)}>
              {files.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </Select>
          </div>
        ) : (
          <div className="space-y-1.5">
            <p className="text-sm text-muted-foreground">{t('input.pasteHint')}</p>
            <Textarea
              rows={5}
              placeholder={t('input.pastePlaceholder')}
              aria-label={t('input.paste')}
            />
          </div>
        )}
      </section>
    </div>
  );
}

export function QuantitiesStep({
  items,
  quantities,
  onQuantity,
  confirmed,
  onConfirm,
  totals,
}: {
  items: BudgetItem[];
  quantities: Record<string, number>;
  onQuantity: (id: string, value: number) => void;
  confirmed: Set<string>;
  onConfirm: (id: string) => void;
  totals: Map<string, number>;
}) {
  const low = items.filter((i) => i.confidence < LOW).length;
  return (
    <div className="space-y-3">
      <p className="text-base">
        <span className="font-semibold">
          {t('quantities.summary', { count: items.length, low })}.
        </span>{' '}
        <span className="text-muted-foreground">{t('quantities.reviewLow')}.</span>
      </p>
      <div className="surface-card overflow-hidden">
        <Table>
          <TableHead>
            <tr>
              <TableHeaderCell>{t('quantities.desc')}</TableHeaderCell>
              <TableHeaderCell className="w-32 text-right">
                {t('quantities.quantity')}
              </TableHeaderCell>
              <TableHeaderCell className="hidden w-14 md:table-cell">
                {t('quantities.unit')}
              </TableHeaderCell>
              <TableHeaderCell className="hidden lg:table-cell">
                {t('quantities.source')}
              </TableHeaderCell>
              <TableHeaderCell className="w-28">{t('quantities.confidence')}</TableHeaderCell>
              <TableHeaderCell className="hidden text-right md:table-cell">
                {t('quantities.total')}
              </TableHeaderCell>
            </tr>
          </TableHead>
          <TableBody>
            {items.map((i) => {
              const isLow = i.confidence < LOW && !confirmed.has(i.id);
              return (
                <TableRow
                  key={i.id}
                  className={cn(isLow && 'bg-warning-soft/50 hover:bg-warning-soft/70')}
                >
                  <TableCell className="max-w-72">
                    <span className="block font-medium">{i.description}</span>
                    <span className="text-xs text-muted-foreground">{i.group}</span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Input
                      type="number"
                      step="any"
                      min={0}
                      value={quantities[i.id] ?? i.quantity}
                      onChange={(e) => onQuantity(i.id, Math.max(Number(e.target.value), 0))}
                      aria-label={`${t('quantities.edit')}: ${i.description}`}
                      className="h-8 text-right"
                    />
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{i.unit}</TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <SourceTag kind="file">
                      {i.source.fileName} · p. {i.source.page}
                    </SourceTag>
                  </TableCell>
                  <TableCell>
                    <span className="flex items-center gap-1.5">
                      <ConfidenceChip value={i.confidence} />
                      {i.confidence < LOW &&
                        (confirmed.has(i.id) ? (
                          <Check
                            className="size-4 text-success"
                            aria-label={t('quantities.reviewed')}
                          />
                        ) : (
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            aria-label={t('quantities.confirm')}
                            onClick={() => onConfirm(i.id)}
                          >
                            <Check />
                          </Button>
                        ))}
                    </span>
                  </TableCell>
                  <TableCell className="hidden text-right md:table-cell">
                    {formatMoney(totals.get(i.id) ?? i.totalCents, { compact: true })}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

export function PricesStep({
  items,
  compositions,
}: {
  items: BudgetItem[];
  compositions: Composition[];
}) {
  const [selected, setSelected] = useState(items[0]?.id);
  const item = items.find((i) => i.id === selected) ?? items[0];
  const comp = compositions.find((c) => c.id === item?.compositionId);
  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_1fr]">
      <div className="surface-card scrollbar-thin max-h-[480px] overflow-auto">
        <Table>
          <TableHead>
            <tr>
              <TableHeaderCell>{t('quantities.desc')}</TableHeaderCell>
              <TableHeaderCell className="text-right">{t('prices.unitCost')}</TableHeaderCell>
            </tr>
          </TableHead>
          <TableBody>
            {items.map((i) => (
              <TableRow
                key={i.id}
                className={cn('cursor-pointer', i.id === item?.id && 'bg-primary-soft')}
                onClick={() => setSelected(i.id)}
              >
                <TableCell className="max-w-64 truncate">{i.description}</TableCell>
                <TableCell className="text-right">
                  {formatMoney(i.unitCostCents)}/{i.unit}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <Card className="h-fit">
        {item && comp ? (
          <>
            <CardHeader>
              <CardTitle>
                {comp.code} — {comp.description}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {t('prices.priceSource')}: {item.priceSource} · {t('prices.base')}:{' '}
                {item.priceBaseDate}
              </p>
              <Table>
                <TableHead>
                  <tr>
                    <TableHeaderCell>{t('prices.inputs')}</TableHeaderCell>
                    <TableHeaderCell className="text-right">
                      {t('prices.coefficient')}
                    </TableHeaderCell>
                    <TableHeaderCell className="text-right">{t('prices.subtotal')}</TableHeaderCell>
                  </tr>
                </TableHead>
                <TableBody>
                  {comp.inputs.map((inp) => (
                    <TableRow key={inp.description}>
                      <TableCell>
                        <span className="block">{inp.description}</span>
                        <span className="text-xs text-muted-foreground">
                          {t(`prices.kind.${inp.kind}`)} · {formatMoney(inp.unitCostCents)}/
                          {inp.unit}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        {formatNumber(inp.coefficient, 3)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatMoney(Math.round(inp.coefficient * inp.unitCostCents))}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </>
        ) : (
          <CardContent className="pt-5 text-muted-foreground">{t('prices.selectHint')}</CardContent>
        )}
      </Card>
    </div>
  );
}

export function IndirectsStep({
  labels,
  rates,
  onRate,
  result,
  people,
  onPeople,
}: {
  labels: string[];
  rates: number[];
  onRate: (index: number, rate: number) => void;
  result: PricingResult;
  people: number;
  onPeople: (n: number) => void;
}) {
  const mobIndex = labels.findIndex((l) => /mobiliza/i.test(l));
  const mob = result.indirectCents[mobIndex] ?? 0;
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>{t('indirects.title')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">{t('indirects.hint')}</p>
          {labels.map((label, i) => (
            <div key={label} className="space-y-1.5">
              <div className="flex justify-between text-base">
                <Label>{label}</Label>
                <span className="tnum">
                  {formatPercent((rates[i] ?? 0) * 100, 1)} ·{' '}
                  {formatMoney(result.indirectCents[i] ?? 0, { compact: true })}
                </span>
              </div>
              <Slider
                value={[(rates[i] ?? 0) * 1000]}
                max={100}
                step={1}
                onValueChange={(v) => onRate(i, (v[0] ?? 0) / 1000)}
                aria-label={label}
              />
            </div>
          ))}
          <p className="flex justify-between border-t border-border pt-3 text-lg font-semibold">
            <span>{t('indirects.total')}</span>
            <span className="tnum">{formatMoney(result.indirectTotalCents)}</span>
          </p>
        </CardContent>
      </Card>
      <Card className="h-fit">
        <CardHeader>
          <CardTitle>{t('indirects.logistics')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">{t('indirects.logisticsHint')}</p>
          <div className="space-y-1.5">
            <Label>
              {t('indirects.people')}: <span className="tnum font-semibold">{people}</span>
            </Label>
            <Slider
              value={[people]}
              min={1}
              max={30}
              onValueChange={(v) => onPeople(v[0] ?? people)}
              aria-label={t('indirects.people')}
            />
          </div>
          <dl className="space-y-1.5 text-base">
            {[
              ['tickets', 0.3],
              ['lodging', 0.45],
              ['meals', 0.25],
            ].map(([k, share]) => (
              <div key={String(k)} className="flex justify-between">
                <dt className="text-muted-foreground">{t(`indirects.${k as 'tickets'}`)}</dt>
                <dd className="tnum font-medium">
                  {formatMoney(Math.round((mob * Number(share) * people) / 10), { compact: true })}
                </dd>
              </div>
            ))}
          </dl>
        </CardContent>
      </Card>
    </div>
  );
}

export function BdiStep({
  charges,
  onCharges,
  bdi,
  onBdi,
  result,
}: {
  charges: number;
  onCharges: (n: number) => void;
  bdi: number;
  onBdi: (n: number) => void;
  result: PricingResult;
}) {
  const line = (label: string, value: number, strong = false) => (
    <div
      className={cn(
        'flex justify-between gap-4 py-1.5',
        strong && 'border-t border-border pt-3 text-lg font-semibold',
      )}
    >
      <dt>{label}</dt>
      <dd className="tnum">{formatMoney(value)}</dd>
    </div>
  );
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>{t('bdi.title')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-1.5">
            <Label>
              {t('bdi.charges')}:{' '}
              <span className="tnum font-semibold">{formatNumber(charges, 1)}</span>
            </Label>
            <Slider
              value={[charges]}
              min={60}
              max={140}
              step={0.5}
              onValueChange={(v) => onCharges(v[0] ?? charges)}
              aria-label={t('bdi.charges')}
            />
          </div>
          <div className="space-y-1.5">
            <Label>
              {t('bdi.bdi')}: <span className="tnum font-semibold">{formatNumber(bdi, 1)}</span>
            </Label>
            <Slider
              value={[bdi]}
              min={5}
              max={40}
              step={0.5}
              onValueChange={(v) => onBdi(v[0] ?? bdi)}
              aria-label={t('bdi.bdi')}
            />
          </div>
          <p className="text-sm text-muted-foreground">{t('bdi.formula')}</p>
        </CardContent>
      </Card>
      <Card className="h-fit">
        <CardHeader>
          <CardTitle>{t('bdi.memory')}</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="text-base">
            {line(t('bdi.direct'), result.directCents)}
            {line(t('bdi.chargeEffect'), result.chargeEffectCents)}
            {line(t('bdi.indirect'), result.indirectTotalCents)}
            {line(t('bdi.subtotal'), result.subtotalCents)}
            {line(t('bdi.bdiValue'), result.bdiCents)}
            {line(t('bdi.total'), result.totalCents, true)}
          </dl>
        </CardContent>
      </Card>
    </div>
  );
}

export function ResultStep({
  result,
  items,
  totals,
  findings,
  added,
  onAdd,
  actions,
  status,
}: {
  result: PricingResult;
  items: BudgetItem[];
  totals: Map<string, number>;
  findings: Budget['crossCheck'];
  added: Set<string>;
  onAdd: (title: string) => void;
  actions: React.ReactNode;
  status: Budget['status'];
}) {
  const rows = items.map((i) => ({
    id: i.id,
    description: i.description,
    totalCents: totals.get(i.id) ?? i.totalCents,
    group: i.group,
  }));
  const groups = [...new Set(rows.map((r) => r.group))].map((name) => ({
    name,
    cents: rows.filter((r) => r.group === name).reduce((s, r) => s + r.totalCents, 0),
  }));
  const abc = abcCurve(rows);
  const spread = spreadByPeriod(groups, PERIODS);
  const schedule = spread.map((v, i) => ({
    label: t('result.periods', { n: i + 1 }),
    value: v / 100,
    accumulated: spread.slice(0, i + 1).reduce((sum, x) => sum + x, 0) / 100,
  }));
  return (
    <div className="space-y-6">
      <div className="surface-card flex flex-wrap items-center justify-between gap-4 p-6">
        <div>
          <p className="text-sm text-muted-foreground">{t('result.total')}</p>
          <AnimatedNumber
            value={result.totalCents}
            format={(n) => formatMoney(n)}
            className="text-5xl font-semibold tracking-tight tnum"
          />
        </div>
        <div className="flex flex-col items-end gap-3">
          <StatusBadge status={status} />
          {actions}
        </div>
      </div>
      {findings.length > 0 && (
        <section className="space-y-2">
          <h3 className="text-lg font-semibold tracking-tight">{t('result.findings')}</h3>
          {findings.map((f) => (
            <div
              key={f.title}
              className="surface-card flex flex-wrap items-start justify-between gap-3 border-l-4 border-l-warning p-4"
            >
              <div className="min-w-0 flex-1">
                <p className="text-base font-semibold">{f.title}</p>
                <p className="text-sm text-muted-foreground">{f.message}</p>
              </div>
              {added.has(f.title) ? (
                <span className="inline-flex items-center gap-1 text-sm font-medium text-success-text">
                  <Check className="size-4" />
                  {t('result.added')}
                </span>
              ) : (
                <Button size="sm" variant="outline" onClick={() => onAdd(f.title)}>
                  {t('result.addFinding')}
                </Button>
              )}
            </div>
          ))}
        </section>
      )}
      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t('result.synthetic')}</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHead>
                <tr>
                  <TableHeaderCell>{t('result.group')}</TableHeaderCell>
                  <TableHeaderCell className="text-right">{t('quantities.total')}</TableHeaderCell>
                  <TableHeaderCell className="text-right">{t('result.share')}</TableHeaderCell>
                </tr>
              </TableHead>
              <TableBody>
                {groups.map((g) => (
                  <TableRow key={g.name}>
                    <TableCell>{g.name}</TableCell>
                    <TableCell className="text-right">
                      {formatMoney(g.cents, { compact: true })}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatPercent((g.cents / (result.directCents || 1)) * 100, 1)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{t('result.abc')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer>
                <ComposedChart
                  data={abc.slice(0, 16).map((r, i) => ({
                    n: i + 1,
                    share: Math.round(r.share * 10) / 10,
                    cumulative: Math.round(r.cumulative * 10) / 10,
                  }))}
                  margin={{ top: 8, right: 8, bottom: 0, left: -8 }}
                >
                  <CartesianGrid stroke="var(--border)" strokeDasharray="3 5" vertical={false} />
                  <XAxis dataKey="n" {...axis} />
                  <YAxis yAxisId="l" {...axis} tickFormatter={(v: number) => `${v}%`} />
                  <YAxis
                    yAxisId="r"
                    orientation="right"
                    domain={[0, 100]}
                    {...axis}
                    tickFormatter={(v: number) => `${v}%`}
                  />
                  <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'var(--muted)' }} />
                  <Bar
                    yAxisId="l"
                    dataKey="share"
                    name={t('result.share')}
                    fill="var(--chart-3)"
                    radius={[4, 4, 0, 0]}
                    animationDuration={MS}
                  />
                  <Line
                    yAxisId="r"
                    dataKey="cumulative"
                    name={t('result.cumulative')}
                    stroke="var(--chart-1)"
                    strokeWidth={2.5}
                    dot={false}
                    animationDuration={MS}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>{t('result.schedule')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer>
              <ComposedChart data={schedule} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
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
                  dataKey="value"
                  name={t('result.direct')}
                  fill="var(--chart-3)"
                  radius={[4, 4, 0, 0]}
                  animationDuration={MS}
                />
                <Line
                  dataKey="accumulated"
                  name={t('result.cumulative')}
                  stroke="var(--chart-1)"
                  strokeWidth={2.5}
                  dot={false}
                  animationDuration={MS}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>{t('result.analytic')}</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHead>
              <tr>
                <TableHeaderCell>{t('quantities.desc')}</TableHeaderCell>
                <TableHeaderCell className="text-right">{t('quantities.total')}</TableHeaderCell>
                <TableHeaderCell className="text-right">{t('result.share')}</TableHeaderCell>
                <TableHeaderCell>{t('result.class')}</TableHeaderCell>
              </tr>
            </TableHead>
            <TableBody>
              {abc.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="max-w-80 truncate">{r.description}</TableCell>
                  <TableCell className="text-right">{formatMoney(r.totalCents)}</TableCell>
                  <TableCell className="text-right">{formatPercent(r.share, 1)}</TableCell>
                  <TableCell>
                    <StatusBadge
                      tone={r.klass === 'A' ? 'danger' : r.klass === 'B' ? 'warning' : 'neutral'}
                      label={r.klass}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
