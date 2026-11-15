import { RotateCw } from 'lucide-react';
import type { ReactNode } from 'react';
import { createT } from '@/core/i18n/create-t';
import { messages } from '@/core/i18n/messages';
import { cn } from '@/design/cn';
import { Button } from '@/design/ui/button';

const t = createT(messages);
type Illustration = 'empty' | 'error' | 'first-steps';

/** Estado vazio: sempre com o próximo passo. */
export function EmptyState({
  illustration = 'empty',
  title,
  description,
  action,
  className,
}: {
  illustration?: Illustration;
  title?: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'mx-auto flex max-w-sm flex-col items-center gap-3 px-4 py-10 text-center',
        className,
      )}
    >
      <img src={`/illustrations/${illustration}.svg`} alt="" className="mb-2 w-48" />
      <h3 className="text-lg font-semibold tracking-tight">{title ?? t('state.emptyTitle')}</h3>
      <p className="text-base text-muted-foreground">
        {description ?? t('state.emptyDescription')}
      </p>
      {action}
    </div>
  );
}

export function ErrorState({
  onRetry,
  title,
  description,
}: {
  onRetry?: () => void;
  title?: string;
  description?: string;
}) {
  return (
    <EmptyState
      illustration="error"
      title={title ?? t('state.errorTitle')}
      description={description ?? t('state.errorDescription')}
      action={
        onRetry && (
          <Button variant="outline" onClick={onRetry}>
            <RotateCw /> {t('common.retry')}
          </Button>
        )
      }
    />
  );
}

export function OfflineState() {
  return (
    <EmptyState
      illustration="error"
      title={t('state.offlineTitle')}
      description={t('state.offlineDescription')}
    />
  );
}
