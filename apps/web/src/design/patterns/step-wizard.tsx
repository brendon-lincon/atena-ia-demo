import { AnimatePresence, motion } from 'motion/react';
import { Check } from 'lucide-react';
import type { ReactNode } from 'react';
import { createT } from '@/core/i18n/create-t';
import { messages } from '@/core/i18n/messages';
import { cn } from '@/design/cn';
import { duration, easing, shift } from '@/design/motion.generated';
import { Button } from '@/design/ui/button';

const t = createT(messages);
export interface WizardStep {
  id: string;
  label: string;
  description?: string;
}

/** Assistente em passos: indicador no topo, conteúdo com transição lateral, navegação no rodapé. */
export function StepWizard({
  steps,
  current,
  onStepChange,
  canAdvance = true,
  onFinish,
  children,
}: {
  steps: WizardStep[];
  current: number;
  onStepChange: (index: number) => void;
  canAdvance?: boolean;
  onFinish?: () => void;
  children: ReactNode;
}) {
  const last = current === steps.length - 1;
  return (
    <div className="space-y-5">
      <ol className="flex items-center gap-2 overflow-x-auto pb-1">
        {steps.map((step, index) => (
          <li key={step.id} className="flex flex-1 items-center gap-2">
            <button
              type="button"
              disabled={index > current}
              onClick={() => onStepChange(index)}
              className={cn(
                'flex min-w-0 items-center gap-2 rounded-md px-1 py-1 text-left',
                index > current && 'opacity-60',
              )}
            >
              <span
                className={cn(
                  'flex size-7 shrink-0 items-center justify-center rounded-full text-sm font-semibold transition-colors',
                  index < current
                    ? 'bg-success text-primary-foreground'
                    : index === current
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground',
                )}
              >
                {index < current ? <Check className="size-4" strokeWidth={3} /> : index + 1}
              </span>
              <span
                className={cn(
                  'hidden truncate text-sm font-medium lg:inline',
                  index === current ? 'text-foreground' : 'text-muted-foreground',
                )}
              >
                {step.label}
              </span>
            </button>
            {index < steps.length - 1 && <span className="h-px min-w-4 flex-1 bg-border" />}
          </li>
        ))}
      </ol>
      <p className="text-sm text-muted-foreground lg:hidden">
        {t('wizard.step', { current: current + 1, total: steps.length })} · {steps[current]?.label}
      </p>
      <div className="relative min-h-40">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={current}
            initial={{ opacity: 0, x: shift * 2 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -shift * 2 }}
            transition={{ duration: duration.base, ease: easing }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </div>
      <div className="flex justify-between border-t border-border pt-4">
        <Button variant="ghost" disabled={current === 0} onClick={() => onStepChange(current - 1)}>
          {t('wizard.previous')}
        </Button>
        <Button
          disabled={!canAdvance}
          onClick={() => (last ? onFinish?.() : onStepChange(current + 1))}
        >
          {last ? t('wizard.finish') : t('common.next')}
        </Button>
      </div>
    </div>
  );
}
