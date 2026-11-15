import { Check, Printer, Stamp } from 'lucide-react';
import { Link, useParams } from 'react-router';
import { useDirectory } from '@/core/directory/use-directory';
import { useCompany } from '@/core/entities/use-company';
import { useRecordShellData } from '@/core/record/use-record-shell';
import { DocumentPage } from '@/design/patterns/document-page';
import { EmptyState, ErrorState } from '@/design/patterns/empty-state';
import { RecordShell } from '@/design/patterns/record-shell';
import { SkeletonCard } from '@/design/patterns/skeleton';
import { Button } from '@/design/ui/button';
import { useToasts } from '@/design/ui/toast';
import { useAdvanceDocument, useDocument } from '@/modules/engineering/documents/api';
import { t } from '@/modules/engineering/documents/i18n';

/** Detalhe do documento: folha A4 com a identidade da empresa, situação e histórico. */
export default function DocumentDetailPage() {
  const { id } = useParams();
  const doc = useDocument(id);
  const company = useCompany();
  const dir = useDirectory();
  const advance = useAdvanceDocument();
  const push = useToasts((s) => s.push);
  const extras = useRecordShellData('documents', id);
  if (doc.isLoading) return <SkeletonCard />;
  if (doc.isError || !doc.data) {
    return doc.error && 'status' in doc.error && doc.error.status === 404 ? (
      <EmptyState
        illustration="error"
        title={t('detail.notFound')}
        action={
          <Button asChild variant="outline">
            <Link to="/documents">{t('detail.backToList')}</Link>
          </Button>
        }
      />
    ) : (
      <ErrorState onRetry={() => void doc.refetch()} />
    );
  }
  const d = doc.data;
  const next =
    d.status === 'in_review' || d.status === 'draft'
      ? 'approved'
      : d.status === 'approved'
        ? 'issued'
        : null;
  return (
    <RecordShell
      title={d.title}
      description={`${d.number}${d.obraId ? ` · ${dir.name(d.obraId)}` : ''}`}
      status={d.status}
      crumbs={[{ label: t('detail.crumb'), to: '/documents' }, { label: d.number }]}
      actions={
        <>
          {next && (
            <Button
              onClick={() =>
                advance.mutate(
                  { id: d.id, status: next },
                  {
                    onSuccess: () =>
                      push(next === 'issued' ? t('editor.issued') : t('detail.approved')),
                  },
                )
              }
            >
              {next === 'issued' ? <Stamp /> : <Check />}{' '}
              {next === 'issued' ? t('detail.issue') : t('detail.approve')}
            </Button>
          )}
          <Button variant="outline" onClick={() => window.print()}>
            <Printer /> {t('editor.print')}
          </Button>
        </>
      }
      {...extras}
    >
      {company.data && (
        <DocumentPage
          identity={{
            name: company.data.name,
            logoText: company.data.identity.logoText,
            headerNote: company.data.identity.headerNote,
            footerNote: company.data.identity.footerNote,
            accent: company.data.identity.primaryColor,
          }}
          number={d.number}
          blocks={d.blocks}
        />
      )}
    </RecordShell>
  );
}
