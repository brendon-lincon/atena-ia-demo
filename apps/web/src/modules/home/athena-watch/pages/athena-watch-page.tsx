import { addDays, format } from 'date-fns';
import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { useList, useUpdate } from '@/core/api/hooks';
import { runAtenaAction } from '@/core/atena/actions';
import { useDirectory } from '@/core/directory/use-directory';
import { insights as insightsApi, type Insight } from '@/core/entities';
import { formatDate } from '@/core/format';
import { AtenaOrb } from '@/design/patterns/atena-orb';
import { EmptyState, ErrorState } from '@/design/patterns/empty-state';
import { InsightCard } from '@/design/patterns/insight-card';
import { PageHeader } from '@/design/patterns/page-header';
import { SkeletonCard } from '@/design/patterns/skeleton';
import { Badge } from '@/design/ui/misc';
import { Select } from '@/design/ui/form';
import { Tabs, TabsList, TabsTrigger } from '@/design/ui/tabs';
import { useToasts } from '@/design/ui/toast';
import { t } from '@/modules/home/athena-watch/i18n';

const SHIFT_ORDER = { night: 0, afternoon: 1, morning: 2 } as const;
const SEVERITY_RANK = { critical: 0, attention: 1, info: 2 } as const;
const STATUSES = ['new', 'accepted', 'snoozed', 'dismissed'] as const;

interface Turn {
  key: string;
  date: string;
  shift: Insight['shift'];
  items: Insight[];
}

/** Olhar de Atena: linha do tempo dos turnos; cada apontamento tem origem, gravidade e ação sugerida. */
export default function AthenaWatchPage() {
  const list = useList(insightsApi, { sort: '-generatedAt', pageSize: 100 });
  const update = useUpdate(insightsApi);
  const dir = useDirectory();
  const navigate = useNavigate();
  const push = useToasts((s) => s.push);
  const [params, setParams] = useSearchParams();
  const [work, setWork] = useState('');
  const status = (STATUSES as readonly string[]).includes(params.get('tab') ?? '')
    ? (params.get('tab') as Insight['status'])
    : 'new';
  const [now] = useState(() => new Date());
  const today = format(now, 'yyyy-MM-dd');
  const yesterday = format(addDays(now, -1), 'yyyy-MM-dd');

  const turns = useMemo<Turn[]>(() => {
    const filtered = (list.data?.data ?? []).filter(
      (i) => i.status === status && (!work || i.obraId === work),
    );
    const groups = new Map<string, Turn>();
    for (const item of filtered) {
      const date = item.generatedAt.slice(0, 10);
      const key = `${date}:${item.shift}`;
      groups.set(key, {
        key,
        date,
        shift: item.shift,
        items: [...(groups.get(key)?.items ?? []), item],
      });
    }
    return [...groups.values()]
      .sort((a, b) => b.date.localeCompare(a.date) || SHIFT_ORDER[a.shift] - SHIFT_ORDER[b.shift])
      .map((turn) => ({
        ...turn,
        items: [...turn.items].sort(
          (a, b) => SEVERITY_RANK[a.severity] - SEVERITY_RANK[b.severity],
        ),
      }));
  }, [list.data, status, work]);

  const decide = (item: Insight, next: Insight['status']) =>
    update.mutate(
      { id: item.id, patch: { status: next } },
      {
        onSuccess: () =>
          push(t(next === 'accepted' ? 'accepted' : next === 'snoozed' ? 'snoozed' : 'dismissed')),
      },
    );
  const accept = (item: Insight) => {
    decide(item, 'accepted');
    void runAtenaAction(item.suggestedAction, (to) => void navigate(to)).then(
      (created) => created && push(t('taskCreated')),
    );
  };
  const dayLabel = (date: string) =>
    date === today ? t('today') : date === yesterday ? t('yesterday') : formatDate(date);

  return (
    <div>
      <PageHeader
        title={t('title')}
        description={t('subtitle')}
        actions={
          <Select
            value={work}
            onChange={(e) => setWork(e.target.value)}
            aria-label={t('filterWork')}
            className="w-64"
          >
            <option value="">{t('allWorks')}</option>
            {dir.obras.map((o) => (
              <option key={o.id} value={o.id}>
                {o.name}
              </option>
            ))}
          </Select>
        }
      />
      <Tabs value={status} onValueChange={(value) => setParams({ tab: value }, { replace: true })}>
        <TabsList>
          {STATUSES.map((s) => (
            <TabsTrigger key={s} value={s}>
              {t(`tabs.${s}`)}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
      <div className="mt-6">
        {list.isError ? (
          <ErrorState onRetry={() => void list.refetch()} />
        ) : list.isLoading ? (
          <SkeletonCard />
        ) : turns.length === 0 ? (
          <div className="surface-card">
            <EmptyState title={t('emptyTitle')} description={t('emptyDescription')} />
          </div>
        ) : (
          <ol className="relative space-y-8 border-l border-border pl-7">
            {turns.map((turn) => {
              const critical = turn.items.filter((i) => i.severity === 'critical').length;
              return (
                <li key={turn.key} className="relative space-y-3">
                  <span className="absolute -left-[46px] top-0 flex size-9 items-center justify-center rounded-full bg-background">
                    <AtenaOrb size={32} />
                  </span>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-semibold tracking-tight first-letter:uppercase">
                      {dayLabel(turn.date)} · {t(`shifts.${turn.shift}`)}
                    </h2>
                    <span className="tnum text-sm text-muted-foreground">
                      {t(`shiftTime.${turn.shift}`)}
                    </span>
                    <Badge tone="neutral">{t('turnCount', { count: turn.items.length })}</Badge>
                    {critical > 0 && (
                      <Badge tone="danger">{t('critical', { count: critical })}</Badge>
                    )}
                  </div>
                  <div className="space-y-3">
                    {turn.items.map((item) => (
                      <InsightCard
                        key={item.id}
                        severity={item.severity}
                        title={item.title}
                        body={item.body}
                        origin={`${item.source.label}${item.obraId ? ` · ${dir.name(item.obraId)}` : ''}`}
                        suggestedAction={item.suggestedAction.label}
                        settled={item.status === 'new' ? undefined : item.status}
                        onAccept={() => accept(item)}
                        onSnooze={() => decide(item, 'snoozed')}
                        onDismiss={() => decide(item, 'dismissed')}
                      />
                    ))}
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </div>
    </div>
  );
}
