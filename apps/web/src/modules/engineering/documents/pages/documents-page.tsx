import { useNavigate, useSearchParams } from 'react-router';
import { useDirectory } from '@/core/directory/use-directory';
import { formatDate } from '@/core/format';
import { DataView } from '@/design/patterns/data-view';
import { PageHeader } from '@/design/patterns/page-header';
import { StatusBadge } from '@/design/patterns/status-badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/design/ui/tabs';
import { useDocuments, type DocumentFull } from '@/modules/engineering/documents/api';
import { AnalyzeTab } from '@/modules/engineering/documents/components/analyze-tab';
import { CreateTab } from '@/modules/engineering/documents/components/create-tab';
import { t } from '@/modules/engineering/documents/i18n';

const TABS = ['issued', 'review', 'create', 'analyze'] as const;

/** Documentos: emitidos, em revisão, novo (galeria por categoria) e análise de documento recebido. */
export default function DocumentsPage() {
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const dir = useDirectory();
  const docs = useDocuments();
  const all = docs.data?.data ?? [];
  const tab = (TABS as readonly string[]).includes(params.get('tab') ?? '')
    ? (params.get('tab') as (typeof TABS)[number])
    : 'issued';
  const table = (rows: DocumentFull[]) => (
    <DataView<DocumentFull>
      rows={rows}
      views={['table', 'cards']}
      loading={docs.isLoading}
      error={docs.isError}
      onRetry={() => void docs.refetch()}
      onRowClick={(d) => void navigate(`/documents/${d.id}`)}
      searchText={(d) => `${d.title} ${d.number} ${dir.name(d.obraId)}`}
      columns={[
        {
          id: 'number',
          header: t('columns.number'),
          cell: (d) => <span className="font-numeric text-sm">{d.number}</span>,
          sort: (d) => d.number,
        },
        {
          id: 'title',
          header: t('columns.title'),
          cell: (d) => <span className="font-medium">{d.title}</span>,
          sort: (d) => d.title,
        },
        {
          id: 'work',
          header: t('columns.work'),
          cell: (d) => dir.name(d.obraId) || t('noWork'),
          hideOnMobile: true,
        },
        {
          id: 'status',
          header: t('columns.status'),
          cell: (d) => <StatusBadge status={d.status} />,
        },
        {
          id: 'date',
          header: t('columns.date'),
          cell: (d) => (d.issuedAt ? formatDate(d.issuedAt) : ''),
          sort: (d) => d.issuedAt ?? '',
        },
      ]}
    />
  );
  return (
    <div>
      <PageHeader title={t('title')} description={t('subtitle')} />
      <Tabs value={tab} onValueChange={(value) => setParams({ tab: value }, { replace: true })}>
        <TabsList>
          {TABS.map((k) => (
            <TabsTrigger key={k} value={k}>
              {t(`tabs.${k}`)}
            </TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value="issued">
          {table(all.filter((d) => d.status === 'issued' || d.status === 'approved'))}
        </TabsContent>
        <TabsContent value="review">
          {table(all.filter((d) => d.status === 'in_review' || d.status === 'draft'))}
        </TabsContent>
        <TabsContent value="create">
          <CreateTab sequence={all.length + 1} />
        </TabsContent>
        <TabsContent value="analyze">
          <AnalyzeTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
