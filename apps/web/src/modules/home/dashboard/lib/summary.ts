import type { Obra } from '@/core/entities';

export interface Portfolio {
  contractedCents: number;
  progress: number;
  headcount: number;
  active: number;
  gapPp: number;
}

/** Totais da carteira: o avanço médio é ponderado pelo valor contratado das obras em execução. */
export function portfolio(obras: Obra[]): Portfolio {
  const running = obras.filter((o) => o.status === 'in_progress');
  const weight = running.reduce((sum, o) => sum + o.contractValueCents, 0) || 1;
  const progress =
    running.reduce((sum, o) => sum + o.actualPhysicalPct * o.contractValueCents, 0) / weight;
  const planned =
    running.reduce((sum, o) => sum + o.plannedPhysicalPct * o.contractValueCents, 0) / weight;
  return {
    contractedCents: obras.reduce((sum, o) => sum + o.contractValueCents, 0),
    progress,
    headcount: obras.reduce((sum, o) => sum + o.headcount, 0),
    active: running.length,
    gapPp: Math.max(planned - progress, 0),
  };
}

export function greetingKey(date: Date): 'morning' | 'afternoon' | 'night' {
  const hour = date.getHours();
  if (hour < 12) return 'morning';
  return hour < 18 ? 'afternoon' : 'night';
}
