import { BookMarked, ChevronRight, FileCheck2, Quote } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router';
import { useCreate } from '@/core/api/hooks';
import { useDirectory } from '@/core/directory/use-directory';
import { formatDate } from '@/core/format';
import { useJob, useStartJob } from '@/core/jobs/use-job';
import { cn } from '@/design/cn';
import { EmptyState, ErrorState } from '@/design/patterns/empty-state';
import { JobTracker } from '@/design/patterns/job-tracker';
import { PageHeader } from '@/design/patterns/page-header';
import { SkeletonRows } from '@/design/patterns/skeleton';
import { SourceTag } from '@/design/patterns/source-tag';
import { Button } from '@/design/ui/button';
import { Checkbox, Input, Label, Select } from '@/design/ui/form';
import { Badge } from '@/design/ui/misc';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/design/ui/tabs';
import { useToasts } from '@/design/ui/toast';
import { libraryApi, useLibrary, type LibraryItem } from '@/modules/knowledge/library/api';
import { t } from '@/modules/knowledge/library/i18n';

const TABS = ['consult', 'applicable', 'checklists', 'updates', 'upload'] as const;
const AREAS = ['technical', 'regulatory', 'legal', 'checklist', 'company'] as const;

function DocCard({ item }: { item: LibraryItem }) {
  const push = useToasts((s) => s.push);
  return (
    <article className="surface-card space-y-2 p-4">
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone="info">{t(`kinds.${item.kind as 'norm'}`)}</Badge>
        <span className="font-numeric text-sm font-medium">{item.code}</span>
        <Badge tone="success">{t('current')}</Badge>
        {item.hasFile && <SourceTag kind="file">{t('hasFile')}</SourceTag>}
      </div>
      <h3 className="text-lg leading-snug font-semibold tracking-tight">{item.title}</h3>
      <p className="text-base text-muted-foreground">{item.summary}</p>
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-2 text-sm text-muted-foreground">
        <span>
          {t('version')}: {item.version} ·{' '}
          {t('effective', { date: formatDate(item.effectiveFrom) })} · {t('source')}: {item.source}
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            void navigator.clipboard.writeText(
              `${item.code} — ${item.title} (${item.issuer}; ${item.source})`,
            );
            push(t('cited'));
          }}
        >
          <Quote /> {t('cite')}
        </Button>
      </div>
    </article>
  );
}

function Checklist({ item }: { item: LibraryItem }) {
  const steps = item.summary
    .replace(/\.$/, '')
    .split(/,\s| e /)
    .map((s) => s.trim())
    .filter(Boolean);
  const [done, setDone] = useState<Set<number>>(new Set());
  return (
    <article className="surface-card space-y-3 p-4">
      <h3 className="flex items-center gap-2 text-lg font-semibold tracking-tight">
        <FileCheck2 className="size-5 text-primary" />
        {item.title}
      </h3>
      <ul className="space-y-2">
        {steps.map((s, i) => (
          <li key={s} className="flex items-center gap-2.5 text-base">
            <Checkbox
              id={`${item.id}-${i}`}
              checked={done.has(i)}
              onCheckedChange={(v) =>
                setDone((cur) => {
                  const next = new Set(cur);
                  if (v === true) next.add(i);
                  else next.delete(i);
                  return next;
                })
              }
            />
            <Label
              htmlFor={`${item.id}-${i}`}
              className={cn('font-normal', done.has(i) && 'text-muted-foreground line-through')}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </Label>
          </li>
        ))}
      </ul>
      <p className="tnum text-sm text-muted-foreground">
        {t('checklistDone', { done: done.size, total: steps.length })}
      </p>
    </article>
  );
}

function UploadTab() {
  const create = useCreate(libraryApi);
  const start = useStartJob();
  const push = useToasts((s) => s.push);
  const [jobId, setJobId] = useState<string>();
  const job = useJob(jobId);
  const [code, setCode] = useState('');
  const [title, setTitle] = useState('');
  const [area, setArea] = useState<(typeof AREAS)[number]>('technical');
  const saved = useRef(false);
  const done = job.data?.status === 'done';
  const { mutate } = create;
  useEffect(() => {
    if (!done || saved.current) return;
    saved.current = true;
    mutate(
      {
        area,
        areaLabel: t(`areas.${area}`),
        subarea: 'Enviadas pelo usuário',
        code,
        title,
        issuer: '—',
        kind: area === 'technical' ? 'norm' : 'law',
        source: 'Enviada pelo usuário',
        summary: t('upload.result', { pages: 48 }),
        version: 'Cópia do usuário',
        effectiveFrom: new Date().toISOString().slice(0, 10),
        status: 'current',
        hasFile: true,
        appliesTo: { obraTypes: ['industrial_new', 'renovation', 'subcontract'], states: [] },
      },
      { onSuccess: () => push(t('upload.done')) },
    );
  }, [done, mutate, area, code, title, push]);
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <div className="surface-card space-y-4 p-5">
        <p className="text-sm text-muted-foreground">{t('upload.hint')}</p>
        <div className="space-y-1.5">
          <Label htmlFor="up-file">{t('upload.file')}</Label>
          <Input id="up-file" type="file" accept="application/pdf" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="up-code">{t('upload.code')}</Label>
          <Input id="up-code" value={code} onChange={(e) => setCode(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="up-title">{t('upload.title')}</Label>
          <Input id="up-title" value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="up-area">{t('upload.area')}</Label>
          <Select
            id="up-area"
            value={area}
            onChange={(e) => setArea(e.target.value as typeof area)}
          >
            {AREAS.map((a) => (
              <option key={a} value={a}>
                {t(`areas.${a}`)}
              </option>
            ))}
          </Select>
        </div>
        <Button
          disabled={!code.trim() || !title.trim() || Boolean(jobId)}
          onClick={() => start.mutate('norm-upload', { onSuccess: (j) => setJobId(j.id) })}
        >
          {t('upload.send')}
        </Button>
      </div>
      {job.data && <JobTracker job={job.data} title={t('upload.jobTitle')} />}
    </div>
  );
}

/** Biblioteca: árvore área → subárea, consulta com citação da fonte, aplicabilidade por obra, checklists e atualizações. */
export default function LibraryPage() {
  const list = useLibrary();
  const dir = useDirectory();
  const [params, setParams] = useSearchParams();
  const [area, setArea] = useState<string>('');
  const [sub, setSub] = useState<string>('');
  const [query, setQuery] = useState('');
  const [work, setWork] = useState('');
  const tab = (TABS as readonly string[]).includes(params.get('tab') ?? '')
    ? (params.get('tab') as (typeof TABS)[number])
    : 'consult';
  const all = useMemo(() => list.data?.data ?? [], [list.data]);
  const obra = dir.obras.find((o) => o.id === (work || dir.obras[0]?.id));
  const filtered = all.filter(
    (i) =>
      (!area || i.area === area) &&
      (!sub || i.subarea === sub) &&
      `${i.code} ${i.title} ${i.summary}`.toLowerCase().includes(query.toLowerCase()),
  );
  const applicable = all.filter((i) => obra && i.appliesTo.obraTypes.includes(obra.type));
  const checklists = all.filter((i) => i.kind === 'checklist');
  const updates = [...all]
    .sort((a, b) => b.effectiveFrom.localeCompare(a.effectiveFrom))
    .slice(0, 12);
  const grouped = AREAS.map((a) => ({
    id: a,
    subs: [...new Set(all.filter((i) => i.area === a).map((i) => i.subarea))].sort(),
  }));

  const body = (items: LibraryItem[]) =>
    list.isLoading ? (
      <SkeletonRows />
    ) : items.length === 0 ? (
      <EmptyState title={t('emptyTitle')} description={t('emptyDescription')} />
    ) : (
      <div className="grid gap-3 xl:grid-cols-2">
        {items.map((i) => (
          <DocCard key={i.id} item={i} />
        ))}
      </div>
    );
  return (
    <div>
      <PageHeader title={t('title')} description={t('subtitle')} />
      {list.isError ? (
        <ErrorState onRetry={() => void list.refetch()} />
      ) : (
        <Tabs value={tab} onValueChange={(v) => setParams({ tab: v }, { replace: true })}>
          <TabsList>
            {TABS.map((k) => (
              <TabsTrigger key={k} value={k}>
                {t(`tabs.${k}`)}
              </TabsTrigger>
            ))}
          </TabsList>
          <TabsContent value="consult">
            <div className="grid gap-5 lg:grid-cols-[260px_1fr]">
              <nav aria-label={t('allAreas')} className="surface-card h-fit space-y-0.5 p-2">
                <button
                  type="button"
                  onClick={() => {
                    setArea('');
                    setSub('');
                  }}
                  className={cn(
                    'flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-base hover:bg-muted',
                    !area && 'bg-primary-soft font-medium',
                  )}
                >
                  <BookMarked className="size-4" />
                  {t('allAreas')}
                  <span className="tnum ml-auto text-sm text-muted-foreground">{all.length}</span>
                </button>
                {grouped.map((g) => (
                  <div key={g.id}>
                    <button
                      type="button"
                      onClick={() => {
                        setArea(g.id);
                        setSub('');
                      }}
                      className={cn(
                        'flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-base hover:bg-muted',
                        area === g.id && !sub && 'bg-primary-soft font-medium',
                      )}
                    >
                      <ChevronRight
                        className={cn('size-4 transition-transform', area === g.id && 'rotate-90')}
                      />
                      {t(`areas.${g.id}`)}
                    </button>
                    {area === g.id && (
                      <ul className="ml-6 border-l border-border pl-2">
                        {g.subs.map((s) => (
                          <li key={s}>
                            <button
                              type="button"
                              onClick={() => setSub(s)}
                              className={cn(
                                'w-full rounded-sm px-2 py-1.5 text-left text-sm hover:bg-muted',
                                sub === s && 'bg-primary-soft font-medium',
                              )}
                            >
                              {s}
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </nav>
              <div className="space-y-4">
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={t('search')}
                  aria-label={t('search')}
                />
                {body(filtered)}
              </div>
            </div>
          </TabsContent>
          <TabsContent value="applicable">
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">{t('applicableHint')}</p>
              <Select
                value={obra?.id ?? ''}
                onChange={(e) => setWork(e.target.value)}
                aria-label={t('workPicker')}
                className="max-w-sm"
              >
                {dir.obras.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.name}
                  </option>
                ))}
              </Select>
              {body(applicable)}
            </div>
          </TabsContent>
          <TabsContent value="checklists">
            <div className="grid gap-3 lg:grid-cols-2">
              {checklists.map((c) => (
                <Checklist key={c.id} item={c} />
              ))}
            </div>
          </TabsContent>
          <TabsContent value="updates">
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">{t('updatesHint')}</p>
              {body(updates)}
            </div>
          </TabsContent>
          <TabsContent value="upload">
            <UploadTab />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
