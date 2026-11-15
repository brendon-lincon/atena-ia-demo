import { useDirectory } from '@/core/directory/use-directory';
import type { Obra } from '@/core/entities';
import { formatDate, formatMoney } from '@/core/format';
import { EmptyState } from '@/design/patterns/empty-state';
import { SkeletonRows } from '@/design/patterns/skeleton';
import { Badge } from '@/design/ui/misc';
import { useWorkData } from '@/modules/works/works/api';
import { t } from '@/modules/works/works/i18n';

/** Terceiros e subempreiteiros da obra: contrato, escopo e valor. */
export function ThirdTab({ obra }: { obra: Obra }) {
  const { contracts, eap } = useWorkData(obra);
  const dir = useDirectory();
  if (contracts.isLoading) return <SkeletonRows />;
  const list = (contracts.data?.data ?? []).filter((c) => c.kind !== 'client');
  if (list.length === 0)
    return <EmptyState title={t('third.emptyTitle')} description={t('third.emptyDescription')} />;
  const scopeOf = (partyId: string) =>
    (eap.data?.data ?? []).find((e) => e.level === 'front' && e.contractorId === partyId)?.name ??
    '';
  return (
    <div className="grid gap-3 lg:grid-cols-2">
      {list.map((c) => (
        <article key={c.id} className="surface-card space-y-2 p-4">
          <Badge tone="info">
            {t(`third.contractKind.${c.kind as 'subcontract' | 'lease' | 'client'}`)}
          </Badge>
          <h3 className="text-lg font-semibold tracking-tight">{dir.name(c.partyId)}</h3>
          <p className="text-sm text-muted-foreground">{scopeOf(c.partyId) || c.title}</p>
          <dl className="tnum grid grid-cols-2 gap-2 text-sm">
            <div>
              <dt className="text-muted-foreground">{t('third.contracted')}</dt>
              <dd className="font-medium">{formatMoney(c.valueCents, { compact: true })}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">{t('third.period')}</dt>
              <dd>
                {formatDate(c.startDate)} – {formatDate(c.endDate)}
              </dd>
            </div>
          </dl>
        </article>
      ))}
    </div>
  );
}
