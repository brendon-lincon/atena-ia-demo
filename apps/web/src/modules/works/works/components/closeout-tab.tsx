import type { Obra } from '@/core/entities';
import { FlowSteps } from '@/design/patterns/flow-steps';
import { closeoutSteps } from '@/modules/works/works/lib/closeout';
import { t } from '@/modules/works/works/i18n';

export function CloseoutTab({ obra }: { obra: Obra }) {
  return (
    <div className="surface-card space-y-6 p-6">
      <p className="text-base text-muted-foreground">{t('closeout.lead')}</p>
      <FlowSteps steps={closeoutSteps(obra)} />
    </div>
  );
}
