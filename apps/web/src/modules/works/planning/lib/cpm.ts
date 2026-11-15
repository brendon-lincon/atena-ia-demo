import { differenceInCalendarDays, parseISO } from 'date-fns';
import type { ScheduleActivity } from '@/core/entities';

const DAY = (iso: string) => differenceInCalendarDays(parseISO(iso), new Date(2000, 0, 1));

export interface CriticalResult {
  critical: Set<string>;
  floatDays: Map<string, number>;
  finish: number;
}

/**
 * Caminho crítico sobre as datas programadas: a folga total de cada atividade é o quanto o término pode
 * escorregar sem empurrar o fim do projeto, respeitando as relações FS, SS, FF e SF (com defasagem).
 */
export function criticalPath(activities: ScheduleActivity[]): CriticalResult {
  const byId = new Map(activities.map((a) => [a.id, a]));
  const successors = new Map<
    string,
    { id: string; type: 'FS' | 'SS' | 'FF' | 'SF'; lag: number }[]
  >();
  for (const a of activities) {
    for (const p of a.predecessors) {
      if (byId.has(p.activityId))
        successors.set(p.activityId, [
          ...(successors.get(p.activityId) ?? []),
          { id: a.id, type: p.type, lag: p.lagDays },
        ]);
    }
  }
  const finish = Math.max(...activities.map((a) => DAY(a.endDate)), 0);
  const lateFinish = new Map<string, number>();
  const visiting = new Set<string>();
  const resolve = (id: string): number => {
    const cached = lateFinish.get(id);
    if (cached !== undefined) return cached;
    const activity = byId.get(id);
    if (!activity || visiting.has(id)) return finish;
    visiting.add(id);
    const duration = DAY(activity.endDate) - DAY(activity.startDate);
    let limit = finish;
    for (const s of successors.get(id) ?? []) {
      const succLF = resolve(s.id);
      const succ = byId.get(s.id);
      const succLS = succLF - (succ ? DAY(succ.endDate) - DAY(succ.startDate) : 0);
      if (s.type === 'FS') limit = Math.min(limit, succLS - s.lag);
      else if (s.type === 'FF') limit = Math.min(limit, succLF - s.lag);
      else if (s.type === 'SS') limit = Math.min(limit, succLS - s.lag + duration);
      else limit = Math.min(limit, succLF - s.lag + duration);
    }
    visiting.delete(id);
    lateFinish.set(id, limit);
    return limit;
  };
  const floatDays = new Map<string, number>();
  const critical = new Set<string>();
  for (const a of activities) {
    const slack = resolve(a.id) - DAY(a.endDate);
    floatDays.set(a.id, slack);
    if (slack <= 0 && a.progressPct < 100) critical.add(a.id);
  }
  return { critical, floatDays, finish };
}
