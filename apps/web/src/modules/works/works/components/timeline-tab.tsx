import { useMemo, useState } from 'react';
import { formatDate } from '@/core/format';
import { EmptyState } from '@/design/patterns/empty-state';
import { SkeletonCard } from '@/design/patterns/skeleton';
import { HorizontalTimeline } from '@/design/patterns/timeline';
import { Button } from '@/design/ui/button';
import { Dialog, DialogTitle, Sheet } from '@/design/ui/overlay';
import { useWorkData } from '@/modules/works/works/api';
import { buildTimeline } from '@/modules/works/works/lib/timeline';
import { t } from '@/modules/works/works/i18n';
import type { Obra } from '@/core/entities';

/** Linha do tempo da obra: fases, marcos, documentos, medições, desembolsos, efetivo e ocorrências num só eixo. */
export function TimelineTab({ obra }: { obra: Obra }) {
  const data = useWorkData(obra);
  const [selected, setSelected] = useState<string>();
  const loading = Object.values(data).some((q) => q.isLoading);
  const model = useMemo(
    () =>
      buildTimeline({
        eap: data.eap.data?.data ?? [],
        activities: data.activities.data?.data ?? [],
        measurements: data.measurements.data?.data ?? [],
        documents: data.documents.data?.data ?? [],
        payments: data.payments.data?.data ?? [],
        diary: data.diary.data?.data ?? [],
        incidents: data.incidents.data?.data ?? [],
      }),
    [
      data.eap.data,
      data.activities.data,
      data.measurements.data,
      data.documents.data,
      data.payments.data,
      data.diary.data,
      data.incidents.data,
    ],
  );
  if (loading) return <SkeletonCard />;
  if (model.items.length === 0) return <EmptyState title={t('timeline.emptyTitle')} />;
  const item = model.items.find((i) => i.id === selected);
  return (
    <>
      <HorizontalTimeline
        tracks={model.tracks}
        items={model.items}
        from={model.from}
        to={model.to}
        selectedId={selected}
        onSelect={(i) => setSelected(i.id)}
      />
      <Dialog open={Boolean(item)} onOpenChange={(open) => !open && setSelected(undefined)}>
        <Sheet>
          <DialogTitle>{item?.label}</DialogTitle>
          <dl className="space-y-3 text-base">
            <div>
              <dt className="text-sm text-muted-foreground">{t('timeline.side.kind')}</dt>
              <dd>{item?.kind}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">{t('timeline.side.date')}</dt>
              <dd className="tnum">
                {item && formatDate(item.start)}
                {item?.end && ` – ${formatDate(item.end)}`}
              </dd>
            </div>
            <div>
              <dd>{item?.detail}</dd>
            </div>
          </dl>
          <Button variant="outline" onClick={() => setSelected(undefined)}>
            {t('timeline.side.close')}
          </Button>
        </Sheet>
      </Dialog>
    </>
  );
}
