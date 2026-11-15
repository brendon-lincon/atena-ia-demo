import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { endpoints, jobSchema, type Job } from '@/core/api/endpoints';
import { useRealtimeEvent } from '@/core/realtime/hooks';

const POLL_MS = 700;

/** Acompanha uma tarefa demorada: canal em tempo real, com consulta periódica como reserva. */
export function useJob(id: string | undefined) {
  const client = useQueryClient();
  useRealtimeEvent('job', (data) => {
    const parsed = jobSchema.safeParse(data);
    if (parsed.success) client.setQueryData(['job', parsed.data.id], parsed.data);
  });
  return useQuery({
    queryKey: ['job', id],
    queryFn: () => endpoints.job(id ?? ''),
    enabled: Boolean(id),
    refetchInterval: (query) => (query.state.data?.status === 'done' ? false : POLL_MS),
  });
}

export function useStartJob() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (type: string) => endpoints.startJob(type),
    onSuccess: (job: Job) => client.setQueryData(['job', job.id], job),
  });
}
