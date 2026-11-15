import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';
import { defineResource } from '@/core/api/resource';
import { useList, useRecord } from '@/core/api/hooks';
import {
  allocations,
  contracts,
  diaryEntries,
  documents,
  eapItems,
  incidents,
  measurements,
  obras,
  photos,
  scheduleActivities,
  type Obra,
} from '@/core/entities';

const paymentSchema = z.object({
  id: z.string(),
  obraId: z.string(),
  dueDate: z.string(),
  status: z.string(),
  amountCents: z.number(),
});
const receivables = defineResource('receivables', paymentSchema);
const ALL = { pageSize: 500 };

export function useWork(id: string | undefined) {
  return useRecord(obras, id);
}

/** Tudo o que as abas da obra consomem, com um único ponto de entrada por obra. */
export function useWorkData(obra: Obra | undefined) {
  const filter = { obraId: obra?.id ?? '' };
  const enabled = Boolean(obra);
  const params = { filter, ...ALL };
  return {
    eap: useList(eapItems, params, { enabled }),
    activities: useList(scheduleActivities, params, { enabled }),
    measurements: useList(measurements, params, { enabled }),
    documents: useList(documents, params, { enabled }),
    diary: useList(diaryEntries, { ...params, sort: '-date' }, { enabled }),
    incidents: useList(incidents, { ...params, sort: '-openedAt' }, { enabled }),
    photos: useList(photos, { ...params, sort: '-takenAt' }, { enabled }),
    allocations: useList(allocations, params, { enabled }),
    contracts: useList(contracts, params, { enabled }),
    payments: useQuery({
      queryKey: ['receivables', 'list', filter],
      queryFn: () => receivables.list(params),
      enabled,
    }),
  };
}

export function useAllAllocations() {
  return useList(allocations, ALL);
}
