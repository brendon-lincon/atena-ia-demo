import { addDays, format } from 'date-fns';

export interface ScenarioInput {
  remainingDays: number;
  remainingLaborCents: number;
  crewBoostPct: number;
  overtimePct: number;
  delayDays: number;
}

export interface ScenarioResult {
  days: number;
  endDate: string;
  extraCostCents: number;
}

const BOOST_EFFICIENCY = 0.75; // reforçar a equipe não rende 100% (interferência entre frentes)
const OVERTIME_EFFICIENCY = 0.5;
const OVERTIME_PREMIUM = 0.5; // adicional de hora extra
const DELAY_COST_PER_DAY_PCT = 0.004; // custo de indiretos por dia de atraso, sobre a mão de obra restante

/** Efeito de reforço de equipe, hora extra e atraso de insumo sobre o término e o custo restante. */
export function runScenario(input: ScenarioInput, today: Date): ScenarioResult {
  const speed =
    1 +
    (input.crewBoostPct / 100) * BOOST_EFFICIENCY +
    (input.overtimePct / 100) * OVERTIME_EFFICIENCY;
  const days = Math.round(input.remainingDays / speed) + input.delayDays;
  const extraCostCents = Math.round(
    input.remainingLaborCents *
      ((input.crewBoostPct / 100) * 0.35 +
        (input.overtimePct / 100) * (1 + OVERTIME_PREMIUM) * 0.5 +
        input.delayDays * DELAY_COST_PER_DAY_PCT),
  );
  return { days, endDate: format(addDays(today, days), 'yyyy-MM-dd'), extraCostCents };
}
