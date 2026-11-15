import { useState } from 'react';
import { differenceInCalendarDays, parseISO } from 'date-fns';
import type { Obra } from '@/core/entities';
import { formatDate, formatMoney } from '@/core/format';
import { AnimatedNumber } from '@/design/patterns/animated-number';
import { Label, Slider } from '@/design/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/design/ui/misc';
import { runScenario } from '@/modules/works/planning/lib/scenarios';
import { t } from '@/modules/works/planning/i18n';

const LABOR_SHARE = 0.3; // fatia de mão de obra no custo restante

/** Cenários: o que acontece com término e custo ao reforçar a equipe, usar hora extra ou atrasar um insumo. */
export function ScenariosTab({ obra }: { obra: Obra }) {
  const [now] = useState(() => new Date());
  const [boost, setBoost] = useState(20);
  const [overtime, setOvertime] = useState(0);
  const [delay, setDelay] = useState(0);
  const remainingDays = Math.max(differenceInCalendarDays(parseISO(obra.endDate), now), 1);
  const remainingLabor = Math.round(
    obra.contractValueCents * (1 - obra.actualPhysicalPct / 100) * LABOR_SHARE,
  );
  const base = runScenario(
    {
      remainingDays,
      remainingLaborCents: remainingLabor,
      crewBoostPct: 0,
      overtimePct: 0,
      delayDays: 0,
    },
    now,
  );
  const scenario = runScenario(
    {
      remainingDays,
      remainingLaborCents: remainingLabor,
      crewBoostPct: boost,
      overtimePct: overtime,
      delayDays: delay,
    },
    now,
  );
  const control = (
    label: string,
    value: number,
    set: (n: number) => void,
    max: number,
    suffix: string,
  ) => (
    <div className="space-y-1.5">
      <Label>
        {label}:{' '}
        <span className="tnum font-semibold">
          {value}
          {suffix}
        </span>
      </Label>
      <Slider
        value={[value]}
        max={max}
        onValueChange={(v) => set(v[0] ?? value)}
        aria-label={label}
      />
    </div>
  );
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>{t('scenarios.title')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <p className="text-sm text-muted-foreground">{t('scenarios.hint')}</p>
          {control(t('scenarios.boost'), boost, setBoost, 50, '%')}
          {control(t('scenarios.overtime'), overtime, setOvertime, 30, '%')}
          {control(t('scenarios.delay'), delay, setDelay, 20, '')}
        </CardContent>
      </Card>
      <div className="grid gap-4 sm:grid-cols-2">
        {[
          { title: t('scenarios.base'), r: base },
          { title: t('scenarios.scenario'), r: scenario },
        ].map(({ title, r }) => (
          <Card key={title} className="p-5">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="mt-3 text-sm text-muted-foreground">{t('scenarios.days')}</p>
            <AnimatedNumber
              value={r.days}
              format={(n) => String(Math.round(n))}
              className="text-3xl font-semibold tnum"
            />
            <p className="mt-3 text-sm text-muted-foreground">{t('scenarios.end')}</p>
            <p className="text-lg font-semibold tnum">{formatDate(r.endDate)}</p>
            <p className="mt-3 text-sm text-muted-foreground">{t('scenarios.extraCost')}</p>
            <p className="text-lg font-semibold tnum">
              {formatMoney(r.extraCostCents, { compact: true })}
            </p>
          </Card>
        ))}
      </div>
    </div>
  );
}
