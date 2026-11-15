import { useMemo, useState } from 'react';
import { differenceInCalendarDays, parseISO } from 'date-fns';
import type { ScheduleActivity } from '@/core/entities';
import { formatDate } from '@/core/format';
import { EmptyState } from '@/design/patterns/empty-state';
import { GanttChart, type GanttActivity } from '@/design/patterns/gantt-chart';
import { SkeletonCard } from '@/design/patterns/skeleton';
import { Badge } from '@/design/ui/misc';
import { Dialog, DialogDescription, DialogTitle, Sheet } from '@/design/ui/overlay';
import { criticalPath } from '@/modules/works/planning/lib/cpm';
import { t } from '@/modules/works/planning/i18n';

/** Gantt da obra: dependências, caminho crítico calculado a partir das relações, linha de base e atraso. */
export function GanttTab({
  activities,
  groupOf,
  loading,
}: {
  activities: ScheduleActivity[];
  groupOf?: (a: ScheduleActivity) => string;
  loading?: boolean;
}) {
  const [selected, setSelected] = useState<string>();
  const result = useMemo(
    () => (activities.length ? criticalPath(activities) : undefined),
    [activities],
  );
  const items = useMemo<GanttActivity[]>(
    () =>
      activities.map((a) => ({
        id: a.id,
        name: a.name,
        group: groupOf?.(a),
        start: a.startDate,
        end: a.endDate,
        baselineStart: a.baselineStart,
        baselineEnd: a.baselineEnd,
        progress: a.progressPct,
        milestone: a.isMilestone,
        critical: result?.critical.has(a.id),
        predecessors: a.predecessors.map((p) => ({ id: p.activityId, type: p.type })),
      })),
    [activities, groupOf, result],
  );
  if (loading) return <SkeletonCard />;
  if (activities.length === 0) return <EmptyState title={t('gantt.empty')} />;
  const current = activities.find((a) => a.id === selected);
  const delay = current
    ? differenceInCalendarDays(parseISO(current.endDate), parseISO(current.baselineEnd))
    : 0;
  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        {t('gantt.criticalCount', { count: result?.critical.size ?? 0 })}
      </p>
      <GanttChart activities={items} onSelect={(a) => setSelected(a.id)} />
      <Dialog open={Boolean(current)} onOpenChange={(open) => !open && setSelected(undefined)}>
        <Sheet>
          <DialogTitle>{current?.name}</DialogTitle>
          <DialogDescription>
            {current && `${formatDate(current.startDate)} – ${formatDate(current.endDate)}`}
          </DialogDescription>
          {current && (
            <dl className="space-y-3 text-base">
              <div className="flex flex-wrap gap-2">
                {result?.critical.has(current.id) && (
                  <Badge tone="danger">{t('gantt.critical')}</Badge>
                )}
                {delay > 0 && <Badge tone="warning">{t('gantt.delayed', { days: delay })}</Badge>}
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">{t('gantt.progress')}</dt>
                <dd className="tnum">{Math.round(current.progressPct)}%</dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">{t('gantt.float')}</dt>
                <dd className="tnum">
                  {t('gantt.days', { days: Math.max(result?.floatDays.get(current.id) ?? 0, 0) })}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">{t('gantt.baselineEnd')}</dt>
                <dd className="tnum">{formatDate(current.baselineEnd)}</dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">{t('gantt.predecessors')}</dt>
                <dd>
                  {current.predecessors.length
                    ? current.predecessors
                        .map(
                          (p) =>
                            `${activities.find((a) => a.id === p.activityId)?.name ?? ''} (${p.type})`,
                        )
                        .join('; ')
                    : t('gantt.none')}
                </dd>
              </div>
            </dl>
          )}
        </Sheet>
      </Dialog>
    </div>
  );
}
