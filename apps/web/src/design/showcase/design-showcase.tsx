import { Activity, Building2, Plus, Wallet } from 'lucide-react';
import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { createT } from '@/core/i18n/create-t';
import { messages } from '@/core/i18n/messages';
import { formatMoney, formatPercent } from '@/core/format';
import { BrandLockup, BrandSymbol, BrandWordmark } from '@/design/brand/logo';
import { AtenaOrb } from '@/design/patterns/atena-orb';
import { Cascade, CascadeItem } from '@/design/patterns/cascade';
import { ConfidenceChip } from '@/design/patterns/confidence-chip';
import { CommandPalette, useCommandShortcut } from '@/design/patterns/command-palette';
import { DataView } from '@/design/patterns/data-view';
import { DocumentPage } from '@/design/patterns/document-page';
import { EmptyState, ErrorState, OfflineState } from '@/design/patterns/empty-state';
import { FileViewer } from '@/design/patterns/file-viewer';
import { FlowSteps } from '@/design/patterns/flow-steps';
import { FunnelBoard } from '@/design/patterns/funnel-board';
import { GanttChart } from '@/design/patterns/gantt-chart';
import { Histogram, SCurve } from '@/design/patterns/charts';
import { InsightCard } from '@/design/patterns/insight-card';
import { JobTracker, type JobView } from '@/design/patterns/job-tracker';
import { KpiCard } from '@/design/patterns/kpi-card';
import { MapView } from '@/design/patterns/map-view';
import { PageHeader } from '@/design/patterns/page-header';
import { ProgressRing } from '@/design/patterns/progress-ring';
import { RecordShell } from '@/design/patterns/record-shell';
import { ReviewPanel } from '@/design/patterns/review-panel';
import { SkeletonCard, SkeletonRows } from '@/design/patterns/skeleton';
import { SourceTag } from '@/design/patterns/source-tag';
import { StatusBadge, type Lifecycle } from '@/design/patterns/status-badge';
import { StepWizard } from '@/design/patterns/step-wizard';
import { ThemeToggle } from '@/design/patterns/theme-toggle';
import { HorizontalTimeline, VerticalTimeline } from '@/design/patterns/timeline';
import { Button } from '@/design/ui/button';
import { Checkbox, Input, Label, Select, Slider, Switch, Textarea } from '@/design/ui/form';
import { Badge, Card, CardContent, CardHeader, CardTitle, Progress } from '@/design/ui/misc';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  Menu,
  MenuContent,
  MenuItem,
  MenuTrigger,
  Sheet,
  Tooltip,
} from '@/design/ui/overlay';
import { Segmented } from '@/design/ui/segmented';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/design/ui/tabs';
import { useToasts } from '@/design/ui/toast';
import {
  boardCards,
  documentBlocks,
  flowSteps,
  ganttActivities,
  histogram,
  markers,
  notes,
  paletteAnswer,
  rows,
  routes,
  sCurve,
  timelineItems,
  timelineRange,
  timelineTracks,
  verticalEntries,
  type DemoRow,
} from './fixtures';
import { showcase as s } from './messages';

const t = createT(messages);
const LIFECYCLE: Lifecycle[] = [
  'draft',
  'in_review',
  'approved',
  'issued',
  'cancelled',
  'archived',
];
const SWATCHES = [
  'background',
  'surface',
  'primary',
  'primary-strong',
  'primary-soft',
  'success',
  'warning',
  'danger',
  'chart-1',
  'chart-2',
  'chart-3',
  'chart-4',
  'chart-5',
] as const;
const TEXT_SIZES = ['xs', 'sm', 'base', 'lg', 'xl', '2xl', '3xl', '4xl'] as const;
const STAGES = [
  { id: 'lead', label: 'Contato', tone: 'neutral' as const },
  { id: 'proposal', label: 'Proposta', tone: 'primary' as const },
  { id: 'negotiation', label: 'Negociação', tone: 'primary' as const },
  { id: 'won', label: 'Ganha', tone: 'success' as const },
];
const JOB_STAGES = [
  'Lendo o arquivo',
  'Identificando elementos',
  'Calculando quantitativos',
  'Verificação cruzada',
];

function Section({ id, children }: { id: SectionId; children: ReactNode }) {
  return (
    <section aria-labelledby={`sec-${id}`} className="space-y-4 border-t border-border pt-8">
      <div>
        <h2 id={`sec-${id}`} className="text-2xl font-semibold tracking-tight">
          {s(`sections.${id}.title`)}
        </h2>
        <p className="max-w-2xl text-base text-muted-foreground">
          {s(`sections.${id}.description`)}
        </p>
      </div>
      {children}
    </section>
  );
}
type SectionId =
  | 'brand'
  | 'colors'
  | 'type'
  | 'base'
  | 'status'
  | 'kpi'
  | 'atena'
  | 'flow'
  | 'time'
  | 'charts'
  | 'data'
  | 'board'
  | 'document'
  | 'map'
  | 'record'
  | 'states';

function useSimulatedJob(): [JobView, () => void] {
  const [tick, setTick] = useState(-1);
  useEffect(() => {
    if (tick < 0 || tick >= 40) return;
    const id = window.setTimeout(() => setTick((n) => n + 1), 130);
    return () => window.clearTimeout(id);
  }, [tick]);
  const progress = tick < 0 ? 0 : Math.min(Math.round((tick / 40) * 100), 100);
  const index = Math.min(
    Math.floor((Math.max(tick, 0) / 40) * JOB_STAGES.length),
    JOB_STAGES.length - 1,
  );
  const done = progress >= 100;
  return [
    {
      status: tick < 0 ? 'queued' : done ? 'done' : 'running',
      progress,
      stageIndex: index,
      stages: JOB_STAGES.map((label, i) => ({
        label,
        status: done || i < index ? 'done' : i === index && tick >= 0 ? 'running' : 'pending',
      })),
    },
    () => setTick(0),
  ];
}

export function DesignShowcase() {
  const [palette, setPalette] = useState(false);
  const [wizard, setWizard] = useState(0);
  const [dialog, setDialog] = useState(false);
  const [sheet, setSheet] = useState(false);
  const [segment, setSegment] = useState('a');
  const [capacity, setCapacity] = useState([6]);
  const [job, runJob] = useSimulatedJob();
  const [settled, setSettled] = useState<'accepted' | undefined>();
  const push = useToasts((state) => state.push);
  const [documentDate] = useState(() => new Date().toISOString());
  const toggle = useCallback(() => setPalette((open) => !open), []);
  useCommandShortcut(toggle);

  return (
    <div className="mx-auto max-w-6xl space-y-10 px-4 py-8 sm:px-6">
      <PageHeader title={s('title')} description={s('subtitle')} actions={<ThemeToggle />} />

      <Section id="brand">
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="flex items-center justify-center gap-8 p-8">
            <BrandSymbol className="h-28 text-primary-strong dark:text-sidebar-foreground" />
            <BrandSymbol micro className="h-8 text-foreground" />
          </Card>
          <Card className="flex items-center justify-center p-8">
            <BrandWordmark className="w-full max-w-xs text-foreground" />
          </Card>
          <Card className="flex flex-col items-center justify-center gap-6 p-8">
            <BrandLockup className="w-full max-w-xs text-foreground" />
            <BrandLockup withTagline className="w-full max-w-xs text-foreground" />
          </Card>
        </div>
      </Section>

      <Section id="colors">
        <Cascade className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
          {SWATCHES.map((name) => (
            <CascadeItem key={name}>
              <div className="overflow-hidden rounded-md border border-border">
                <div className="h-16" style={{ background: `var(--${name})` }} />
                <p className="px-2 py-1.5 font-numeric text-xs">{name}</p>
              </div>
            </CascadeItem>
          ))}
        </Cascade>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="atena-gradient flex h-20 items-center justify-center rounded-lg text-lg font-semibold text-primary-strong">
            {s('labels.atenaLight')}
          </div>
          <div className="brand-deep-gradient flex h-20 items-center justify-center rounded-lg text-lg font-semibold text-sidebar-foreground">
            {s('labels.scale')}
          </div>
        </div>
      </Section>

      <Section id="type">
        <Card className="grid gap-6 p-6 md:grid-cols-2">
          <div className="space-y-2">
            {TEXT_SIZES.map((size) => (
              <p
                key={size}
                className="truncate"
                style={{ fontSize: `var(--text-${size})`, lineHeight: 1.25 }}
              >
                {s('labels.heading')}{' '}
                <span className="font-numeric text-xs text-muted-foreground">{size}</span>
              </p>
            ))}
          </div>
          <div className="space-y-3">
            {[400, 500, 600, 700].map((w) => (
              <p key={w} style={{ fontWeight: w }}>
                {s('labels.body')}
              </p>
            ))}
            <p className="font-numeric text-lg">{s('labels.numbers')}</p>
          </div>
        </Card>
      </Section>

      <Section id="base">
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="space-y-4 p-5">
            <div className="flex flex-wrap gap-2">
              <Button>{s('labels.primary')}</Button>
              <Button variant="secondary">{s('labels.secondary')}</Button>
              <Button variant="outline">{s('labels.outline')}</Button>
              <Button variant="ghost">{s('labels.ghost')}</Button>
              <Button variant="danger">{s('labels.danger')}</Button>
              <Button variant="atena">{s('labels.atena')}</Button>
              <Button size="icon" aria-label={t('common.add')}>
                <Plus />
              </Button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Input
                placeholder={s('labels.inputPlaceholder')}
                aria-label={s('labels.inputPlaceholder')}
              />
              <Select aria-label={s('labels.menu')}>
                <option>{s('labels.tabA')}</option>
                <option>{s('labels.tabB')}</option>
              </Select>
              <Textarea
                className="sm:col-span-2"
                placeholder={s('labels.inputPlaceholder')}
                aria-label={s('labels.inputPlaceholder')}
              />
            </div>
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-2">
                <Switch id="sw" defaultChecked />
                <Label htmlFor="sw">{s('labels.switchLabel')}</Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox id="cb" defaultChecked />
                <Label htmlFor="cb">{s('labels.checkboxLabel')}</Label>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Slider
                value={capacity}
                onValueChange={setCapacity}
                max={12}
                aria-label={t('histogram.capacity')}
              />
              <span className="tnum w-8 text-right">{capacity[0]}</span>
            </div>
            <Progress value={64} aria-label={t('gantt.progress')} />
          </Card>
          <Card className="space-y-4 p-5">
            <Tabs defaultValue="a">
              <TabsList>
                <TabsTrigger value="a">{s('labels.tabA')}</TabsTrigger>
                <TabsTrigger value="b">{s('labels.tabB')}</TabsTrigger>
                <TabsTrigger value="c">{s('labels.tabC')}</TabsTrigger>
              </TabsList>
              <TabsContent value="a">{s('labels.tabContent')}</TabsContent>
              <TabsContent value="b">{s('labels.tabContent')}</TabsContent>
              <TabsContent value="c">{s('labels.tabContent')}</TabsContent>
            </Tabs>
            <Segmented
              value={segment}
              onChange={setSegment}
              options={[
                { value: 'a', label: s('labels.tabA') },
                { value: 'b', label: s('labels.tabB') },
                { value: 'c', label: s('labels.tabC') },
              ]}
            />
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={() => setDialog(true)}>
                {s('labels.openDialog')}
              </Button>
              <Button variant="outline" onClick={() => setSheet(true)}>
                {s('labels.openSheet')}
              </Button>
              <Menu>
                <MenuTrigger asChild>
                  <Button variant="outline">{s('labels.menu')}</Button>
                </MenuTrigger>
                <MenuContent>
                  <MenuItem>{s('labels.menuItemA')}</MenuItem>
                  <MenuItem>{s('labels.menuItemB')}</MenuItem>
                </MenuContent>
              </Menu>
              <Tooltip label={s('labels.tooltip')}>
                <Button variant="ghost">{s('labels.tooltip')}</Button>
              </Tooltip>
              <Button variant="secondary" onClick={() => push(s('labels.toastText'))}>
                {s('labels.toast')}
              </Button>
            </div>
          </Card>
        </div>
        <Dialog open={dialog} onOpenChange={setDialog}>
          <DialogContent>
            <DialogTitle>{s('labels.dialogTitle')}</DialogTitle>
            <DialogDescription>{s('labels.dialogBody')}</DialogDescription>
            <div className="flex justify-end">
              <Button onClick={() => setDialog(false)}>{t('common.confirm')}</Button>
            </div>
          </DialogContent>
        </Dialog>
        <Dialog open={sheet} onOpenChange={setSheet}>
          <Sheet>
            <DialogTitle>{s('labels.dialogTitle')}</DialogTitle>
            <DialogDescription>{s('labels.dialogBody')}</DialogDescription>
          </Sheet>
        </Dialog>
      </Section>

      <Section id="status">
        <div className="flex flex-wrap items-center gap-3">
          {LIFECYCLE.map((status) => (
            <StatusBadge key={status} status={status} />
          ))}
          <Badge tone="success">{t('tone.success')}</Badge>
          <Badge tone="warning">{t('tone.warning')}</Badge>
          <Badge tone="danger">{t('tone.danger')}</Badge>
          <ConfidenceChip value={0.97} />
          <ConfidenceChip value={0.78} />
          <ConfidenceChip value={0.52} />
          <SourceTag kind="file">{s('sample.sourceFile')}</SourceTag>
          <SourceTag kind="audio">{s('sample.sourceAudio')}</SourceTag>
          <SourceTag kind="diary">{s('sample.sourceDiary')}</SourceTag>
        </div>
      </Section>

      <Section id="kpi">
        <Cascade className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <CascadeItem>
            <KpiCard
              label={s('sample.kpiContracted')}
              value={3_244_000_000}
              format={(n) => formatMoney(n, { compact: true })}
              icon={<Wallet className="size-4" />}
              trend={[4, 6, 5, 8, 9, 12, 14]}
              delta={{ value: '+2,1%', tone: 'bad', direction: 'up' }}
              footnote={t('kpi.vsPlanned')}
            />
          </CascadeItem>
          <CascadeItem>
            <KpiCard
              label={s('sample.kpiHeadcount')}
              value={78}
              format={(n) => String(Math.round(n))}
              icon={<Building2 className="size-4" />}
              trend={[40, 52, 60, 66, 70, 74, 78]}
              delta={{ value: '+4', tone: 'good', direction: 'up' }}
            />
          </CascadeItem>
          <CascadeItem>
            <KpiCard
              label={s('sample.kpiProgress')}
              value={34}
              format={(n) => formatPercent(n, 1)}
              icon={<Activity className="size-4" />}
              trend={[2, 6, 11, 17, 24, 30, 34]}
              delta={{ value: '−3 pp', tone: 'bad', direction: 'down' }}
            />
          </CascadeItem>
          <CascadeItem>
            <Card className="flex items-center justify-center p-5">
              <ProgressRing value={71} planned={68} size={104}>
                <span className="text-xl font-semibold tnum">71%</span>
              </ProgressRing>
            </Card>
          </CascadeItem>
        </Cascade>
      </Section>

      <Section id="atena">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-4">
            <Card className="flex items-center justify-around p-6">
              <div className="text-center">
                <AtenaOrb size={72} />
                <p className="mt-3 text-sm text-muted-foreground">{s('labels.idle')}</p>
              </div>
              <div className="text-center">
                <AtenaOrb size={72} thinking />
                <p className="mt-3 text-sm text-muted-foreground">{s('labels.thinking')}</p>
              </div>
              <Button variant="atena" onClick={() => setPalette(true)}>
                {s('labels.openBar')}
              </Button>
            </Card>
            <InsightCard
              severity="critical"
              title={s('sample.insightTitleA')}
              body={s('sample.insightBodyA')}
              origin={s('sample.insightOriginA')}
              suggestedAction={s('sample.insightActionA')}
              settled={settled}
              onAccept={() => setSettled('accepted')}
            />
            <InsightCard
              severity="attention"
              title={s('sample.insightTitleB')}
              body={s('sample.insightBodyB')}
              origin={s('sample.insightOriginB')}
            />
          </div>
          <div className="space-y-3">
            <Button onClick={runJob} disabled={job.status === 'running'}>
              {job.status === 'running' ? s('labels.running') : s('labels.run')}
            </Button>
            <JobTracker
              job={job}
              title={s('sample.jobTitle')}
              result={<p className="text-base font-medium">{s('sample.jobResult')}</p>}
            />
          </div>
        </div>
        <CommandPalette
          open={palette}
          onOpenChange={setPalette}
          items={[
            { id: 'works', label: 'Obras', group: 'navigate', onSelect: () => undefined },
            { id: 'budgets', label: 'Orçamentos', group: 'navigate', onSelect: () => undefined },
            { id: 'task', label: 'Nova tarefa', group: 'create', onSelect: () => undefined },
          ]}
          suggestions={[
            'Quanto gastei com hospedagem em Cuiabá?',
            'Abrir orçamento da Casa de Gerador',
            'Quais ASO vencem este mês?',
          ]}
          ask={async () => {
            await new Promise((r) => window.setTimeout(r, 900));
            return {
              ...paletteAnswer,
              actions: [{ label: 'Abrir os custos de Cuiabá', run: () => undefined }],
            };
          }}
        />
      </Section>

      <Section id="flow">
        <Card className="p-6">
          <FlowSteps steps={flowSteps} />
        </Card>
        <Card className="p-6">
          <StepWizard
            current={wizard}
            onStepChange={setWizard}
            onFinish={() => setWizard(0)}
            steps={[
              { id: '1', label: 'Nível e entrada' },
              { id: '2', label: 'Quantitativos' },
              { id: '3', label: 'Resultado' },
            ]}
          >
            <p className="text-base text-muted-foreground">{s('labels.tabContent')}</p>
          </StepWizard>
        </Card>
        <ReviewPanel
          item={{
            id: 'r',
            title: s('labels.reviewTitle'),
            confidence: 0.78,
            sourceKind: 'file',
            sourceLabel: 'Memorial.pdf',
            suggested: s('labels.reviewSuggested'),
          }}
          sourcePreview={s('labels.reviewSource')}
          onApprove={() => push(t('review.done'))}
          onReject={() => push(t('review.done'))}
        />
      </Section>

      <Section id="time">
        <HorizontalTimeline
          tracks={timelineTracks}
          items={timelineItems}
          from={timelineRange.from}
          to={timelineRange.to}
        />
        <GanttChart activities={ganttActivities} maxHeight={420} />
        <Card className="p-5">
          <VerticalTimeline entries={verticalEntries} />
        </Card>
      </Section>

      <Section id="charts">
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>{t('chart.accumulated')}</CardTitle>
            </CardHeader>
            <CardContent>
              <SCurve data={sCurve} todayDate={sCurve.find((p) => p.actual === undefined)?.date} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>{t('histogram.capacity')}</CardTitle>
            </CardHeader>
            <CardContent>
              <Histogram data={histogram.data} roles={histogram.roles} />
            </CardContent>
          </Card>
        </div>
      </Section>

      <Section id="data">
        <DataView<DemoRow>
          rows={rows}
          views={['table', 'cards', 'board', 'timeline', 'calendar']}
          dateOf={(r) => r.due}
          titleOf={(r) => r.name}
          board={{
            stages: STAGES,
            stageOf: (r) => r.stage,
            render: (r) => <span className="text-base font-medium">{r.name}</span>,
          }}
          emptyAction={<Button>{s('labels.emptyAction')}</Button>}
          columns={[
            {
              id: 'name',
              header: s('data.name'),
              cell: (r) => <span className="font-medium">{r.name}</span>,
              sort: (r) => r.name,
            },
            { id: 'client', header: s('data.client'), cell: (r) => r.client, hideOnMobile: true },
            {
              id: 'value',
              header: s('data.value'),
              cell: (r) => formatMoney(r.valueCents, { compact: true }),
              sort: (r) => r.valueCents,
              align: 'right',
            },
            {
              id: 'progress',
              header: s('data.progress'),
              cell: (r) => formatPercent(r.progress),
              sort: (r) => r.progress,
              align: 'right',
            },
            {
              id: 'status',
              header: s('data.status'),
              cell: (r) => <StatusBadge status={r.status} />,
            },
          ]}
        />
      </Section>

      <Section id="board">
        <p className="text-sm text-muted-foreground">{s('labels.explainer')}</p>
        <FunnelBoard
          funnel
          stages={STAGES}
          cards={boardCards}
          render={(c) => (
            <div>
              <p className="text-base font-medium">{c.row.name}</p>
              <p className="text-sm text-muted-foreground">
                {formatMoney(c.row.valueCents, { compact: true })}
              </p>
            </div>
          )}
        />
      </Section>

      <Section id="document">
        <div className="grid gap-6 lg:grid-cols-2">
          <DocumentPage
            identity={{
              name: 'CGA Acabamentos',
              logoText: 'CGA',
              headerNote: 'Obras industriais · Reformas · Serviços civis',
              footerNote: 'CGA Acabamentos e Construções Ltda. · Campo Grande/MS',
            }}
            number="MEM-2026-007"
            blocks={documentBlocks}
          />
          <FileViewer
            name="boletim-medicao-04.pdf"
            kind="pdf"
            url="/demo/files/boletim-medicao-04.pdf"
          />
        </div>
      </Section>

      <Section id="map">
        <MapView className="h-[420px]" markers={markers} routes={routes} />
      </Section>

      <Section id="record">
        <Card className="p-6">
          <RecordShell
            title={s('sample.recordTitle')}
            status="approved"
            crumbs={[{ label: t('record.notes'), to: '/design' }, { label: s('labels.code') }]}
            notes={{ items: notes, onAdd: () => push(t('record.notesAdd')) }}
            attachments={[{ id: 'f1', name: 'boletim-medicao-04.pdf', sizeKb: 612 }]}
            versions={[
              {
                id: 'v1',
                number: 2,
                author: 'Beatriz Nogueira',
                at: documentDate,
                reason: 'Revisão após conferência',
              },
            ]}
            activity={[
              { id: 'a1', who: 'Beatriz', summary: 'aprovou a medição', at: documentDate },
            ]}
          >
            <p className="text-base text-muted-foreground">{s('labels.tabContent')}</p>
          </RecordShell>
        </Card>
      </Section>

      <Section id="states">
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <EmptyState action={<Button variant="outline">{s('labels.emptyAction')}</Button>} />
          </Card>
          <Card>
            <ErrorState onRetry={() => undefined} />
          </Card>
          <Card>
            <OfflineState />
          </Card>
          <SkeletonCard />
          <div className="md:col-span-2">
            <SkeletonRows rows={4} />
          </div>
        </div>
      </Section>
    </div>
  );
}
