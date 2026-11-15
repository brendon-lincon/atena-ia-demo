import { createT } from '@/core/i18n/create-t';
import { messages } from '@/core/i18n/messages';
import { cn } from '@/design/cn';
import { Badge, type Tone } from '@/design/ui/misc';

const t = createT(messages);
export type Lifecycle = 'draft' | 'in_review' | 'approved' | 'issued' | 'cancelled' | 'archived';

const STYLE: Record<Lifecycle, { tone: Tone; dot: string; extra?: string }> = {
  draft: { tone: 'neutral', dot: 'bg-muted-foreground' },
  in_review: { tone: 'warning', dot: 'bg-warning' },
  approved: { tone: 'success', dot: 'bg-success' },
  issued: { tone: 'info', dot: 'bg-primary', extra: 'ring-1 ring-primary/40' },
  cancelled: { tone: 'danger', dot: 'bg-danger' },
  archived: { tone: 'neutral', dot: 'bg-border', extra: 'opacity-80' },
};

/** Ciclo de vida único: mesmas cores e rótulos em todos os módulos. */
export function StatusBadge({
  status,
  label,
  tone,
  className,
}: {
  status?: Lifecycle;
  label?: string;
  tone?: Tone;
  className?: string;
}) {
  const style = status ? STYLE[status] : { tone: tone ?? 'neutral', dot: 'bg-current' };
  return (
    <Badge
      tone={tone ?? style.tone}
      className={cn(status ? STYLE[status].extra : undefined, className)}
    >
      <span className={cn('size-1.5 rounded-full', style.dot)} aria-hidden />
      {label ?? (status ? t(`lifecycle.${status}`) : '')}
    </Badge>
  );
}
