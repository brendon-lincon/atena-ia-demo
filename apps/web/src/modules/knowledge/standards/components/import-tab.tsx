import { useEffect, useRef, useState } from 'react';
import { useCreate } from '@/core/api/hooks';
import { useJob, useStartJob } from '@/core/jobs/use-job';
import { JobTracker } from '@/design/patterns/job-tracker';
import { Button } from '@/design/ui/button';
import { Input, Label } from '@/design/ui/form';
import { useToasts } from '@/design/ui/toast';
import { templatesApi } from '@/modules/knowledge/standards/api';
import { t } from '@/modules/knowledge/standards/i18n';

/** Importar modelo próprio: a Atena identifica os campos e o sistema monta o modelo (simulado com acompanhamento de tarefa). */
export function ImportTab() {
  const start = useStartJob();
  const create = useCreate(templatesApi);
  const push = useToasts((s) => s.push);
  const [name, setName] = useState('');
  const [jobId, setJobId] = useState<string>();
  const job = useJob(jobId);
  const saved = useRef(false);
  const done = job.data?.status === 'done';
  const count = (job.data?.result as { fieldsDetected?: number } | null)?.fieldsDetected ?? 0;
  const { mutate } = create;
  useEffect(() => {
    if (!done || saved.current) return;
    saved.current = true;
    mutate(
      {
        name,
        category: 'avulso',
        description: name,
        system: false,
        blocks: [
          { type: 'heading', text: name },
          { type: 'paragraph', text: t('import.body') },
        ],
        fields: [
          { key: 'responsavel', label: 'Responsável' },
          { key: 'data', label: 'Data' },
          { key: 'obra', label: 'Obra' },
        ],
      },
      { onSuccess: () => push(t('import.done', { count })) },
    );
  }, [done, mutate, name, push, count]);
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <div className="surface-card space-y-4 p-5">
        <h3 className="text-lg font-semibold tracking-tight">{t('import.title')}</h3>
        <p className="text-sm text-muted-foreground">{t('import.hint')}</p>
        <div className="space-y-1.5">
          <Label htmlFor="imp-file">{t('import.file')}</Label>
          <Input id="imp-file" type="file" accept=".docx,.pdf" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="imp-name">{t('import.name')}</Label>
          <Input id="imp-name" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <Button
          disabled={!name.trim() || Boolean(jobId)}
          onClick={() => start.mutate('template-import', { onSuccess: (j) => setJobId(j.id) })}
        >
          {t('import.run')}
        </Button>
      </div>
      {job.data && <JobTracker job={job.data} title={t('import.jobTitle')} />}
    </div>
  );
}
