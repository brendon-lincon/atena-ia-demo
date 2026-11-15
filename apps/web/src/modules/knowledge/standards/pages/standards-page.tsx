import { useSearchParams } from 'react-router';
import { PageHeader } from '@/design/patterns/page-header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/design/ui/tabs';
import { EmailsTab } from '@/modules/knowledge/standards/components/emails-tab';
import { IdentityTab } from '@/modules/knowledge/standards/components/identity-tab';
import { ImportTab } from '@/modules/knowledge/standards/components/import-tab';
import { NumberingTab } from '@/modules/knowledge/standards/components/numbering-tab';
import { TemplatesTab } from '@/modules/knowledge/standards/components/templates-tab';
import { t } from '@/modules/knowledge/standards/i18n';

const TABS = ['identity', 'templates', 'import', 'emails', 'numbering'] as const;

export default function StandardsPage() {
  const [params, setParams] = useSearchParams();
  const tab = (TABS as readonly string[]).includes(params.get('tab') ?? '')
    ? (params.get('tab') as (typeof TABS)[number])
    : 'identity';
  return (
    <div>
      <PageHeader title={t('title')} description={t('subtitle')} />
      <Tabs value={tab} onValueChange={(v) => setParams({ tab: v }, { replace: true })}>
        <TabsList>
          {TABS.map((k) => (
            <TabsTrigger key={k} value={k}>
              {t(`tabs.${k}`)}
            </TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value="identity">
          <IdentityTab />
        </TabsContent>
        <TabsContent value="templates">
          <TemplatesTab />
        </TabsContent>
        <TabsContent value="import">
          <ImportTab />
        </TabsContent>
        <TabsContent value="emails">
          <EmailsTab />
        </TabsContent>
        <TabsContent value="numbering">
          <NumberingTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
