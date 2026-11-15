import { motion } from 'motion/react';
import { AlertCircle, Check } from 'lucide-react';
import { createT } from '@/core/i18n/create-t';
import { messages } from '@/core/i18n/messages';
import { daysFromToday, formatDate } from '@/core/format';
import { cn } from '@/design/cn';
import { duration, easing, stagger } from '@/design/motion.generated';

const t = createT(messages);
export type FlowStatus = 'done' | 'current' | 'pending' | 'blocked';
export interface FlowStep {
  id: string;
  label: string;
  status: FlowStatus;
  dueDate?: string;
  detail?: string;
}

const MARKER: Record<FlowStatus, string> = {
  done: 'bg-success text-primary-foreground border-success',
  current: 'bg-primary text-primary-foreground border-primary ring-4 ring-primary/20',
  pending: 'bg-surface text-muted-foreground border-border',
  blocked: 'bg-danger-soft text-danger-text border-danger',
};

/** Etapas em sequência com situação e prazo (horizontal no computador, vertical no celular). */
export function FlowSteps({
  steps,
  onSelect,
}: {
  steps: FlowStep[];
  onSelect?: (id: string) => void;
}) {
  const doneCount = steps.filter((s) => s.status === 'done').length;
  const fraction = steps.length > 1 ? doneCount / (steps.length - 1) : 0;
  return (
    <ol className="relative flex flex-col gap-5 md:flex-row md:gap-0">
      <div className="absolute top-4 bottom-4 left-4 w-0.5 bg-border md:hidden" aria-hidden>
        <motion.div
          className="size-full origin-top bg-success"
          initial={{ scaleY: 0 }}
          animate={{ scaleY: fraction }}
          transition={{ duration: duration.data, ease: easing }}
        />
      </div>
      <div className="absolute top-4 right-8 left-8 hidden h-0.5 bg-border md:block" aria-hidden>
        <motion.div
          className="size-full origin-left bg-success"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: fraction }}
          transition={{ duration: duration.data, ease: easing }}
        />
      </div>
      {steps.map((step, index) => {
        const days = step.dueDate ? daysFromToday(step.dueDate) : undefined;
        return (
          <motion.li
            key={step.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * stagger, duration: duration.base, ease: easing }}
            className="relative flex flex-1 gap-3 md:flex-col md:items-center md:text-center"
          >
            <button
              type="button"
              onClick={() => onSelect?.(step.id)}
              className="flex flex-1 gap-3 text-left md:flex-col md:items-center md:text-center"
            >
              <span
                className={cn(
                  'z-10 flex size-8 shrink-0 items-center justify-center rounded-full border-2 text-sm font-semibold transition-colors',
                  MARKER[step.status],
                )}
              >
                {step.status === 'done' ? (
                  <Check className="size-4" strokeWidth={3} />
                ) : step.status === 'blocked' ? (
                  <AlertCircle className="size-4" />
                ) : (
                  index + 1
                )}
              </span>
              <span className="space-y-0.5">
                <span className="block text-base font-medium">{step.label}</span>
                <span className="block text-sm text-muted-foreground">
                  {step.detail ??
                    t(
                      `flow.${step.status === 'done' ? 'done' : step.status === 'current' ? 'current' : step.status === 'blocked' ? 'blocked' : 'pending'}`,
                    )}
                </span>
                {step.dueDate && days !== undefined && step.status !== 'done' && (
                  <span
                    className={cn(
                      'block text-xs tnum',
                      days < 0 ? 'text-danger-text' : 'text-muted-foreground',
                    )}
                  >
                    {formatDate(step.dueDate)} ·{' '}
                    {days < 0
                      ? t('flow.overdue', { days: Math.abs(days) })
                      : t('flow.dueIn', { days })}
                  </span>
                )}
              </span>
            </button>
          </motion.li>
        );
      })}
    </ol>
  );
}
