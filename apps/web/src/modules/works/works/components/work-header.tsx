import { useDirectory } from '@/core/directory/use-directory';
import { type Obra } from '@/core/entities';
import { daysFromToday, formatDate, formatMoney } from '@/core/format';
import { LIGHT_CLASS } from '@/core/domain/health';
import { cn } from '@/design/cn';
import { ProgressRing } from '@/design/patterns/progress-ring';
import { obraLights } from '@/core/domain/health-labels';
import { t } from '@/modules/works/works/i18n';

/** Cabeçalho fixo da obra: avanço, prazo, custo e efetivo sempre à vista. */
export function WorkHeader({ obra }: { obra: Obra }) {
  const dir = useDirectory();
  const days = daysFromToday(obra.endDate);
  const lights = obraLights(obra);
  return (
    <div className="surface-card sticky top-[72px] z-10 mb-5 flex flex-wrap items-center gap-x-8 gap-y-3 p-4 backdrop-blur">
      <ProgressRing
        value={obra.actualPhysicalPct}
        planned={obra.status === 'mobilizing' ? undefined : obra.plannedPhysicalPct}
        size={64}
        stroke={6}
      >
        <span className="text-sm font-semibold tnum">{Math.round(obra.actualPhysicalPct)}%</span>
      </ProgressRing>
      <Stat label={t('detail.contractor')} value={dir.name(obra.clientId)} />
      <Stat label={t('detail.place')} value={`${obra.city}/${obra.state}`} />
      <Stat
        label={t('detail.deadline')}
        value={formatDate(obra.endDate)}
        hint={days >= 0 ? t('detail.daysLeft', { days }) : t('detail.overdue', { days: -days })}
      />
      {lights.map((l) => (
        <div key={l.label}>
          <p className="text-xs text-muted-foreground">{l.label}</p>
          <p className="flex items-center gap-1.5 text-base font-semibold tnum">
            <span className={cn('size-2.5 rounded-full', LIGHT_CLASS[l.tone])} />
            {l.value}
          </p>
        </div>
      ))}
      <Stat label={t('detail.headcount')} value={String(obra.headcount)} />
      <Stat
        label={t('metrics.value')}
        value={formatMoney(obra.contractValueCents, { compact: true })}
      />
    </div>
  );
}

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="min-w-0">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="truncate text-base font-semibold tnum">{value}</p>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}
