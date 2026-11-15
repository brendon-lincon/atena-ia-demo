import { AnimatePresence, motion } from 'motion/react';
import { Check, Circle, Loader2 } from 'lucide-react';
import type { ReactNode } from 'react';
import { createT } from '@/core/i18n/create-t';
import { messages } from '@/core/i18n/messages';
import { cn } from '@/design/cn';
import { duration, easing } from '@/design/motion.generated';
import { Progress } from '@/design/ui/misc';
import { AtenaOrb } from './atena-orb';

const t = createT(messages);
export interface JobView {
  status: 'queued' | 'running' | 'done' | 'failed';
  progress: number;
  stageIndex: number;
  stages: { label: string; status: 'done' | 'running' | 'pending' }[];
}

/** Acompanhador de toda tarefa demorada: etapas, percentual e resultado, alimentado pelo canal em tempo real. */
export function JobTracker({
  job,
  title,
  result,
}: {
  job: JobView;
  title?: string;
  result?: ReactNode;
}) {
  const done = job.status === 'done';
  return (
    <div className="surface-card overflow-hidden p-5">
      <div className="flex items-center gap-4">
        <AtenaOrb size={44} thinking={!done} />
        <div className="min-w-0 flex-1">
          <p className="text-lg font-semibold tracking-tight">{title ?? t('job.title')}</p>
          <p className="text-sm text-muted-foreground" aria-live="polite">
            {done
              ? t('job.elapsed')
              : t('job.stage', { current: job.stageIndex + 1, total: job.stages.length })}
          </p>
        </div>
        <span className="text-2xl font-semibold tnum">{job.progress}%</span>
      </div>
      <Progress value={job.progress} className="my-4" aria-label={t('job.title')} />
      <ol className="space-y-2">
        {job.stages.map((stage) => (
          <li
            key={stage.label}
            className={cn(
              'flex items-center gap-3 text-base transition-colors',
              stage.status === 'pending' ? 'text-muted-foreground' : 'text-foreground',
            )}
          >
            <span className="flex size-5 items-center justify-center">
              {stage.status === 'done' ? (
                <motion.span
                  initial={{ scale: 0.4 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: duration.base, ease: easing }}
                  className="flex size-5 items-center justify-center rounded-full bg-success text-primary-foreground"
                >
                  <Check className="size-3" strokeWidth={3} />
                </motion.span>
              ) : stage.status === 'running' ? (
                <Loader2 className="size-4 animate-spin text-primary" />
              ) : (
                <Circle className="size-4" />
              )}
            </span>
            {stage.label}
          </li>
        ))}
      </ol>
      <AnimatePresence>
        {done && result && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            transition={{ duration: duration.emphasis, ease: easing }}
            className="mt-4 overflow-hidden border-t border-border pt-4"
          >
            {result}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
