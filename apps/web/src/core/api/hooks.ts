import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
  type QueryKey,
} from '@tanstack/react-query';
import type { ListParams, Page, Resource } from './resource';

export const listKey = (name: string, params?: ListParams): QueryKey => [
  name,
  'list',
  params ?? {},
];
export const itemKey = (name: string, id: string): QueryKey => [name, 'item', id];

/** Lista com cache, esqueleto e nova busca em segundo plano. */
export function useList<T>(
  resource: Resource<T>,
  params?: ListParams,
  options: { enabled?: boolean } = {},
) {
  return useQuery({
    queryKey: listKey(resource.name, params),
    queryFn: () => resource.list(params),
    placeholderData: keepPreviousData,
    enabled: options.enabled ?? true,
  });
}

export function useRecord<T>(resource: Resource<T>, id: string | undefined) {
  return useQuery({
    queryKey: itemKey(resource.name, id ?? ''),
    queryFn: () => resource.get(id ?? ''),
    enabled: Boolean(id),
  });
}

export function useCreate<T>(resource: Resource<T>) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<T>) => resource.create(data),
    onSuccess: () => client.invalidateQueries({ queryKey: [resource.name] }),
  });
}

/** Atualização otimista: a interface muda na hora; se o servidor recusar, volta ao estado anterior. */
export function useUpdate<T extends { id: string }>(resource: Resource<T>) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<T> }) => resource.update(id, patch),
    onMutate: async ({ id, patch }) => {
      await client.cancelQueries({ queryKey: [resource.name] });
      const snapshots = client.getQueriesData<Page<T>>({ queryKey: [resource.name, 'list'] });
      client.setQueriesData<Page<T>>({ queryKey: [resource.name, 'list'] }, (page) =>
        page
          ? { ...page, data: page.data.map((row) => (row.id === id ? { ...row, ...patch } : row)) }
          : page,
      );
      return { snapshots };
    },
    onError: (_error, _vars, context) =>
      context?.snapshots.forEach(([key, data]) => client.setQueryData(key, data)),
    onSettled: () => client.invalidateQueries({ queryKey: [resource.name] }),
  });
}

export function useRemove<T>(resource: Resource<T>) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => resource.remove(id),
    onSuccess: () => client.invalidateQueries({ queryKey: [resource.name] }),
  });
}
