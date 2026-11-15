import { Link, useParams } from 'react-router';
import { z } from 'zod';
import { useRecord } from '@/core/api/hooks';
import { looseRecord } from '@/core/api/loose';
import { defineResource } from '@/core/api/resource';
import { useDirectory } from '@/core/directory/use-directory';
import { formatKilobytes } from '@/core/format';
import { useRecordShellData } from '@/core/record/use-record-shell';
import { EmptyState, ErrorState } from '@/design/patterns/empty-state';
import { FileViewer } from '@/design/patterns/file-viewer';
import { RecordShell } from '@/design/patterns/record-shell';
import { SkeletonCard } from '@/design/patterns/skeleton';
import { Button } from '@/design/ui/button';
import { f } from '@/modules/knowledge/files/page-i18n';

const fileSchema = looseRecord.extend({
  name: z.string(),
  kind: z.string(),
  sizeKb: z.number(),
  version: z.number(),
  obraId: z.string().nullable().optional(),
  discipline: z.string().optional(),
  url: z.string().nullable().optional(),
  previewUrl: z.string().nullable().optional(),
});
const files = defineResource('files', fileSchema);
const KINDS = { pdf: 'pdf', dxf: 'dxf' } as const;

/** Arquivo com visualizador (PDF e imagem; DXF com prévia estática), versões e vínculos. */
export default function FilePage() {
  const { id } = useParams();
  const file = useRecord(files, id);
  const dir = useDirectory();
  const extras = useRecordShellData('files', id);
  if (file.isLoading) return <SkeletonCard />;
  if (file.isError || !file.data)
    return file.error && 'status' in file.error && file.error.status === 404 ? (
      <EmptyState
        illustration="error"
        title={f('notFound')}
        action={
          <Button asChild variant="outline">
            <Link to="/files">{f('back')}</Link>
          </Button>
        }
      />
    ) : (
      <ErrorState onRetry={() => void file.refetch()} />
    );
  const x = file.data;
  const kind = x.kind in KINDS ? KINDS[x.kind as keyof typeof KINDS] : 'other';
  return (
    <RecordShell
      title={x.name}
      description={`${formatKilobytes(x.sizeKb)} · ${f('version')} ${x.version}${x.obraId ? ` · ${dir.name(x.obraId)}` : ''}`}
      crumbs={[{ label: f('crumb'), to: '/files' }, { label: x.name }]}
      {...extras}
    >
      <FileViewer name={x.name} kind={kind} url={x.url} previewUrl={x.previewUrl} />
    </RecordShell>
  );
}
