import { CheckCheck } from 'lucide-react';
import { useEffect } from 'react';
import { Link, useSearchParams } from 'react-router';
import { useDirectory } from '@/core/directory/use-directory';
import type { ReviewItem } from '@/core/entities';
import { registry } from '@/core/module-registry/registry';
import { cn } from '@/design/cn';
import { ConfidenceChip } from '@/design/patterns/confidence-chip';
import { EmptyState } from '@/design/patterns/empty-state';
import { PageHeader } from '@/design/patterns/page-header';
import { ReviewPanel, type ReviewItemView } from '@/design/patterns/review-panel';
import { SkeletonRows } from '@/design/patterns/skeleton';
import type { SourceKind } from '@/design/patterns/source-tag';
import { Button } from '@/design/ui/button';
import { Badge } from '@/design/ui/misc';
import { useToasts } from '@/design/ui/toast';
import { useDecide, useReviewQueue } from '@/modules/home/review/api';
import { t } from '@/modules/home/review/i18n';

const SOURCE_KIND: Record<string, SourceKind> = {
  quantity_takeoff: 'file',
  measurement_send: 'file',
  exam_renewal: 'file',
  photo_classification: 'photo',
  invoice_classification: 'file',
  diary_extraction: 'audio',
  email_draft: 'email',
  document_draft: 'file',
  schedule_update: 'diary',
  price_update: 'file',
};

function view(item: ReviewItem): ReviewItemView {
  return {
    id: item.id,
    title: item.title,
    confidence: item.confidence,
    sourceKind: SOURCE_KIND[item.kind] ?? 'file',
    sourceLabel: item.source.label,
    suggested: item.suggestedValue,
  };
}

/** Central de revisão: fila à esquerda; à direita o item com a origem ao lado do valor sugerido. */
export default function ReviewPage() {
  const queue = useReviewQueue();
  const decide = useDecide();
  const dir = useDirectory();
  const push = useToasts((s) => s.push);
  const [params, setParams] = useSearchParams();
  const pending = (queue.data?.data ?? []).filter((i) => i.status === 'pending');
  const selectedId = params.get('item') ?? pending[0]?.id;
  const selected = pending.find((i) => i.id === selectedId) ?? pending[0];

  useEffect(() => {
    if (selected && params.get('item') !== selected.id)
      setParams({ item: selected.id }, { replace: true });
  }, [selected, params, setParams]);

  const finish = (
    item: ReviewItem,
    status: 'approved' | 'adjusted' | 'rejected',
    value: string,
  ) => {
    decide.mutate(
      { item, status, value },
      {
        onSuccess: () =>
          push(
            status === 'rejected'
              ? t('done.rejected')
              : item.kind === 'measurement_send'
                ? t('done.measurement')
                : item.kind === 'quantity_takeoff'
                  ? t('done.budget')
                  : item.kind === 'exam_renewal'
                    ? t('done.task')
                    : t('done.approved'),
          ),
        onError: () => push(t('failed')),
      },
    );
  };

  return (
    <div>
      <PageHeader title={t('title')} description={t('subtitle')} />
      {queue.isLoading ? (
        <SkeletonRows />
      ) : pending.length === 0 ? (
        <div className="surface-card">
          <EmptyState
            illustration="first-steps"
            title={t('allDone')}
            description={t('allDoneDescription')}
          />
        </div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-[340px_1fr]">
          <aside className="space-y-2" aria-label={t('queue')}>
            <p className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <CheckCheck className="size-4" />
              {t('pending', { count: pending.length })}
            </p>
            <ul className="space-y-2">
              {pending.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => setParams({ item: item.id }, { replace: true })}
                    className={cn(
                      'surface-card w-full space-y-1.5 p-3 text-left transition-shadow hover:shadow-md',
                      item.id === selected?.id && 'ring-2 ring-primary',
                    )}
                  >
                    <span className="flex items-center justify-between gap-2">
                      <Badge tone={item.needsYou ? 'warning' : 'neutral'}>
                        {item.needsYou
                          ? t('needsYou')
                          : t(`kinds.${item.kind as 'quantity_takeoff'}`)}
                      </Badge>
                      <ConfidenceChip value={item.confidence} />
                    </span>
                    <span className="block text-base leading-snug font-medium">{item.title}</span>
                    {item.obraId && (
                      <span className="block text-sm text-muted-foreground">
                        {dir.name(item.obraId)}
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </aside>
          <section className="space-y-3">
            {selected ? (
              <>
                <ReviewPanel
                  key={selected.id}
                  item={view(selected)}
                  sourcePreview={<span>{selected.source.preview}</span>}
                  onApprove={(value) =>
                    finish(
                      selected,
                      value === selected.suggestedValue ? 'approved' : 'adjusted',
                      value,
                    )
                  }
                  onReject={() => finish(selected, 'rejected', '')}
                />
                {registry.recordPath(selected.recordType, selected.recordId) && (
                  <Button asChild variant="outline">
                    <Link to={registry.recordPath(selected.recordType, selected.recordId) ?? '#'}>
                      {t('openRecord')}
                    </Link>
                  </Button>
                )}
              </>
            ) : (
              <EmptyState title={t('selectHint')} />
            )}
          </section>
        </div>
      )}
    </div>
  );
}
