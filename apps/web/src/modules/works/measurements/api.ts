import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { defineResource } from '@/core/api/resource';
import { useList } from '@/core/api/hooks';
import { measurements } from '@/core/entities';

const itemSchema = z.object({
  id: z.string(),
  measurementId: z.string(),
  eapItemId: z.string(),
  description: z.string(),
  unit: z.string(),
  contractedQty: z.number(),
  previousQty: z.number(),
  periodQty: z.number(),
  accumulatedQty: z.number(),
  balanceQty: z.number(),
  unitPriceCents: z.number(),
  periodCents: z.number(),
  photoIds: z.array(z.string()),
  diaryEntryIds: z.array(z.string()),
});
export type MeasurementItem = z.infer<typeof itemSchema>;
const measurementItems = defineResource('measurement-items', itemSchema);
const extendedSchema = z.object({
  id: z.string(),
  obraId: z.string(),
  number: z.number(),
  periodStart: z.string(),
  periodEnd: z.string(),
  status: z.string(),
  amountCents: z.number(),
  accumulatedCents: z.number(),
  retentionPct: z.number(),
  retentionCents: z.number(),
  netCents: z.number(),
});
export type MeasurementFull = z.infer<typeof extendedSchema>;
const measurementsFull = defineResource('measurements', extendedSchema);

export function useMeasurements(obraId?: string) {
  return useList(measurementsFull, {
    filter: obraId ? { obraId } : undefined,
    sort: '-periodEnd',
    pageSize: 100,
  });
}
export function useMeasurementItems(measurementId?: string) {
  return useList(
    measurementItems,
    { filter: { measurementId: measurementId ?? '' }, pageSize: 200 },
    { enabled: Boolean(measurementId) },
  );
}

/** Envia a medição: emite ao contratante (a conta a receber nasce do evento no módulo dono). */
export function useSendMeasurement() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => measurements.update(id, { status: 'issued' }),
    onSuccess: () => client.invalidateQueries(),
  });
}
