import { CalendarClock, Users, Wallet } from 'lucide-react';
import { daysFromToday, formatDate, formatMoney, formatPercent } from '@/core/format';
import { useDirectory } from '@/core/directory/use-directory';
import type { Obra } from '@/core/entities';
import { Cascade, CascadeItem } from '@/design/patterns/cascade';
import { KpiCard } from '@/design/patterns/kpi-card';
import { Card, CardContent, CardHeader, CardTitle, Progress } from '@/design/ui/misc';
import { StatusBadge } from '@/design/patterns/status-badge';
import { useWorkData } from '@/modules/works/works/api';
import { eapTree } from '@/modules/works/works/lib/eap-tree';
import { t } from '@/modules/works/works/i18n';

const TOP_FRONTS = 6;

export function OverviewTab({ obra }: { obra: Obra }) {
  const data = useWorkData(obra);
  const dir = useDirectory();
  const fronts = eapTree(data.eap.data?.data ?? []).slice(0, TOP_FRONTS);
  const lastDiary = data.diary.data?.data[0];
  const open = (data.incidents.data?.data ?? []).filter((i) => i.status !== 'resolved');
  const days = daysFromToday(obra.endDate);
  return (
    <div className="space-y-5">
      <Cascade className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <CascadeItem>
          <KpiCard
            label={t('overview.contracted')}
            value={obra.contractValueCents}
            format={(n) => formatMoney(n, { compact: true })}
            icon={<Wallet className="size-4" />}
          />
        </CascadeItem>
        <CascadeItem>
          <KpiCard
            label={t('overview.spent')}
            value={obra.actualCostToDateCents}
            format={(n) => formatMoney(n, { compact: true })}
            footnote={`${t('overview.budgetedToDate')}: ${formatMoney(obra.budgetedCostToDateCents, { compact: true })}`}
          />
        </CascadeItem>
        <CascadeItem>
          <KpiCard
            label={t('detail.headcount')}
            value={obra.headcount}
            format={(n) => String(Math.round(n))}
            icon={<Users className="size-4" />}
          />
        </CascadeItem>
        <CascadeItem>
          <KpiCard
            label={t('detail.deadline')}
            value={Math.abs(days)}
            format={(n) => String(Math.round(n))}
            icon={<CalendarClock className="size-4" />}
            footnote={
              days >= 0 ? t('detail.daysLeft', { days }) : t('detail.overdue', { days: -days })
            }
          />
        </CascadeItem>
      </Cascade>
      <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>{t('overview.fronts')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {fronts.map(({ item }) => (
              <div key={item.id} className="space-y-1.5">
                <div className="flex justify-between gap-3 text-base">
                  <span className="truncate">
                    {item.code}. {item.name}
                  </span>
                  <span className="tnum font-medium">{formatPercent(item.progressPct, 0)}</span>
                </div>
                <Progress value={item.progressPct} aria-label={item.name} />
              </div>
            ))}
          </CardContent>
        </Card>
        <div className="space-y-5">
          <Card>
            <CardHeader>
              <CardTitle>{t('overview.facts')}</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-base">
                <Fact label={t('overview.type')} value={t(`type.${obra.type}`)} />
                <Fact label={t('detail.contractor')} value={dir.name(obra.clientId)} />
                <Fact label={t('overview.manager')} value={dir.name(obra.managerId)} />
                <Fact label={t('overview.start')} value={formatDate(obra.startDate)} />
                <Fact label={t('overview.end')} value={formatDate(obra.endDate)} />
              </dl>
              <p className="mt-4 text-sm text-muted-foreground">{obra.description}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>{t('overview.openIncidents')}</CardTitle>
              <StatusBadge tone={open.length ? 'warning' : 'success'} label={String(open.length)} />
            </CardHeader>
            <CardContent className="space-y-2 text-base">
              {open.length === 0 && (
                <p className="text-muted-foreground">{t('overview.noIncidents')}</p>
              )}
              {open.slice(0, 3).map((i) => (
                <p key={i.id}>{i.title}</p>
              ))}
            </CardContent>
          </Card>
          {lastDiary && (
            <Card>
              <CardHeader>
                <CardTitle>{t('overview.lastDiary')}</CardTitle>
                <span className="tnum text-sm text-muted-foreground">
                  {formatDate(lastDiary.date)}
                </span>
              </CardHeader>
              <CardContent>
                <p className="text-base">{lastDiary.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <>
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right font-medium">{value}</dd>
    </>
  );
}
