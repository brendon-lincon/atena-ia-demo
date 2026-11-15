import { useQuery } from '@tanstack/react-query';
import { endpoints, type ModuleState } from '@/core/api/endpoints';
import { useAuth } from '@/core/auth/auth-store';

export type Action = 'read' | 'create' | 'update' | 'delete' | 'approve' | 'export';

/** Módulos habilitados e ações permitidas ao usuário (vem de `GET /modules`). */
export function useModuleStates() {
  const status = useAuth((state) => state.status);
  return useQuery({
    queryKey: ['modules'],
    queryFn: () => endpoints.modules(),
    enabled: status === 'authenticated',
    staleTime: Infinity,
  });
}

export function permits(
  states: ModuleState[] | undefined,
  action: Action,
  resource: string,
): boolean {
  return (
    states?.some(
      (state) => state.id === resource && state.enabled && state.actions.includes(action),
    ) ?? false
  );
}

/** `can(ação, recurso)`: toda rota e toda ação passam por aqui. Na demonstração a resposta é sempre "sim". */
export function useCan(): (action: Action, resource: string) => boolean {
  const { data } = useModuleStates();
  return (action, resource) => permits(data, action, resource);
}
