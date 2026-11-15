import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import type { Obra } from '@/core/entities';
import { formatDateTime } from '@/core/format';
import { Cascade, CascadeItem } from '@/design/patterns/cascade';
import { EmptyState } from '@/design/patterns/empty-state';
import { SkeletonRows } from '@/design/patterns/skeleton';
import { Button } from '@/design/ui/button';
import { Select } from '@/design/ui/form';
import { Dialog, DialogContent, DialogTitle } from '@/design/ui/overlay';
import { useWorkData } from '@/modules/works/works/api';
import { t } from '@/modules/works/works/i18n';

/** Galeria por frente e data, com visualizador que mostra os dados da foto. */
export function PhotosTab({ obra }: { obra: Obra }) {
  const { photos, eap } = useWorkData(obra);
  const [front, setFront] = useState('');
  const [index, setIndex] = useState<number | null>(null);
  if (photos.isLoading) return <SkeletonRows />;
  const items = eap.data?.data ?? [];
  const parentOf = (eapItemId: string | null | undefined) =>
    items.find((i) => i.id === eapItemId)?.parentId ?? eapItemId;
  const list = (photos.data?.data ?? []).filter((p) => !front || parentOf(p.eapItemId) === front);
  const fronts = items.filter((i) => i.level === 'front');
  if ((photos.data?.data ?? []).length === 0) return <EmptyState title={t('photos.emptyTitle')} />;
  const current = index === null ? undefined : list[index];
  const frontName = (id: string | null | undefined) =>
    items.find((i) => i.id === parentOf(id))?.name ?? t('photos.general');
  return (
    <div className="space-y-4">
      <Select
        value={front}
        onChange={(event) => setFront(event.target.value)}
        aria-label={t('photos.front')}
        className="max-w-xs"
      >
        <option value="">{t('photos.allFronts')}</option>
        {fronts.map((f) => (
          <option key={f.id} value={f.id}>
            {f.name}
          </option>
        ))}
      </Select>
      <Cascade className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {list.map((photo, i) => (
          <CascadeItem key={photo.id}>
            <button
              type="button"
              aria-label={`${t('photos.open')}: ${photo.caption}`}
              onClick={() => setIndex(i)}
              className="group block w-full overflow-hidden rounded-lg border border-border text-left"
            >
              <img
                src={`/demo/photos/${photo.file}`}
                alt={photo.caption}
                loading="lazy"
                className="aspect-[4/3] w-full object-cover transition-transform duration-[var(--duration-emphasis)] group-hover:scale-105"
              />
            </button>
          </CascadeItem>
        ))}
      </Cascade>
      <Dialog open={current !== undefined} onOpenChange={(open) => !open && setIndex(null)}>
        <DialogContent className="max-w-3xl">
          <DialogTitle>{current?.caption}</DialogTitle>
          {current && (
            <img
              src={`/demo/photos/${current.file}`}
              alt={current.caption}
              className="w-full rounded-md"
            />
          )}
          <div className="flex items-center justify-between gap-3 text-sm text-muted-foreground">
            <span>
              {frontName(current?.eapItemId)} · {t('photos.takenAt')}{' '}
              {current && formatDateTime(current.takenAt)}
            </span>
            <span className="flex gap-1">
              <Button
                variant="outline"
                size="icon-sm"
                aria-label={t('photos.previous')}
                disabled={!index}
                onClick={() => setIndex((i) => (i ?? 0) - 1)}
              >
                <ChevronLeft />
              </Button>
              <Button
                variant="outline"
                size="icon-sm"
                aria-label={t('photos.next')}
                disabled={index === null || index >= list.length - 1}
                onClick={() => setIndex((i) => (i ?? 0) + 1)}
              >
                <ChevronRight />
              </Button>
            </span>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
