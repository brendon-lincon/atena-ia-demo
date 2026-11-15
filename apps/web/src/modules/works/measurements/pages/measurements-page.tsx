import { Send } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useParams } from 'react-router';
import { useDirectory } from '@/core/directory/use-directory';
import { useCompany } from '@/core/entities/use-company';
import { formatDate, formatMoney } from '@/core/format';
import { DocumentPage } from '@/design/patterns/document-page';
import { EmptyState } from '@/design/patterns/empty-state';
import { PageHeader } from '@/design/patterns/page-header';
import { SkeletonCard } from '@/design/patterns/skeleton';
import { StatusBadge } from '@/design/patterns/status-badge';
import { Button } from '@/design/ui/button';
import { Select } from '@/design/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/design/ui/misc';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/design/ui/tabs';
import { useToasts } from '@/design/ui/toast';
import {
  useMeasurementItems,
  useMeasurements,
  useSendMeasurement,
} from '@/modules/works/measurements/api';
import { SurveyTab } from '@/modules/works/measurements/components/survey-tab';
import { t } from '@/modules/works/measurements/i18n';
import { bulletinBlocks } from '@/modules/works/measurements/lib/bulletin';

const STATUS_TONE = {
  draft: 'neutral',
  in_review: 'warning',
  approved: 'success',
  issued: 'info',
} as const;

/** Medições (todas as obras) e, filtrada por `obraId`, a aba de medições da obra: o mesmo componente nos dois escopos. */
export default function MeasurementsPage({ obraId }: { obraId?: string }) {
  const dir = useDirectory();
  const company = useCompany();
  const push = useToasts((s) => s.push);
  const send = useSendMeasurement();
  const [picked, setWork] = useState<string>();
  const { id } = useParams();
  const [chosen, setChosen] = useState<string | undefined>(id);
  const withData = dir.obras.filter((o) => o.status !== 'mobilizing');
  const work =
    picked ?? dir.obras.find((o) => o.code === 'OB-2026-011')?.id ?? withData[0]?.id ?? '';
  const list = useMeasurements(obraId ?? (id ? undefined : work || undefined));
  const measurements = useMemo(() => list.data?.data ?? [], [list.data]);
  const current =
    measurements.find((m) => m.id === chosen) ??
    measurements.find((m) => m.status === 'approved') ??
    measurements[0];
  const items = useMeasurementItems(current?.id);
  const obra = dir.obras.find((o) => o.id === current?.obraId);
  const client = dir.name(obra?.clientId);

  const body = !current ? (
    list.isLoading ? (
      <SkeletonCard />
    ) : (
      <EmptyState title={t('emptyTitle')} description={t('emptyDescription')} />
    )
  ) : (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Select
          value={current.id}
          onChange={(e) => setChosen(e.target.value)}
          aria-label={t('measurement')}
          className="w-72"
        >
          {measurements.map((m) => (
            <option key={m.id} value={m.id}>
              {t('number', { number: m.number })} — {formatDate(m.periodStart, 'dd/MM')} a{' '}
              {formatDate(m.periodEnd, 'dd/MM')}
            </option>
          ))}
        </Select>
        <StatusBadge
          tone={
            (STATUS_TONE as Record<string, 'neutral' | 'warning' | 'success' | 'info'>)[
              current.status
            ] ?? 'neutral'
          }
          label={t(`status.${current.status as 'draft'}`)}
        />
        <span className="tnum text-lg font-semibold">{formatMoney(current.amountCents)}</span>
      </div>
      <Tabs defaultValue="survey">
        <TabsList>
          {(['survey', 'bulletin', 'payment'] as const).map((k) => (
            <TabsTrigger key={k} value={k}>
              {t(`tabs.${k}`)}
            </TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value="survey">
          <SurveyTab items={items.data?.data ?? []} loading={items.isLoading} />
        </TabsContent>
        <TabsContent value="bulletin">
          {company.data && (
            <DocumentPage
              identity={
                company.data.identity.logoText
                  ? {
                      name: company.data.name,
                      logoText: company.data.identity.logoText,
                      headerNote: company.data.identity.headerNote,
                      footerNote: company.data.identity.footerNote,
                      accent: company.data.identity.primaryColor,
                    }
                  : { name: company.data.name, logoText: '' }
              }
              number={`BM-${String(current.number).padStart(3, '0')}`}
              blocks={bulletinBlocks(current, items.data?.data ?? [], obra?.name ?? '', {
                start: formatDate(current.periodStart),
                end: formatDate(current.periodEnd),
              })}
            />
          )}
        </TabsContent>
        <TabsContent value="payment">
          <Card className="max-w-xl">
            <CardHeader>
              <CardTitle>{t('payment.title')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-base">
                <dt className="text-muted-foreground">{t('payment.recipient')}</dt>
                <dd className="text-right font-medium">{client}</dd>
                <dt className="text-muted-foreground">{t('totals.period')}</dt>
                <dd className="tnum text-right">{formatMoney(current.amountCents)}</dd>
                <dt className="text-muted-foreground">
                  {t('totals.retention', { pct: current.retentionPct })}
                </dt>
                <dd className="tnum text-right">{formatMoney(current.retentionCents)}</dd>
                <dt className="font-semibold">{t('totals.net')}</dt>
                <dd className="tnum text-right text-lg font-semibold">
                  {formatMoney(current.netCents)}
                </dd>
              </dl>
              <p className="text-sm text-muted-foreground">{t('payment.dueIn')}</p>
              {current.status === 'issued' ? (
                <p className="text-base font-medium text-success-text">
                  {t('payment.alreadySent')}
                </p>
              ) : current.status === 'approved' ? (
                <Button
                  onClick={() =>
                    send.mutate(current.id, { onSuccess: () => push(t('payment.sent')) })
                  }
                  disabled={send.isPending}
                >
                  <Send /> {t('payment.send')}
                </Button>
              ) : (
                <p className="text-base text-muted-foreground">{t('payment.notReady')}</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
  if (obraId) return body;
  return (
    <div>
      <PageHeader
        title={t('title')}
        description={t('subtitle')}
        actions={
          <Select
            value={work}
            onChange={(e) => {
              setWork(e.target.value);
              setChosen(undefined);
            }}
            aria-label={t('work')}
            className="w-72"
          >
            {withData.map((o) => (
              <option key={o.id} value={o.id}>
                {o.name}
              </option>
            ))}
          </Select>
        }
      />
      {body}
    </div>
  );
}
