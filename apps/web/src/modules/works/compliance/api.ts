import { z } from 'zod';
import { defineResource } from '@/core/api/resource';
import { useList } from '@/core/api/hooks';

export const itemSchema = z.object({
  id: z.string(),
  obraId: z.string(),
  step: z.string(),
  stepOrder: z.number(),
  title: z.string(),
  agencyId: z.string(),
  status: z.enum(['not_started', 'in_progress', 'submitted', 'issued', 'expired']),
  protocol: z.string().nullable().optional(),
  validUntil: z.string().nullable().optional(),
  dueDate: z.string().nullable().optional(),
  regulation: z.string().optional(),
  notes: z.string().optional(),
});
export type ComplianceItem = z.infer<typeof itemSchema>;
const items = defineResource('compliance-items', itemSchema);

export function useCompliance(obraId?: string) {
  return useList(items, {
    filter: obraId ? { obraId } : undefined,
    sort: 'stepOrder',
    pageSize: 200,
  });
}
