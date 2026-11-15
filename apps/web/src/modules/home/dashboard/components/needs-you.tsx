import { ArrowRight, CalendarClock, ClipboardCheck, Send } from 'lucide-react';
import { Link } from 'react-router';
import type { ReviewItem } from '@/core/entities';
import { Cascade, CascadeItem } from '@/design/patterns/cascade';
import { ConfidenceChip } from '@/design/patterns/confidence-chip';
import { Button } from '@/design/ui/button';
import { t } from '@/modules/home/dashboard/i18n';

interface Card {
  id: string;
  title: string;
  hint: string;
  action: string;
  to: string;
  icon: typeof Send;
  confidence?: number;
}

/** Faixa "Precisa de você": cartões com ação direta que abrem a Central de revisão. */
export function NeedsYou({ items }: { items: ReviewItem[] }) {
  const exams = items.filter((i) => i.kind === 'exam_renewal');
  const cards: Card[] = items
    .filter((i) => i.kind !== 'exam_renewal')
    .map((i) => ({
      id: i.id,
      title: i.title,
      hint: i.suggestedValue,
      action: i.kind === 'measurement_send' ? t('needsYou.send') : t('needsYou.review'),
      to: `/review?item=${i.id}`,
      icon: i.kind === 'measurement_send' ? Send : ClipboardCheck,
      confidence: i.kind === 'quantity_takeoff' ? i.confidence : undefined,
    }));
  if (exams.length > 0)
    cards.push({
      id: 'exams',
      title: t('needsYou.exams', { count: exams.length }),
      hint: t('needsYou.examsHint'),
      action: t('needsYou.schedule'),
      to: `/review?item=${exams[0]?.id ?? ''}`,
      icon: CalendarClock,
    });
  return (
    <Cascade className="grid gap-3 md:grid-cols-3">
      {cards.map((c) => (
        <CascadeItem key={c.id}>
          <div className="surface-card flex h-full flex-col gap-3 border-l-4 border-l-primary p-4">
            <div className="flex items-start gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-primary-soft text-primary">
                <c.icon className="size-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-base leading-snug font-semibold">{c.title}</p>
                <p className="line-clamp-2 text-sm text-muted-foreground">{c.hint}</p>
              </div>
              {c.confidence !== undefined && <ConfidenceChip value={c.confidence} />}
            </div>
            <Button asChild size="sm" className="mt-auto self-start">
              <Link to={c.to}>
                {c.action} <ArrowRight />
              </Link>
            </Button>
          </div>
        </CascadeItem>
      ))}
    </Cascade>
  );
}
