import { addDays, differenceInCalendarDays, format, parseISO } from 'date-fns';
import type { EapItem, ScheduleActivity } from '@/core/entities';

export interface CurvePoint {
  date: string;
  planned: number;
  actual?: number;
}
export interface PeriodPoint {
  label: string;
  date: string;
  plannedCents: number;
  accumulatedCents: number;
}

interface Weighted {
  cents: number;
  start: Date;
  end: Date;
  baselineStart: Date;
  baselineEnd: Date;
  progress: number;
}

/** Valor de cada atividade = valor contratado do item da EAP dividido entre as atividades que o executam. */
function weigh(activities: ScheduleActivity[], eap: EapItem[]): Weighted[] {
  const leaves = new Map(eap.map((e) => [e.id, e]));
  const count = new Map<string, number>();
  for (const a of activities)
    if (a.eapItemId) count.set(a.eapItemId, (count.get(a.eapItemId) ?? 0) + 1);
  return activities
    .filter((a) => a.eapItemId && leaves.has(a.eapItemId))
    .map((a) => ({
      cents:
        (leaves.get(a.eapItemId ?? '')?.contractedCents ?? 0) / (count.get(a.eapItemId ?? '') ?? 1),
      start: parseISO(a.startDate),
      end: parseISO(a.endDate),
      baselineStart: parseISO(a.baselineStart),
      baselineEnd: parseISO(a.baselineEnd),
      progress: a.progressPct,
    }));
}

const fraction = (day: Date, start: Date, end: Date) => {
  const span = Math.max(differenceInCalendarDays(end, start), 1);
  return Math.min(Math.max(differenceInCalendarDays(day, start) / span, 0), 1);
};

/** Curva S: previsto (linha de base) e realizado acumulados, em % do contrato, semana a semana. */
export function sCurve(
  activities: ScheduleActivity[],
  eap: EapItem[],
  today: Date,
  stepDays = 7,
): CurvePoint[] {
  const items = weigh(activities, eap);
  const total = items.reduce((sum, i) => sum + i.cents, 0);
  if (total === 0) return [];
  const first = new Date(Math.min(...items.map((i) => i.baselineStart.getTime())));
  const last = new Date(Math.max(...items.map((i) => i.baselineEnd.getTime())));
  const points: CurvePoint[] = [];
  for (let day = first; day <= addDays(last, stepDays); day = addDays(day, stepDays)) {
    const planned = items.reduce(
      (sum, i) => sum + i.cents * fraction(day, i.baselineStart, i.baselineEnd),
      0,
    );
    const point: CurvePoint = {
      date: format(day, 'yyyy-MM-dd'),
      planned: Math.round((planned / total) * 1000) / 10,
    };
    if (day <= today) {
      const actual = items.reduce(
        (sum, i) => sum + i.cents * (i.progress / 100) * fraction(day, i.start, today),
        0,
      );
      point.actual = Math.round((actual / total) * 1000) / 10;
    }
    points.push(point);
  }
  return points;
}

/** Físico-financeiro: desembolso previsto por mês e acumulado (R$). */
export function physicalFinancial(activities: ScheduleActivity[], eap: EapItem[]): PeriodPoint[] {
  const items = weigh(activities, eap);
  if (items.length === 0) return [];
  const first = new Date(Math.min(...items.map((i) => i.baselineStart.getTime())));
  const last = new Date(Math.max(...items.map((i) => i.baselineEnd.getTime())));
  const out: PeriodPoint[] = [];
  let accumulated = 0;
  for (
    let month = new Date(first.getFullYear(), first.getMonth(), 1);
    month <= last;
    month = new Date(month.getFullYear(), month.getMonth() + 1, 1)
  ) {
    const next = new Date(month.getFullYear(), month.getMonth() + 1, 1);
    const value = items.reduce(
      (sum, i) =>
        sum +
        i.cents *
          (fraction(next, i.baselineStart, i.baselineEnd) -
            fraction(month, i.baselineStart, i.baselineEnd)),
      0,
    );
    accumulated += value;
    out.push({
      label: format(month, 'MMM/yy'),
      date: format(month, 'yyyy-MM-dd'),
      plannedCents: Math.round(value),
      accumulatedCents: Math.round(accumulated),
    });
  }
  return out;
}
