import { useDirectory } from '@/core/directory/use-directory';
import type { Obra } from '@/core/entities';
import { daysFromToday, formatMoney } from '@/core/format';
import { ProgressCard } from '@/design/patterns/progress-card';
import { obraLights } from '@/core/domain/health-labels';
import { t } from '@/modules/works/works/i18n';

export function WorkCard({ obra }: { obra: Obra }) {
  const dir = useDirectory();
  const days = daysFromToday(obra.endDate);
  return (
    <ProgressCard
      to={`/works/${obra.id}`}
      title={obra.name}
      subtitle={`${dir.name(obra.clientId)} · ${obra.city}/${obra.state}`}
      tag={t(`status.${obra.status}`)}
      progress={obra.actualPhysicalPct}
      planned={obra.status === 'mobilizing' ? undefined : obra.plannedPhysicalPct}
      lights={obraLights(obra)}
      metrics={[
        { label: t('metrics.headcount'), value: String(obra.headcount) },
        {
          label: t('metrics.value'),
          value: formatMoney(obra.contractValueCents, { compact: true }),
        },
        { label: t('metrics.daysLeft'), value: days > 0 ? String(days) : '—' },
      ]}
      trend={obra.progressHistory}
    />
  );
}
