import { motion } from 'motion/react';
import { Check, Clock, X } from 'lucide-react';
import { createT } from '@/core/i18n/create-t';
import { messages } from '@/core/i18n/messages';
import { cn } from '@/design/cn';
import { duration, easing } from '@/design/motion.generated';
import { Button } from '@/design/ui/button';
import { AtenaOrb } from './atena-orb';

const t = createT(messages);
export type InsightSeverity = 'info' | 'attention' | 'critical';
const ACCENT: Record<InsightSeverity, string> = {
  info: 'bg-primary',
  attention: 'bg-warning',
  critical: 'bg-danger',
};
const LABEL: Record<
  InsightSeverity,
  'insight.severity.info' | 'insight.severity.attention' | 'insight.severity.critical'
> = {
  info: 'insight.severity.info',
  attention: 'insight.severity.attention',
  critical: 'insight.severity.critical',
};

export interface InsightCardProps {
  severity: InsightSeverity;
  title: string;
  body: string;
  origin: string;
  suggestedAction?: string;
  settled?: 'accepted' | 'snoozed' | 'dismissed';
  onAccept?: () => void;
  onSnooze?: () => void;
  onDismiss?: () => void;
}

/** Apontamento do Olhar de Atena: gravidade, origem, ação sugerida e decisão. */
export function InsightCard({
  severity,
  title,
  body,
  origin,
  suggestedAction,
  settled,
  onAccept,
  onSnooze,
  onDismiss,
}: InsightCardProps) {
  return (
    <motion.article
      layout
      animate={{ opacity: settled ? 0.55 : 1 }}
      transition={{ duration: duration.base, ease: easing }}
      className="surface-card relative flex gap-4 overflow-hidden p-5 pl-6"
    >
      <span className={cn('absolute inset-y-0 left-0 w-1.5', ACCENT[severity])} aria-hidden />
      <AtenaOrb size={32} className="mt-0.5" />
      <div className="min-w-0 flex-1 space-y-2">
        <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-muted-foreground">
          <span
            className={cn(
              'rounded-full px-2 py-0.5',
              severity === 'critical'
                ? 'bg-danger-soft text-danger-text'
                : severity === 'attention'
                  ? 'bg-warning-soft text-warning-text'
                  : 'bg-primary-soft text-foreground',
            )}
          >
            {t(LABEL[severity])}
          </span>
          <span>
            {t('insight.source')}: {origin}
          </span>
        </div>
        <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
        <p className="text-base text-muted-foreground">{body}</p>
        {suggestedAction && (
          <p className="rounded-md bg-primary-soft px-3 py-2 text-sm">
            <span className="font-medium">{t('insight.suggestedAction')}: </span>
            {suggestedAction}
          </p>
        )}
        {!settled && (
          <div className="flex flex-wrap gap-2 pt-1">
            <Button size="sm" onClick={onAccept}>
              <Check /> {t('common.accept')}
            </Button>
            <Button size="sm" variant="outline" onClick={onSnooze}>
              <Clock /> {t('common.snooze')}
            </Button>
            <Button size="sm" variant="ghost" onClick={onDismiss}>
              <X /> {t('common.dismiss')}
            </Button>
          </div>
        )}
      </div>
    </motion.article>
  );
}
