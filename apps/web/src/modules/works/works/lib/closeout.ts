import type { Obra } from '@/core/entities';
import type { FlowStep } from '@/design/patterns/flow-steps';
import { t } from '@/modules/works/works/i18n';

const STAGES = [
  'punch',
  'provisional',
  'asBuilt',
  'manual',
  'definitive',
  'demobilization',
  'lessons',
] as const;
type Stage = (typeof STAGES)[number];

/** Situação de cada etapa de encerramento conforme a situação da obra. */
export function closeoutSteps(obra: Obra): FlowStep[] {
  const closing = obra.status === 'closing';
  const doneUntil = closing ? 2 : 0;
  return STAGES.map((stage: Stage, index) => {
    if (closing) {
      const status = index < doneUntil ? 'done' : index === doneUntil ? 'current' : 'pending';
      return {
        id: stage,
        label: t(`closeout.${stage}`),
        status,
        detail: status === 'current' ? t('closeout.inProgress') : undefined,
      };
    }
    return {
      id: stage,
      label: t(`closeout.${stage}`),
      status: 'pending' as const,
      detail: t('closeout.waitingWork'),
    };
  });
}
