import { FileText, Printer, Save, Sparkles, Stamp } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { useList } from '@/core/api/hooks';
import { useDirectory } from '@/core/directory/use-directory';
import { contracts, eapItems } from '@/core/entities';
import { useCompany } from '@/core/entities/use-company';
import { useJob, useStartJob } from '@/core/jobs/use-job';
import { DocumentPage } from '@/design/patterns/document-page';
import { JobTracker } from '@/design/patterns/job-tracker';
import { SkeletonCard } from '@/design/patterns/skeleton';
import { SourceTag } from '@/design/patterns/source-tag';
import { Button } from '@/design/ui/button';
import { Input, Label, Select, Textarea } from '@/design/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/design/ui/misc';
import { useToasts } from '@/design/ui/toast';
import { useSaveDocument, useTemplates, type Template } from '@/modules/engineering/documents/api';
import { t } from '@/modules/engineering/documents/i18n';
import {
  autofill,
  fieldKeys,
  flatten,
  toBlocks,
  type FieldValue,
} from '@/modules/engineering/documents/lib/fill';

const CATEGORIES = ['engineering', 'obra', 'legal', 'avulso'] as const;

/** Novo documento: galeria por categoria → a Atena preenche → editor de revisão em duas colunas. */
export function CreateTab({ sequence }: { sequence: number }) {
  const templates = useTemplates();
  const dir = useDirectory();
  const company = useCompany();
  const navigate = useNavigate();
  const push = useToasts((s) => s.push);
  const save = useSaveDocument();
  const start = useStartJob();
  const [template, setTemplate] = useState<Template>();
  const [obraId, setObraId] = useState<string>();
  const [jobId, setJobId] = useState<string>();
  const [edits, setEdits] = useState<Record<string, FieldValue>>({});
  const [today] = useState(() => new Date());
  const job = useJob(jobId);
  const obra = dir.obras.find(
    (o) =>
      o.id === (obraId ?? dir.obras.find((x) => x.code === 'OB-2026-014')?.id ?? dir.obras[0]?.id),
  );
  const fronts = useList(
    eapItems,
    { filter: { obraId: obra?.id ?? '', level: 'front' }, pageSize: 50 },
    { enabled: Boolean(obra) },
  );
  const contract = useList(
    contracts,
    { filter: { obraId: obra?.id ?? '', kind: 'client' } },
    { enabled: Boolean(obra) },
  );

  const jobDone = job.data?.status === 'done';
  const base = useMemo(() => {
    if (!jobDone || !template || !company.data) return undefined;
    const client = dir.contacts.find((c) => c.id === obra?.clientId);
    return autofill({
      obra,
      client,
      company: company.data,
      contract: contract.data?.data[0],
      fronts: fronts.data?.data ?? [],
      today,
      sequence,
    });
  }, [
    jobDone,
    template,
    company.data,
    dir.contacts,
    obra,
    contract.data,
    fronts.data,
    today,
    sequence,
  ]);
  const values = useMemo(() => (base ? { ...base, ...edits } : undefined), [base, edits]);
  const keys = useMemo(() => (template ? fieldKeys(template.blocks) : []), [template]);
  const blocks = useMemo(
    () => (template && values ? toBlocks(template, values) : []),
    [template, values],
  );

  const run = () => {
    if (!template || !company.data) return;
    start.mutate('document-fill', {
      onSuccess: (created) => {
        setJobId(created.id);
      },
    });
  };
  const persist = (status: 'in_review' | 'issued') => {
    if (!template) return;
    save.mutate(
      {
        templateId: template.id,
        obraId: obra?.id ?? null,
        type: template.id.split(':').pop() ?? 'doc',
        title: `${template.name}${obra ? ` — ${obra.name}` : ''}`,
        number: values?.numero?.value ?? '',
        version: 1,
        status,
        issuedAt: status === 'issued' ? today.toISOString().slice(0, 10) : null,
        blocks: flatten(blocks),
      },
      {
        onSuccess: (doc) => {
          push(status === 'issued' ? t('editor.issued') : t('editor.saved'));
          void navigate(`/documents/${doc.id}`);
        },
      },
    );
  };

  if (templates.isLoading) return <SkeletonCard />;
  if (!template) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">{t('gallery.title')}</h2>
          <p className="text-muted-foreground">{t('gallery.hint')}</p>
        </div>
        {CATEGORIES.map((category) => {
          const list = (templates.data?.data ?? []).filter((x) => x.category === category);
          if (list.length === 0) return null;
          return (
            <section key={category} className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground">
                {t(`categories.${category}`)}
              </h3>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {list.map((x) => (
                  <button
                    key={x.id}
                    type="button"
                    onClick={() => {
                      setTemplate(x);
                      setEdits({});
                    }}
                    className="surface-card flex gap-3 p-4 text-left transition-[box-shadow,transform] hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-primary-soft text-primary">
                      <FileText className="size-5" />
                    </span>
                    <span>
                      <span className="block text-base font-semibold">{x.name}</span>
                      <span className="block text-sm text-muted-foreground">{x.description}</span>
                      <span className="mt-1 block text-xs text-muted-foreground">
                        {t('gallery.fields', { count: fieldKeys(x.blocks).length })}
                      </span>
                    </span>
                  </button>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    );
  }

  if (!values) {
    return (
      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{template.name}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">{template.description}</p>
            <div className="space-y-1.5">
              <Label htmlFor="work">{t('setup.work')}</Label>
              <Select
                id="work"
                value={obra?.id ?? ''}
                onChange={(e) => setObraId(e.target.value)}
                disabled={Boolean(jobId)}
              >
                {dir.obras.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.name}
                  </option>
                ))}
              </Select>
            </div>
            <div className="flex gap-2">
              <Button variant="atena" onClick={run} disabled={Boolean(jobId) || !company.data}>
                <Sparkles /> {t('setup.fill')}
              </Button>
              <Button
                variant="ghost"
                onClick={() => setTemplate(undefined)}
                disabled={Boolean(jobId)}
              >
                {t('setup.change')}
              </Button>
            </div>
          </CardContent>
        </Card>
        {job.data && <JobTracker job={job.data} title={t('setup.jobTitle')} />}
      </div>
    );
  }

  const filled = keys.filter((k) => values[k]?.value).length;
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        {t('editor.rule')} · {t('setup.done', { filled, review: keys.length - filled })}
      </p>
      <div className="grid gap-6 xl:grid-cols-[1.3fr_1fr]">
        {company.data && (
          <DocumentPage
            identity={{
              name: company.data.name,
              logoText: company.data.identity.logoText,
              headerNote: company.data.identity.headerNote,
              footerNote: company.data.identity.footerNote,
              accent: company.data.identity.primaryColor,
            }}
            number={values.numero?.value}
            blocks={blocks}
          />
        )}
        <Card className="h-fit">
          <CardHeader>
            <CardTitle>{t('editor.fields')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {keys.map((key) => {
              const field = values[key];
              const long =
                (field?.value.length ?? 0) > 60 ||
                [
                  'servicos',
                  'ocorrencias',
                  'constatacoes',
                  'conclusao',
                  'parecer',
                  'encaminhamentos',
                  'texto',
                  'descricao',
                ].includes(key);
              const Control = long ? Textarea : Input;
              return (
                <div key={key} className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <Label htmlFor={`f-${key}`}>{t(`fieldLabels.${key as 'obra'}`)}</Label>
                    {field?.origin ? (
                      <SourceTag kind="file">{t(`origins.${field.origin}`)}</SourceTag>
                    ) : (
                      <span className="text-xs text-warning-text">{t('editor.pending')}</span>
                    )}
                  </div>
                  <Control
                    id={`f-${key}`}
                    value={field?.value ?? ''}
                    onChange={(e) =>
                      setEdits((cur) => ({
                        ...cur,
                        [key]: { value: e.target.value, origin: null },
                      }))
                    }
                  />
                </div>
              );
            })}
            <div className="flex flex-wrap gap-2 border-t border-border pt-4">
              <Button onClick={() => persist('issued')} disabled={save.isPending}>
                <Stamp /> {t('editor.approve')}
              </Button>
              <Button
                variant="outline"
                onClick={() => persist('in_review')}
                disabled={save.isPending}
              >
                <Save /> {t('editor.saveDraft')}
              </Button>
              <Button variant="ghost" onClick={() => window.print()}>
                <Printer /> {t('editor.print')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
