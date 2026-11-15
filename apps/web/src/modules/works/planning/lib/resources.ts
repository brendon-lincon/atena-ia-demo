import { addDays, format, parseISO, startOfWeek } from 'date-fns';
import type { Allocation, Employee } from '@/core/entities';

export interface WeekLoad {
  label: string;
  start: string;
  byRole: Record<string, number>;
  demand: number;
  capacity: number;
  conflict: boolean;
}

export interface Conflict {
  week: string;
  role: string;
  employees: string[];
  obras: string[];
  keep: number;
  move: number;
}

/**
 * Carga semanal por função. A demanda conta cada alocação; a capacidade conta cada pessoa uma vez.
 * Conflito = a mesma pessoa em mais de uma obra na mesma semana (demanda maior que a capacidade).
 */
export function weeklyLoad(allocations: Allocation[], weeks: number, from: Date): WeekLoad[] {
  const result: WeekLoad[] = [];
  for (let i = 0; i < weeks; i++) {
    const start = startOfWeek(addDays(from, i * 7), { weekStartsOn: 1 });
    const end = addDays(start, 6);
    const active = allocations.filter(
      (a) => parseISO(a.startDate) <= end && parseISO(a.endDate) >= start,
    );
    const byRole: Record<string, number> = {};
    for (const a of active) byRole[a.role] = (byRole[a.role] ?? 0) + 1;
    const capacity = new Set(active.map((a) => a.employeeId)).size;
    result.push({
      label: format(start, 'dd/MM'),
      start: format(start, 'yyyy-MM-dd'),
      byRole,
      demand: active.length,
      capacity,
      conflict: active.length > capacity,
    });
  }
  return result;
}

/** Conflitos da semana, com a sugestão de quantos ficam e quantos se deslocam. */
export function conflicts(
  allocations: Allocation[],
  employees: Employee[],
  weekStart: string,
): Conflict[] {
  const start = parseISO(weekStart);
  const end = addDays(start, 6);
  const active = allocations.filter(
    (a) => parseISO(a.startDate) <= end && parseISO(a.endDate) >= start,
  );
  const byEmployee = new Map<string, Allocation[]>();
  for (const a of active)
    byEmployee.set(a.employeeId, [...(byEmployee.get(a.employeeId) ?? []), a]);
  const doubled = [...byEmployee.entries()].filter(
    ([, list]) => new Set(list.map((a) => a.obraId)).size > 1,
  );
  const byRole = new Map<string, string[]>();
  for (const [employeeId, list] of doubled) {
    const role = list[0]?.role ?? '';
    byRole.set(role, [...(byRole.get(role) ?? []), employeeId]);
  }
  return [...byRole.entries()].map(([role, ids]) => {
    const obras = [
      ...new Set(active.filter((a) => ids.includes(a.employeeId)).map((a) => a.obraId)),
    ];
    const keep = Math.ceil((ids.length * 3) / 5);
    return {
      week: weekStart,
      role,
      employees: ids.map((id) => employees.find((e) => e.id === id)?.name ?? id),
      obras,
      keep,
      move: ids.length - keep,
    };
  });
}
