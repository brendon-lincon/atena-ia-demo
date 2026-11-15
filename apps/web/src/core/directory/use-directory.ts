import { useQuery } from '@tanstack/react-query';
import { contacts, employees, obras, users } from '@/core/entities';

const ALL = { pageSize: 500 };

/** Rótulos de pessoas e obras por id (usuário, contato, colaborador, obra) para qualquer tela. */
export function useDirectory() {
  const query = useQuery({
    queryKey: ['directory'],
    staleTime: 60_000,
    queryFn: async () => {
      const [o, c, e, u] = await Promise.all([
        obras.list(ALL),
        contacts.list(ALL),
        employees.list(ALL),
        users.list(ALL),
      ]);
      const names = new Map<string, string>();
      for (const list of [o.data, c.data, e.data, u.data])
        for (const row of list) names.set(row.id, row.name);
      return { names, obras: o.data, contacts: c.data, employees: e.data, users: u.data };
    },
  });
  return {
    ready: query.isSuccess,
    name: (id: string | null | undefined): string => (id ? (query.data?.names.get(id) ?? '') : ''),
    obras: query.data?.obras ?? [],
    contacts: query.data?.contacts ?? [],
    employees: query.data?.employees ?? [],
    users: query.data?.users ?? [],
  };
}
