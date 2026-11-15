import { useMutation, useQueryClient } from '@tanstack/react-query';
import { defineResource } from '@/core/api/resource';
import { looseRecord } from '@/core/api/loose';
import { useList } from '@/core/api/hooks';
import { reviewItems, tasks, type ReviewItem } from '@/core/entities';

const budgets = defineResource('budgets', looseRecord);
const measurements = defineResource('measurements', looseRecord);

export function useReviewQueue() {
  return useList(reviewItems, { sort: 'priority', pageSize: 100 });
}

const today = () => new Date().toISOString().slice(0, 10);

/** Decide um item e dispara o efeito no registro de origem (o dono do dado continua sendo o outro módulo). */
export function useDecide() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async ({
      item,
      status,
      value,
    }: {
      item: ReviewItem;
      status: 'approved' | 'adjusted' | 'rejected';
      value: string;
    }) => {
      await reviewItems.update(item.id, {
        status,
        approvedValue: status === 'rejected' ? null : value,
      });
      if (status === 'rejected') return;
      if (item.kind === 'measurement_send')
        await measurements.update(item.recordId, { status: 'issued', issuedAt: today() });
      if (item.kind === 'quantity_takeoff')
        await budgets.update(item.recordId, { status: 'approved', approvedAt: today() });
      if (item.kind === 'exam_renewal')
        await tasks.create({
          title: item.title,
          status: 'todo',
          priority: 'high',
          origin: 'atena',
          obraId: item.obraId ?? null,
        });
    },
    onSuccess: () => client.invalidateQueries(),
  });
}
