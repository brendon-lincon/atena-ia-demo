import type { Obra } from '@/core/entities';

export type Light = 'green' | 'yellow' | 'red' | 'gray';

const SCHEDULE_YELLOW_PP = 2;
const SCHEDULE_RED_PP = 5;
const COST_YELLOW_PCT = 0.5;
const COST_RED_PCT = 3;

/** Semáforo de prazo: diferença entre o avanço real e o previsto, em pontos percentuais. */
export function scheduleLight(
  obra: Pick<Obra, 'actualPhysicalPct' | 'plannedPhysicalPct' | 'status'>,
): Light {
  if (obra.status === 'mobilizing') return 'gray';
  const gap = obra.plannedPhysicalPct - obra.actualPhysicalPct;
  if (gap > SCHEDULE_RED_PP) return 'red';
  return gap > SCHEDULE_YELLOW_PP ? 'yellow' : 'green';
}

/** Semáforo de custo: desvio do realizado sobre o orçado até a data. */
export function costLight(obra: Pick<Obra, 'costVariancePct'>): Light {
  if (obra.costVariancePct === null) return 'gray';
  if (obra.costVariancePct > COST_RED_PCT) return 'red';
  return obra.costVariancePct > COST_YELLOW_PCT ? 'yellow' : 'green';
}

export const LIGHT_CLASS: Record<Light, string> = {
  green: 'bg-success',
  yellow: 'bg-warning',
  red: 'bg-danger',
  gray: 'bg-border',
};
