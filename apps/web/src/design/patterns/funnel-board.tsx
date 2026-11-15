import { motion } from 'motion/react';
import { useRef, useState, type ReactNode } from 'react';
import { createT } from '@/core/i18n/create-t';
import { messages } from '@/core/i18n/messages';
import { cn } from '@/design/cn';
import { duration, easing, spring } from '@/design/motion.generated';

const t = createT(messages);
export interface BoardStage {
  id: string;
  label: string;
  tone?: 'neutral' | 'primary' | 'success' | 'danger';
  total?: string;
}
export interface BoardCard {
  id: string;
  stageId: string;
}

const DOT = {
  neutral: 'bg-muted-foreground',
  primary: 'bg-primary',
  success: 'bg-success',
  danger: 'bg-danger',
} as const;

/** Quadro em colunas com arrastar e soltar (mola) e, opcionalmente, o funil de totais por etapa. */
export function FunnelBoard<T extends BoardCard>({
  stages,
  cards,
  render,
  onMove,
  funnel = false,
}: {
  stages: BoardStage[];
  cards: T[];
  render: (card: T) => ReactNode;
  onMove?: (card: T, stageId: string) => void;
  funnel?: boolean;
}) {
  const columns = useRef(new Map<string, HTMLElement>());
  const [over, setOver] = useState<string | null>(null);
  const stageAt = (x: number, y: number): string | undefined => {
    for (const [id, el] of columns.current) {
      const r = el.getBoundingClientRect();
      if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) return id;
    }
    return undefined;
  };
  const max = Math.max(...stages.map((s) => cards.filter((c) => c.stageId === s.id).length), 1);
  return (
    <div className="space-y-4">
      {funnel && (
        <div className="surface-card flex flex-col gap-1.5 p-4">
          {stages.map((stage, index) => {
            const count = cards.filter((c) => c.stageId === stage.id).length;
            return (
              <div key={stage.id} className="flex items-center gap-3 text-sm">
                <span className="w-28 shrink-0 truncate text-muted-foreground">{stage.label}</span>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.max((count / max) * 100, 6)}%` }}
                  transition={{ duration: duration.data, ease: easing, delay: index * 0.05 }}
                  className="flex h-7 items-center rounded-md bg-primary/85 px-2 text-xs font-medium text-primary-foreground"
                  style={{ opacity: 1 - index * 0.1 }}
                >
                  {t('funnel.count', { count })}
                </motion.div>
                {stage.total && <span className="tnum text-muted-foreground">{stage.total}</span>}
              </div>
            );
          })}
        </div>
      )}
      <div className="scrollbar-thin flex items-start gap-3 overflow-x-auto pb-2">
        {stages.map((stage) => (
          <section
            key={stage.id}
            ref={(el) => {
              if (el) columns.current.set(stage.id, el);
              else columns.current.delete(stage.id);
            }}
            className={cn(
              'w-72 shrink-0 rounded-lg bg-muted/60 p-2 transition-colors',
              over === stage.id && 'bg-primary-soft ring-2 ring-primary/40',
            )}
          >
            <header className="flex items-center gap-2 px-2 pt-1 pb-2 text-sm font-semibold">
              <span className={cn('size-2 rounded-full', DOT[stage.tone ?? 'neutral'])} />
              {stage.label}
              <span className="tnum ml-auto text-xs font-normal text-muted-foreground">
                {cards.filter((c) => c.stageId === stage.id).length}
              </span>
            </header>
            <div className="flex min-h-16 flex-col gap-2">
              {cards
                .filter((c) => c.stageId === stage.id)
                .map((card) => (
                  <motion.div
                    key={card.id}
                    layout
                    drag
                    dragSnapToOrigin
                    dragElastic={0.18}
                    dragTransition={{
                      bounceStiffness: spring.stiffness,
                      bounceDamping: spring.damping,
                    }}
                    whileDrag={{ scale: 1.03, zIndex: 20, boxShadow: 'var(--shadow-lg)' }}
                    whileTap={{ cursor: 'grabbing' }}
                    onDrag={(_, info) =>
                      setOver(
                        stageAt(info.point.x - window.scrollX, info.point.y - window.scrollY) ??
                          null,
                      )
                    }
                    onDragEnd={(_, info) => {
                      const target = stageAt(
                        info.point.x - window.scrollX,
                        info.point.y - window.scrollY,
                      );
                      setOver(null);
                      if (target && target !== card.stageId) onMove?.(card, target);
                    }}
                    className="surface-card cursor-grab p-3 touch-none"
                  >
                    {render(card)}
                  </motion.div>
                ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
