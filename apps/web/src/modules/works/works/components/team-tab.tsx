import { AlertTriangle } from 'lucide-react';
import { useDirectory } from '@/core/directory/use-directory';
import type { Allocation, Obra } from '@/core/entities';
import { formatDate } from '@/core/format';
import { EmptyState } from '@/design/patterns/empty-state';
import { SkeletonRows } from '@/design/patterns/skeleton';
import { Tooltip } from '@/design/ui/overlay';
import { Avatar, Badge } from '@/design/ui/misc';
import { useAllAllocations, useWorkData } from '@/modules/works/works/api';
import { t } from '@/modules/works/works/i18n';

function overlaps(a: Allocation, b: Allocation): boolean {
  return a.startDate <= b.endDate && b.startDate <= a.endDate;
}

/** Equipe alocada à obra, por função, com aviso de colaborador também alocado em outra obra no mesmo período. */
export function TeamTab({ obra }: { obra: Obra }) {
  const { allocations } = useWorkData(obra);
  const all = useAllAllocations();
  const dir = useDirectory();
  if (allocations.isLoading) return <SkeletonRows />;
  const here = allocations.data?.data ?? [];
  if (here.length === 0) return <EmptyState title={t('team.emptyTitle')} />;
  const roles = new Map<string, Allocation[]>();
  for (const a of here) roles.set(a.role, [...(roles.get(a.role) ?? []), a]);
  const roleLabel = (id: string) => dir.employees.find((e) => e.role === id)?.roleLabel ?? id;
  const conflict = (a: Allocation) =>
    (all.data?.data ?? []).some(
      (o) => o.employeeId === a.employeeId && o.obraId !== a.obraId && overlaps(a, o),
    );
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {[...roles.entries()].map(([role, list]) => (
        <section key={role} className="surface-card p-4">
          <h3 className="mb-3 flex items-center justify-between text-lg font-semibold tracking-tight">
            {roleLabel(role)}
            <Badge tone="info">{t('team.people', { count: list.length })}</Badge>
          </h3>
          <ul className="space-y-2">
            {list.map((a) => (
              <li key={a.id} className="flex items-center gap-3 text-base">
                <Avatar
                  className="size-8 text-xs"
                  initials={dir
                    .name(a.employeeId)
                    .split(' ')
                    .map((p) => p[0])
                    .slice(0, 2)
                    .join('')}
                />
                <span className="min-w-0 flex-1">
                  <span className="block truncate">{dir.name(a.employeeId)}</span>
                  <span className="tnum block text-xs text-muted-foreground">
                    {formatDate(a.startDate)} – {formatDate(a.endDate)}{' '}
                    {a.teamName ? `· ${a.teamName}` : ''}
                  </span>
                </span>
                {conflict(a) && (
                  <Tooltip label={t('team.conflict')}>
                    <AlertTriangle className="size-4 text-warning" />
                  </Tooltip>
                )}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
