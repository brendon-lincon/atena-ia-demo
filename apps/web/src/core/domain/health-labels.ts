import { createT } from '@/core/i18n/create-t';
import { messages } from '@/core/i18n/messages';
import type { Obra } from '@/core/entities';
import { formatPercent } from '@/core/format';
import { costLight, scheduleLight, type Light } from './health';

const t = createT(messages);

/** Semáforos da obra com o texto que os acompanha (prazo em pontos percentuais, custo em %). */
export function obraLights(obra: Obra): { label: string; value: string; tone: Light }[] {
  const gap = obra.actualPhysicalPct - obra.plannedPhysicalPct;
  const sign = (n: number) => (n >= 0.05 ? '+' : '−');
  return [
    {
      label: t('lights.schedule'),
      value:
        obra.status === 'mobilizing'
          ? t('lights.notStarted')
          : Math.abs(gap) < 0.05
            ? '0,0 pp'
            : `${sign(gap)}${Math.abs(gap).toFixed(1).replace('.', ',')} pp`,
      tone: scheduleLight(obra),
    },
    {
      label: t('lights.cost'),
      value:
        obra.costVariancePct === null
          ? t('lights.notStarted')
          : obra.costVariancePct === 0
            ? t('lights.onBudget')
            : `${sign(obra.costVariancePct)}${formatPercent(Math.abs(obra.costVariancePct), 1)}`,
      tone: costLight(obra),
    },
  ];
}
