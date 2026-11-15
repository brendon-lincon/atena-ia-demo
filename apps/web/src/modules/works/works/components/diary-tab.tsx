import { CloudRain, Sun, Users } from 'lucide-react';
import type { Obra } from '@/core/entities';
import { formatDate, formatMoney, formatNumber, formatWeekday } from '@/core/format';
import { Cascade, CascadeItem } from '@/design/patterns/cascade';
import { EmptyState } from '@/design/patterns/empty-state';
import { SkeletonRows } from '@/design/patterns/skeleton';
import { Badge } from '@/design/ui/misc';
import { useWorkData } from '@/modules/works/works/api';
import { t } from '@/modules/works/works/i18n';

const MAX_THUMBS = 4;

/** Diário de obra: uma linha do tempo por dia, com clima, efetivo, serviços, ocorrências, fotos e notas. */
export function DiaryTab({ obra }: { obra: Obra }) {
  const { diary, photos } = useWorkData(obra);
  if (diary.isLoading) return <SkeletonRows />;
  const entries = diary.data?.data ?? [];
  if (entries.length === 0)
    return <EmptyState title={t('diary.emptyTitle')} description={t('diary.emptyDescription')} />;
  const files = new Map((photos.data?.data ?? []).map((p) => [p.id, p]));
  return (
    <Cascade className="relative space-y-4 border-l border-border pl-5">
      {entries.map((entry) => (
        <CascadeItem key={entry.id} className="relative">
          <span className="absolute top-5 -left-[27px] size-3 rounded-full border-2 border-surface bg-primary" />
          <article className="surface-card space-y-3 p-4">
            <header className="flex flex-wrap items-center gap-2">
              <h3 className="text-lg font-semibold tracking-tight first-letter:uppercase">
                {formatWeekday(entry.date)}, {formatDate(entry.date)}
              </h3>
              <Badge tone="info">
                {entry.weather.rainMm > 0 ? (
                  <CloudRain className="size-3.5" />
                ) : (
                  <Sun className="size-3.5" />
                )}
                {entry.weather.condition}, {entry.weather.tempC}°C
              </Badge>
              <Badge tone="neutral">
                <Users className="size-3.5" />
                {entry.headcountOwn + entry.headcountThird} ({entry.headcountOwn} {t('diary.own')},{' '}
                {entry.headcountThird} {t('diary.third')})
              </Badge>
              <Badge tone="neutral">
                {t('diary.dayCost')}: {formatMoney(entry.dayCostCents, { compact: true })}
              </Badge>
            </header>
            <p className="text-base">{entry.notes}</p>
            {entry.incidents && (
              <p className="rounded-md bg-warning-soft px-3 py-2 text-sm text-warning-text">
                {t('diary.incident')}: {entry.incidents}
              </p>
            )}
            <ul className="space-y-0.5 text-sm text-muted-foreground">
              {entry.services.map((s) => (
                <li key={s.eapItemId}>
                  {s.description}:{' '}
                  <span className="tnum">
                    {formatNumber(s.quantity, 1)} {s.unit}
                  </span>
                </li>
              ))}
            </ul>
            <div className="flex gap-2">
              {entry.photoIds.slice(0, MAX_THUMBS).map((id) => {
                const photo = files.get(id);
                return photo ? (
                  <img
                    key={id}
                    src={`/demo/photos/${photo.file}`}
                    alt={photo.caption}
                    loading="lazy"
                    className="h-16 w-24 rounded-md object-cover"
                  />
                ) : null;
              })}
              {entry.photoIds.length > MAX_THUMBS && (
                <span className="flex h-16 w-24 items-center justify-center rounded-md bg-muted text-sm">
                  +{entry.photoIds.length - MAX_THUMBS}
                </span>
              )}
            </div>
          </article>
        </CascadeItem>
      ))}
    </Cascade>
  );
}
