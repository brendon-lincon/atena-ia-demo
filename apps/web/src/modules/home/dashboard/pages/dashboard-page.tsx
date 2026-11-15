import { addDays, format } from 'date-fns';
import { Activity, CalendarClock, Users, Wallet } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router';
import { useUpdate } from '@/core/api/hooks';
import { useAuth } from '@/core/auth/auth-store';
import { obraLights } from '@/core/domain/health-labels';
import {
  daysFromToday,
  formatDate,
  formatLongDate,
  formatMoney,
  formatNumber,
  formatPercent,
} from '@/core/format';
import { insights as insightsApi } from '@/core/entities';
import { Cascade, CascadeItem } from '@/design/patterns/cascade';
import { EmptyState, ErrorState } from '@/design/patterns/empty-state';
import { InsightCard } from '@/design/patterns/insight-card';
import { KpiCard } from '@/design/patterns/kpi-card';
import { MapView, type MapMarker } from '@/design/patterns/map-view';
import { PageHeader } from '@/design/patterns/page-header';
import { ProgressCard } from '@/design/patterns/progress-card';
import { SkeletonCard } from '@/design/patterns/skeleton';
import { HorizontalTimeline, type TimelineItem } from '@/design/patterns/timeline';
import { Button } from '@/design/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/design/ui/misc';
import { useDashboardData } from '@/modules/home/dashboard/api';
import { CostChart, ProgressChart } from '@/modules/home/dashboard/components/charts';
import { NeedsYou } from '@/modules/home/dashboard/components/needs-you';
import { t } from '@/modules/home/dashboard/i18n';
import { greetingKey, portfolio } from '@/modules/home/dashboard/lib/summary';

const PAST_DAYS = 150;
const FUTURE_DAYS = 420;
const SOON_DAYS = 14;
const TONE = { green: 'success', yellow: 'warning', red: 'danger', gray: 'neutral' } as const;

export default function DashboardPage() {
  const user = useAuth((state) => state.user);
  const data = useDashboardData();
  const update = useUpdate(insightsApi);
  const [now] = useState(() => new Date());
  const obras = useMemo(() => data.obras.data?.data ?? [], [data.obras.data]);
  const sum = useMemo(() => portfolio(obras), [obras]);
  const from = format(addDays(now, -PAST_DAYS), 'yyyy-MM-dd');
  const to = format(addDays(now, FUTURE_DAYS), 'yyyy-MM-dd');
  const events = (data.events.data?.data ?? []).filter(
    (e) => e.date >= data.window.from && e.date <= data.window.to,
  );
  const deadlines = data.deadlines.data?.data ?? [];
  const soon = deadlines.filter(
    (d) => d.dueDate >= data.window.from && d.dueDate <= data.window.horizon,
  );

  if (data.obras.isError) return <ErrorState onRetry={() => void data.obras.refetch()} />;
  if (data.obras.isLoading)
    return (
      <div className="grid gap-4 md:grid-cols-3">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );

  const tracks = [
    ...obras.map((o) => ({
      id: o.id,
      label: o.name.replace('Base de Distribuição ', '').replace('Serviços civis — ', ''),
    })),
    { id: 'deadlines', label: t('timeline.deadlines') },
  ];
  const timelineItems: TimelineItem[] = [
    ...obras.map((o): TimelineItem => ({
      id: `w:${o.id}`,
      trackId: o.id,
      label: o.name,
      start: o.startDate < from ? from : o.startDate,
      end: o.endDate > to ? to : o.endDate,
      tone: o.status === 'closing' ? 'neutral' : o.status === 'mobilizing' ? 'warning' : 'primary',
    })),
    ...deadlines
      .filter((d) => d.dueDate >= from && d.dueDate <= to)
      .map((d): TimelineItem => ({
        id: `d:${d.id}`,
        trackId: 'deadlines',
        label: d.title,
        start: d.dueDate,
        tone: daysFromToday(d.dueDate) <= SOON_DAYS ? 'danger' : 'neutral',
      })),
  ];
  const markers: MapMarker[] = obras.map((o) => ({
    id: o.id,
    lat: o.latitude,
    lng: o.longitude,
    label: o.name,
    tone: TONE[obraLights(o)[0]?.tone ?? 'gray'],
  }));
  const first = (user?.name ?? '').split(' ')[0] ?? '';

  return (
    <div className="space-y-8">
      <PageHeader
        title={t(`greeting.${greetingKey(now)}`, { name: first })}
        description={`${formatLongDate(now)}. ${t('greeting.subtitle')}`}
        className="pb-0"
      />

      <section aria-label={t('needsYou.title')} className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight">{t('needsYou.title')}</h2>
        {(data.review.data?.data.length ?? 0) > 0 ? (
          <NeedsYou items={data.review.data?.data ?? []} />
        ) : (
          <p className="text-muted-foreground">{t('needsYou.allClear')}</p>
        )}
      </section>

      <Cascade className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <CascadeItem>
          <KpiCard
            label={t('kpi.contracted')}
            value={sum.contractedCents}
            format={(n) => formatMoney(n, { compact: true })}
            icon={<Wallet className="size-4" />}
            footnote={t('kpi.activeWorks', { count: sum.active })}
          />
        </CascadeItem>
        <CascadeItem>
          <KpiCard
            label={t('kpi.progress')}
            value={sum.progress}
            format={(n) => formatPercent(n, 1)}
            icon={<Activity className="size-4" />}
            delta={
              sum.gapPp > 0
                ? { value: `${formatNumber(sum.gapPp, 1)} pp`, tone: 'bad', direction: 'down' }
                : undefined
            }
            footnote={sum.gapPp > 0 ? t('kpi.pp') : undefined}
            trend={obras.find((o) => o.progressHistory.length)?.progressHistory}
          />
        </CascadeItem>
        <CascadeItem>
          <KpiCard
            label={t('kpi.headcount')}
            value={sum.headcount}
            format={(n) => String(Math.round(n))}
            icon={<Users className="size-4" />}
          />
        </CascadeItem>
        <CascadeItem>
          <KpiCard
            label={t('kpi.deadlines')}
            value={soon.length}
            format={(n) => String(Math.round(n))}
            icon={<CalendarClock className="size-4" />}
          />
        </CascadeItem>
      </Cascade>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold tracking-tight">{t('works.title')}</h2>
          <Button asChild variant="ghost" size="sm">
            <Link to="/works">{t('works.seeAll')}</Link>
          </Button>
        </div>
        <Cascade className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {obras.map((o) => (
            <CascadeItem key={o.id}>
              <ProgressCard
                to={`/works/${o.id}`}
                title={o.name}
                subtitle={`${o.city}/${o.state}`}
                progress={o.actualPhysicalPct}
                planned={o.status === 'mobilizing' ? undefined : o.plannedPhysicalPct}
                lights={obraLights(o)}
                metrics={[
                  { label: t('works.headcount'), value: String(o.headcount) },
                  {
                    label: t('works.contract'),
                    value: formatMoney(o.contractValueCents, { compact: true }),
                  },
                ]}
                trend={o.progressHistory}
              />
            </CascadeItem>
          ))}
        </Cascade>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight">{t('timeline.title')}</h2>
        <HorizontalTimeline tracks={tracks} items={timelineItems} from={from} to={to} />
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.3fr_1fr]">
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold tracking-tight">{t('insights.title')}</h2>
            <Button asChild variant="ghost" size="sm">
              <Link to="/athena-watch">{t('insights.seeAll')}</Link>
            </Button>
          </div>
          {(data.insights.data?.data ?? []).length === 0 && (
            <p className="text-muted-foreground">{t('insights.empty')}</p>
          )}
          {(data.insights.data?.data ?? []).slice(0, 3).map((i) => (
            <InsightCard
              key={i.id}
              severity={i.severity}
              title={i.title}
              body={i.body}
              origin={i.source.label}
              suggestedAction={i.suggestedAction.label}
              onAccept={() => update.mutate({ id: i.id, patch: { status: 'accepted' } })}
              onSnooze={() => update.mutate({ id: i.id, patch: { status: 'snoozed' } })}
              onDismiss={() => update.mutate({ id: i.id, patch: { status: 'dismissed' } })}
            />
          ))}
        </section>
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('map.title')}</CardTitle>
              <Button asChild variant="ghost" size="sm">
                <Link to="/map">{t('map.open')}</Link>
              </Button>
            </CardHeader>
            <CardContent>
              <MapView className="h-64" markers={markers} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>{t('agenda.title')}</CardTitle>
              <Button asChild variant="ghost" size="sm">
                <Link to="/agenda">{t('agenda.open')}</Link>
              </Button>
            </CardHeader>
            <CardContent>
              {events.length === 0 ? (
                <EmptyState title={t('agenda.empty')} className="py-4" />
              ) : (
                <ul className="space-y-2.5">
                  {events.slice(0, 7).map((e) => (
                    <li key={e.id} className="flex gap-3 text-base">
                      <span className="tnum w-14 shrink-0 text-sm text-muted-foreground first-letter:uppercase">
                        {formatDate(e.date, 'EEE d')}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate">{e.title}</span>
                        <span className="text-sm text-muted-foreground">
                          {e.allDay
                            ? t('agenda.allDay')
                            : `${e.startTime ?? ''}${e.location ? ` · ${e.location}` : ''}`}
                        </span>
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t('charts.cost')}</CardTitle>
          </CardHeader>
          <CardContent>
            <CostChart obras={obras} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{t('charts.progress')}</CardTitle>
          </CardHeader>
          <CardContent>
            <ProgressChart obras={obras} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
