import { AnimatePresence, motion } from 'motion/react';
import { Check, Pencil, X } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { createT } from '@/core/i18n/create-t';
import { messages } from '@/core/i18n/messages';
import { duration, easing } from '@/design/motion.generated';
import { Button } from '@/design/ui/button';
import { Input } from '@/design/ui/form';
import { ConfidenceChip } from './confidence-chip';
import { SourceTag, type SourceKind } from './source-tag';

const t = createT(messages);
export interface ReviewItemView {
  id: string;
  title: string;
  confidence: number;
  sourceKind: SourceKind;
  sourceLabel: string;
  suggested: string;
}

/** Item de revisão em formato único: origem à esquerda, valor sugerido à direita, decisão embaixo. */
export function ReviewPanel({
  item,
  sourcePreview,
  onApprove,
  onReject,
}: {
  item: ReviewItemView;
  sourcePreview: ReactNode;
  onApprove: (value: string) => void;
  onReject: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(item.suggested);
  const [settled, setSettled] = useState<'approved' | 'rejected' | null>(null);
  const decide = (kind: 'approved' | 'rejected') => {
    setSettled(kind);
    window.setTimeout(
      () => (kind === 'approved' ? onApprove(value) : onReject()),
      duration.emphasis * 1000 + 250,
    );
  };
  return (
    <div className="surface-card relative overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-4">
        <h3 className="text-lg font-semibold tracking-tight">{item.title}</h3>
        <ConfidenceChip value={item.confidence} />
      </div>
      <div className="grid gap-0 md:grid-cols-2 md:divide-x md:divide-border">
        <section className="space-y-3 p-4">
          <p className="text-sm font-medium text-muted-foreground">{t('review.source')}</p>
          <SourceTag kind={item.sourceKind}>{item.sourceLabel}</SourceTag>
          <div className="rounded-md bg-muted/70 p-4 text-base">{sourcePreview}</div>
        </section>
        <section className="space-y-3 p-4">
          <p className="text-sm font-medium text-muted-foreground">
            {editing ? t('review.approved') : t('review.suggested')}
          </p>
          {editing ? (
            <Input
              value={value}
              onChange={(event) => setValue(event.target.value)}
              aria-label={t('review.approved')}
              autoFocus
            />
          ) : (
            <p className="rounded-md bg-primary-soft p-4 text-lg font-medium">{value}</p>
          )}
        </section>
      </div>
      <div className="flex flex-wrap justify-end gap-2 border-t border-border p-4">
        <Button variant="ghost" onClick={() => decide('rejected')}>
          <X /> {t('review.reject')}
        </Button>
        <Button variant="outline" onClick={() => setEditing((current) => !current)}>
          <Pencil /> {t('review.adjust')}
        </Button>
        <Button onClick={() => decide('approved')}>
          <Check /> {t('review.approve')}
        </Button>
      </div>
      <AnimatePresence>
        {settled && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 flex items-center justify-center bg-surface/90"
          >
            <motion.div
              initial={{ scale: 0.4, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: duration.emphasis, ease: easing }}
              className="flex flex-col items-center gap-2"
            >
              <span
                className={
                  settled === 'approved'
                    ? 'flex size-14 items-center justify-center rounded-full bg-success text-primary-foreground'
                    : 'flex size-14 items-center justify-center rounded-full bg-muted text-muted-foreground'
                }
              >
                {settled === 'approved' ? (
                  <Check className="size-7" strokeWidth={3} />
                ) : (
                  <X className="size-7" />
                )}
              </span>
              <span className="text-lg font-semibold">{t('review.done')}</span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
