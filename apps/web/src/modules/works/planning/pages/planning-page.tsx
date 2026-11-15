import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router';
import { PageHeader } from '@/design/patterns/page-header';
import { Select } from '@/design/ui/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/design/ui/tabs';
import { usePlanningData } from '@/modules/works/planning/api';
import { GanttTab } from '@/modules/works/planning/components/gantt-tab';
import { FinancialTab, SCurveTab } from '@/modules/works/planning/components/curves-tabs';
import { MobilizationTab } from '@/modules/works/planning/components/mobilization-tab';
import { MultiTab } from '@/modules/works/planning/components/multi-tab';
import { ResourcesTab } from '@/modules/works/planning/components/resources-tab';
import { ScenariosTab } from '@/modules/works/planning/components/scenarios-tab';
import { SizingTab } from '@/modules/works/planning/components/sizing-tab';
import { t } from '@/modules/works/planning/i18n';

const TABS = [
  'gantt',
  'financial',
  'scurve',
  'multi',
  'resources',
  'sizing',
  'mobilization',
  'scenarios',
] as const;
const NEEDS_WORK = new Set<string>(['gantt', 'financial', 'scurve', 'scenarios']);

/** Planejamento da empresa (todas as obras). O mesmo conteúdo é entregue como aba da obra. */
export default function PlanningPage({ obraId: fixed }: { obraId?: string }) {
  const [params, setParams] = useSearchParams();
  const [chosen, setChosen] = useState<string>();
  const [now] = useState(() => new Date());
  const data = usePlanningData(fixed ?? chosen);
  const obras = useMemo(() => data.obras.data?.data ?? [], [data.obras.data]);
  const active = obras.filter((o) => o.status !== 'mobilizing');
  const obraId =
    fixed ?? chosen ?? active.find((o) => o.code === 'OB-2026-014')?.id ?? active[0]?.id;
  const obra = obras.find((o) => o.id === obraId);
  const scoped = usePlanningData(obraId);
  const tab = params.get('tab') ?? 'gantt';
  const tabs = fixed ? (['gantt', 'scurve', 'financial'] as const) : TABS;
  const groupOf = useMemo(() => {
    const eap = scoped.eap.data?.data ?? [];
    return (a: { eapItemId?: string | null }) => {
      const leaf = eap.find((e) => e.id === a.eapItemId);
      return eap.find((e) => e.id === leaf?.parentId)?.name ?? '';
    };
  }, [scoped.eap.data]);
  const activities = scoped.activities.data?.data ?? [];
  const eap = scoped.eap.data?.data ?? [];
  const content = (
    <Tabs
      value={tabs.includes(tab as never) ? tab : 'gantt'}
      onValueChange={(value) => setParams({ tab: value }, { replace: true })}
    >
      <TabsList>
        {tabs.map((key) => (
          <TabsTrigger key={key} value={key}>
            {t(`tabs.${key}`)}
          </TabsTrigger>
        ))}
      </TabsList>
      <TabsContent value="gantt">
        <GanttTab activities={activities} groupOf={groupOf} loading={scoped.activities.isLoading} />
      </TabsContent>
      <TabsContent value="financial">
        <FinancialTab activities={activities} eap={eap} />
      </TabsContent>
      <TabsContent value="scurve">
        <SCurveTab activities={activities} eap={eap} today={now} />
      </TabsContent>
      {!fixed && (
        <TabsContent value="multi">
          <MultiTab obras={obras} />
        </TabsContent>
      )}
      {!fixed && (
        <TabsContent value="resources">
          <ResourcesTab
            allocations={data.allocations.data?.data ?? []}
            employees={data.employees.data?.data ?? []}
          />
        </TabsContent>
      )}
      {!fixed && (
        <TabsContent value="sizing">
          <SizingTab />
        </TabsContent>
      )}
      {!fixed && (
        <TabsContent value="mobilization">
          <MobilizationTab />
        </TabsContent>
      )}
      {!fixed && obra && (
        <TabsContent value="scenarios">
          <ScenariosTab obra={obra} />
        </TabsContent>
      )}
    </Tabs>
  );
  if (fixed) return content;
  return (
    <div>
      <PageHeader
        title={t('title')}
        description={t('subtitle')}
        actions={
          NEEDS_WORK.has(tab) && (
            <Select
              value={obraId ?? ''}
              onChange={(e) => setChosen(e.target.value)}
              aria-label={t('selectWork')}
              className="w-72"
            >
              {active.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name}
                </option>
              ))}
            </Select>
          )
        }
      />
      {content}
    </div>
  );
}
