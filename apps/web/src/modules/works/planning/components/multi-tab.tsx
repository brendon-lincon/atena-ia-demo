import { addDays, format } from 'date-fns';
import { useState } from 'react';
import { type Obra } from '@/core/entities';
import { HorizontalTimeline, type TimelineItem } from '@/design/patterns/timeline';
import { t } from '@/modules/works/planning/i18n';

const PAST = 160;
const FUTURE = 420;

/** Visão multiobra: todas as obras sobrepostas no tempo. */
export function MultiTab({ obras }: { obras: Obra[] }) {
  const [now] = useState(() => new Date());
  const from = format(addDays(now, -PAST), 'yyyy-MM-dd');
  const to = format(addDays(now, FUTURE), 'yyyy-MM-dd');
  const items: TimelineItem[] = obras.map((o) => ({
    id: o.id,
    trackId: o.id,
    label: `${o.name} — ${Math.round(o.actualPhysicalPct)}%`,
    start: o.startDate < from ? from : o.startDate,
    end: o.endDate > to ? to : o.endDate,
    tone: o.status === 'closing' ? 'neutral' : o.status === 'mobilizing' ? 'warning' : 'primary',
  }));
  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">{t('multi.hint')}</p>
      <HorizontalTimeline
        tracks={obras.map((o) => ({
          id: o.id,
          label: o.name.replace('Base de Distribuição ', '').replace('Serviços civis — ', ''),
        }))}
        items={items}
        from={from}
        to={to}
      />
    </div>
  );
}
