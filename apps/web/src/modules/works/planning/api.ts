import { z } from 'zod';
import { useQuery } from '@tanstack/react-query';
import { defineResource } from '@/core/api/resource';
import { useList } from '@/core/api/hooks';
import { allocations, eapItems, employees, obras, scheduleActivities } from '@/core/entities';

const costSchema = z.object({
  id: z.string(),
  obraId: z.string(),
  category: z.string(),
  amountCents: z.number(),
  description: z.string(),
});
const costEntries = defineResource('cost-entries', costSchema);
const requestSchema = z.object({
  id: z.string(),
  obraId: z.string(),
  title: z.string(),
  items: z.array(z.object({ quantity: z.number(), unit: z.string() })),
});
const purchaseRequests = defineResource('purchase-requests', requestSchema);
const quoteSchema = z.object({
  id: z.string(),
  requestId: z.string(),
  totalCents: z.number(),
  status: z.string(),
});
const quotes = defineResource('quotes', quoteSchema);
const ALL = { pageSize: 500 };

export function usePlanningData(obraId?: string) {
  const filter = obraId ? { obraId } : undefined;
  return {
    obras: useList(obras, { pageSize: 50 }),
    activities: useList(scheduleActivities, { filter, ...ALL }),
    eap: useList(eapItems, { filter, ...ALL }),
    allocations: useList(allocations, ALL),
    employees: useList(employees, ALL),
  };
}

export function useMobilizationData() {
  const logistics = useQuery({
    queryKey: ['cost-entries', 'list', { category: 'logistics' }],
    queryFn: () => costEntries.list({ filter: { category: 'logistics' }, ...ALL }),
  });
  const requests = useQuery({
    queryKey: ['purchase-requests', 'list', 'all'],
    queryFn: () => purchaseRequests.list(ALL),
  });
  const offers = useQuery({ queryKey: ['quotes', 'list', 'all'], queryFn: () => quotes.list(ALL) });
  return { logistics, requests, offers };
}
