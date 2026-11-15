import { Sparkles } from 'lucide-react';
import { useState } from 'react';
import { useJob, useStartJob } from '@/core/jobs/use-job';
import { EmptyState } from '@/design/patterns/empty-state';
import { JobTracker } from '@/design/patterns/job-tracker';
import { Button } from '@/design/ui/button';
import { Label, Select } from '@/design/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/design/ui/misc';
import { usePdfFiles } from '@/modules/engineering/documents/api';
import { t } from '@/modules/engineering/documents/i18n';

/** Analisar documento recebido: resumo, prazos e pontos de atenção (leitura simulada na demonstração). */
export function AnalyzeTab() {
  const files = usePdfFiles();
  const start = useStartJob();
  const [file, setFile] = useState<string>();
  const [jobId, setJobId] = useState<string>();
  const job = useJob(jobId);
  const list = files.data?.data ?? [];
  if (list.length === 0 && !files.isLoading) return <EmptyState title={t('analyze.none')} />;
  const result =
    job.data?.status === 'done'
      ? (job.data.result as { summary?: string; deadlines?: string[]; risks?: string[] } | null)
      : null;
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>{t('analyze.title')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">{t('analyze.hint')}</p>
          <div className="space-y-1.5">
            <Label htmlFor="file">{t('analyze.file')}</Label>
            <Select
              id="file"
              value={file ?? list[0]?.id ?? ''}
              onChange={(e) => {
                setFile(e.target.value);
                setJobId(undefined);
              }}
            >
              {list.map((f) => (
                <option key={f.id} value={f.id}>
                  {String(f.name)}
                </option>
              ))}
            </Select>
          </div>
          <Button
            variant="atena"
            onClick={() => start.mutate('file-analysis', { onSuccess: (j) => setJobId(j.id) })}
            disabled={start.isPending || (job.data !== undefined && job.data.status !== 'done')}
          >
            <Sparkles /> {t('analyze.run')}
          </Button>
        </CardContent>
      </Card>
      <div className="space-y-4">
        {job.data && <JobTracker job={job.data} title={t('analyze.jobTitle')} />}
        {result && (
          <Card>
            <CardContent className="space-y-4 pt-5">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t('analyze.summary')}</p>
                <p className="text-base">{result.summary}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {t('analyze.deadlines')}
                </p>
                <ul className="list-disc space-y-0.5 pl-5">
                  {result.deadlines?.map((d) => (
                    <li key={d}>{d}</li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t('analyze.risks')}</p>
                <ul className="list-disc space-y-0.5 pl-5">
                  {result.risks?.map((d) => (
                    <li key={d}>{d}</li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
