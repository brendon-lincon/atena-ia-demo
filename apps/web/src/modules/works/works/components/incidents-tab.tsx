import type { Obra } from '@/core/entities';
import { formatDate, formatMoney } from '@/core/format';
import { Cascade, CascadeItem } from '@/design/patterns/cascade';
import { EmptyState } from '@/design/patterns/empty-state';
import { SkeletonRows } from '@/design/patterns/skeleton';
import { Badge, type Tone } from '@/design/ui/misc';
import { useWorkData } from '@/modules/works/works/api';
import { t } from '@/modules/works/works/i18n';

const SEVERITY: Record<string, Tone> = { low: 'neutral', medium: 'warning', high: 'danger' };
const STATUS: Record<string, Tone> = { open: 'danger', mitigating: 'warning', resolved: 'success' };

export function IncidentsTab({ obra }: { obra: Obra }) {
  const { incidents } = useWorkData(obra);
  if (incidents.isLoading) return <SkeletonRows />;
  const list = incidents.data?.data ?? [];
  if (list.length === 0)
    return (
      <EmptyState title={t('incidents.emptyTitle')} description={t('incidents.emptyDescription')} />
    );
  return (
    <Cascade className="grid gap-3 lg:grid-cols-2">
      {list.map((i) => (
        <CascadeItem key={i.id}>
          <article className="surface-card h-full space-y-2 p-4">
            <div className="flex flex-wrap gap-2">
              <Badge tone={STATUS[i.status] ?? 'neutral'}>
                {t(`incidents.status.${i.status}`)}
              </Badge>
              <Badge tone={SEVERITY[i.severity] ?? 'neutral'}>
                {t(`incidents.severity.${i.severity}`)}
              </Badge>
            </div>
            <h3 className="text-lg font-semibold tracking-tight">{i.title}</h3>
            <p className="text-sm text-muted-foreground">{i.description}</p>
            <p className="tnum text-sm">
              {t('incidents.openedAt')} {formatDate(i.openedAt)}
              {i.resolvedAt && ` · ${t('incidents.resolvedAt')} ${formatDate(i.resolvedAt)}`}
            </p>
            <p className="tnum text-sm text-muted-foreground">
              {t('incidents.impactDays', { days: i.impactDays })}
              {i.impactCostCents > 0 &&
                ` · ${t('incidents.impactCost', { value: formatMoney(i.impactCostCents) })}`}
            </p>
          </article>
        </CascadeItem>
      ))}
    </Cascade>
  );
}
