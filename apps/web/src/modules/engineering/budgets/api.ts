import { z } from 'zod';
import { defineResource } from '@/core/api/resource';
import { looseRecord } from '@/core/api/loose';
import { useList, useRecord } from '@/core/api/hooks';

export const budgetSchema = z.object({
  id: z.string(),
  obraId: z.string().nullable().optional(),
  name: z.string(),
  level: z.enum(['cost_estimate', 'preliminary', 'analytic', 'synthetic']),
  status: z.enum(['draft', 'in_review', 'approved']),
  version: z.number(),
  baseDate: z.string(),
  baseRef: z.string(),
  bdiPct: z.number(),
  socialChargesPct: z.number(),
  directCostCents: z.number(),
  indirectCostCents: z.number(),
  indirects: z.array(z.object({ label: z.string(), cents: z.number() })),
  bdiCents: z.number(),
  totalCents: z.number(),
  crossCheck: z.array(
    z.object({
      title: z.string(),
      message: z.string(),
      suggestedQuantity: z.number(),
      unit: z.string(),
      compositionId: z.string(),
    }),
  ),
  sourceFileName: z.string().optional(),
});
export type Budget = z.infer<typeof budgetSchema>;
export const budgetsApi = defineResource('budgets', budgetSchema);

export const itemSchema = z.object({
  id: z.string(),
  budgetId: z.string(),
  code: z.string(),
  group: z.string(),
  description: z.string(),
  unit: z.string(),
  quantity: z.number(),
  unitCostCents: z.number(),
  totalCents: z.number(),
  compositionId: z.string(),
  confidence: z.number(),
  source: z.object({ fileName: z.string(), page: z.number() }),
  priceSource: z.string(),
  priceBaseDate: z.string(),
});
export type BudgetItem = z.infer<typeof itemSchema>;
const itemsApi = defineResource('budget-items', itemSchema);

export const compositionSchema = z.object({
  id: z.string(),
  code: z.string(),
  description: z.string(),
  unit: z.string(),
  inputs: z.array(
    z.object({
      kind: z.enum(['material', 'labor', 'equipment']),
      description: z.string(),
      unit: z.string(),
      coefficient: z.number(),
      unitCostCents: z.number(),
    }),
  ),
  unitCostCents: z.number(),
  source: z.string(),
  baseDate: z.string(),
});
export type Composition = z.infer<typeof compositionSchema>;
const compositionsApi = defineResource('compositions', compositionSchema);
export const proposalsApi = defineResource('proposals', looseRecord);
export const reviewApi = defineResource('review-items', looseRecord);
export const filesApi = defineResource('files', looseRecord);

export const useBudgets = () => useList(budgetsApi, { sort: '-createdAt', pageSize: 100 });
export const useBudget = (id?: string) => useRecord(budgetsApi, id);
export const useBudgetItems = (budgetId?: string) =>
  useList(
    itemsApi,
    { filter: { budgetId: budgetId ?? '' }, pageSize: 300 },
    { enabled: Boolean(budgetId) },
  );
export const useCompositions = () => useList(compositionsApi, { pageSize: 100 });
export const useProjectFiles = () => useList(filesApi, { filter: { kind: 'pdf' }, pageSize: 100 });
