import { Link, useParams, useSearchParams } from 'react-router';
import { useRecordShellData } from '@/core/record/use-record-shell';
import { Contributed } from '@/core/module-registry/contributions';
import { registry } from '@/core/module-registry/registry';
import { EmptyState, ErrorState } from '@/design/patterns/empty-state';
import { RecordShell } from '@/design/patterns/record-shell';
import { SkeletonCard } from '@/design/patterns/skeleton';
import { Button } from '@/design/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/design/ui/tabs';
import { useWork } from '@/modules/works/works/api';
import { CloseoutTab } from '@/modules/works/works/components/closeout-tab';
import { DiaryTab } from '@/modules/works/works/components/diary-tab';
import { EapTab } from '@/modules/works/works/components/eap-tab';
import { IncidentsTab } from '@/modules/works/works/components/incidents-tab';
import { OverviewTab } from '@/modules/works/works/components/overview-tab';
import { PhotosTab } from '@/modules/works/works/components/photos-tab';
import { TeamTab } from '@/modules/works/works/components/team-tab';
import { ThirdTab } from '@/modules/works/works/components/third-tab';
import { TimelineTab } from '@/modules/works/works/components/timeline-tab';
import { WorkHeader } from '@/modules/works/works/components/work-header';
import { t } from '@/modules/works/works/i18n';

const OWN_TABS = [
  'timeline',
  'overview',
  'eap',
  'diary',
  'photos',
  'team',
  'incidents',
  'third',
  'closeout',
] as const;

/** Detalhe da obra: cabeçalho fixo, abas próprias e abas contribuídas por outros módulos. */
export default function WorkPage() {
  const { id } = useParams();
  const work = useWork(id);
  const extras = useRecordShellData('obras', id);
  const [params, setParams] = useSearchParams();
  const contributed = registry.contributions<{ obraId: string }>('work.tabs');
  if (work.isLoading) return <SkeletonCard />;
  if (work.isError || !work.data) {
    return work.error && 'status' in work.error && work.error.status === 404 ? (
      <EmptyState
        illustration="error"
        title={t('detail.notFoundTitle')}
        description={t('detail.notFoundDescription')}
        action={
          <Button asChild variant="outline">
            <Link to="/works">{t('detail.back')}</Link>
          </Button>
        }
      />
    ) : (
      <ErrorState onRetry={() => void work.refetch()} />
    );
  }
  const obra = work.data;
  const tab = params.get('tab') ?? 'timeline';
  const renderers = {
    timeline: <TimelineTab obra={obra} />,
    overview: <OverviewTab obra={obra} />,
    eap: <EapTab obra={obra} />,
    diary: <DiaryTab obra={obra} />,
    photos: <PhotosTab obra={obra} />,
    team: <TeamTab obra={obra} />,
    incidents: <IncidentsTab obra={obra} />,
    third: <ThirdTab obra={obra} />,
    closeout: <CloseoutTab obra={obra} />,
  };
  return (
    <RecordShell
      title={obra.name}
      description={`${obra.code} · ${t(`type.${obra.type}`)}`}
      crumbs={[{ label: t('detail.crumbWorks'), to: '/works' }, { label: obra.code }]}
      {...extras}
    >
      <WorkHeader obra={obra} />
      <Tabs value={tab} onValueChange={(value) => setParams({ tab: value }, { replace: true })}>
        <TabsList>
          {OWN_TABS.map((key) => (
            <TabsTrigger key={key} value={key}>
              {t(`tabs.${key}`)}
            </TabsTrigger>
          ))}
          {contributed.map((c) => (
            <TabsTrigger key={c.id} value={c.id}>
              {c.label}
            </TabsTrigger>
          ))}
        </TabsList>
        {OWN_TABS.map((key) => (
          <TabsContent key={key} value={key}>
            {tab === key && renderers[key]}
          </TabsContent>
        ))}
        {contributed.map((c) => (
          <TabsContent key={c.id} value={c.id}>
            {tab === c.id && <Contributed contribution={c} obraId={obra.id} />}
          </TabsContent>
        ))}
      </Tabs>
    </RecordShell>
  );
}
