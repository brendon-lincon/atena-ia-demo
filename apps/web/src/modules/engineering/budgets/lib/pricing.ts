import type { BudgetItem, Composition } from '@/modules/engineering/budgets/api';

export interface PricingItem {
  id: string;
  group: string;
  description: string;
  quantity: number;
  baseQuantity: number;
  baseTotalCents: number;
  laborShare: number;
}

export interface PricingParams {
  socialChargesPct: number;
  baseChargesPct: number;
  bdiPct: number;
  /** Percentual de cada indireto sobre o custo direto (fração: 0,045 = 4,5%). */
  indirectRates: number[];
  /** Total gravado do orçamento: diferenças de arredondamento (poucos centavos) não alteram o valor exibido. */
  anchorTotalCents?: number;
}

export interface PricingResult {
  items: { id: string; totalCents: number }[];
  directCents: number;
  chargeEffectCents: number;
  indirectCents: number[];
  indirectTotalCents: number;
  subtotalCents: number;
  bdiCents: number;
  totalCents: number;
}

const ROUNDING_TOLERANCE_CENTS = 5;

/** Parcela de mão de obra do custo unitário de uma composição. */
export function laborShareOf(composition: Composition | undefined): number {
  if (!composition || composition.unitCostCents === 0) return 0;
  const labor = composition.inputs
    .filter((i) => i.kind === 'labor')
    .reduce((sum, i) => sum + i.coefficient * i.unitCostCents, 0);
  return Math.min(labor / composition.unitCostCents, 1);
}

export function toPricingItems(items: BudgetItem[], compositions: Composition[]): PricingItem[] {
  return items.map((i) => ({
    id: i.id,
    group: i.group,
    description: i.description,
    quantity: i.quantity,
    baseQuantity: i.quantity,
    baseTotalCents: i.totalCents,
    laborShare: laborShareOf(compositions.find((c) => c.id === i.compositionId)),
  }));
}

/**
 * Preço de venda: custo direto (com o efeito dos encargos sociais sobre a mão de obra) + indiretos, vezes (1 + BDI).
 * Função pura: no sistema definitivo este cálculo passa ao servidor (ver pendencias.md).
 */
export function price(items: PricingItem[], params: PricingParams): PricingResult {
  const delta = (100 + params.socialChargesPct) / (100 + params.baseChargesPct) - 1;
  const rows = items.map((i) => {
    const base = i.baseQuantity === 0 ? 0 : (i.baseTotalCents * i.quantity) / i.baseQuantity;
    return { id: i.id, totalCents: Math.round(base * (1 + i.laborShare * delta)), baseCents: base };
  });
  const directCents = rows.reduce((sum, r) => sum + r.totalCents, 0);
  const chargeEffectCents = directCents - Math.round(rows.reduce((sum, r) => sum + r.baseCents, 0));
  const indirectCents = params.indirectRates.map((rate) => Math.round(directCents * rate));
  const indirectTotalCents = indirectCents.reduce((sum, v) => sum + v, 0);
  const subtotalCents = directCents + indirectTotalCents;
  const computed = Math.round(subtotalCents * (1 + params.bdiPct / 100));
  const totalCents =
    params.anchorTotalCents !== undefined &&
    Math.abs(computed - params.anchorTotalCents) <= ROUNDING_TOLERANCE_CENTS
      ? params.anchorTotalCents
      : computed;
  return {
    items: rows.map(({ id, totalCents: cents }) => ({ id, totalCents: cents })),
    directCents,
    chargeEffectCents,
    indirectCents,
    indirectTotalCents,
    subtotalCents,
    bdiCents: totalCents - subtotalCents,
    totalCents,
  };
}

export interface AbcRow {
  id: string;
  description: string;
  totalCents: number;
  share: number;
  cumulative: number;
  klass: 'A' | 'B' | 'C';
}

const CLASS_A = 80;
const CLASS_B = 95;

export function abcCurve(
  rows: { id: string; description: string; totalCents: number }[],
): AbcRow[] {
  const total = rows.reduce((sum, r) => sum + r.totalCents, 0) || 1;
  let acc = 0;
  return [...rows]
    .sort((a, b) => b.totalCents - a.totalCents)
    .map((r) => {
      const before = acc;
      acc += r.totalCents;
      const cumulative = (acc / total) * 100;
      return {
        ...r,
        share: (r.totalCents / total) * 100,
        cumulative,
        klass:
          (before / total) * 100 < CLASS_A ? 'A' : (before / total) * 100 < CLASS_B ? 'B' : 'C',
      };
    });
}

/** Cronograma físico-financeiro: cada grupo ocupa uma janela de períodos, em sequência com sobreposição. */
export function spreadByPeriod(
  groups: { name: string; cents: number }[],
  periods: number,
  window = 3,
): number[] {
  const out = Array.from({ length: periods }, () => 0);
  groups.forEach((g, index) => {
    const start =
      groups.length > 1 ? Math.round((index * (periods - window)) / (groups.length - 1)) : 0;
    for (let k = 0; k < window; k++) out[start + k] = (out[start + k] ?? 0) + g.cents / window;
  });
  return out.map((v) => Math.round(v));
}
