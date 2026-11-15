import { Suspense, lazy, useMemo, type ComponentType } from 'react';
import { useSearchParams } from 'react-router';
import { PageHeader } from '@/design/patterns/page-header';
import { SkeletonCard } from '@/design/patterns/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/design/ui/tabs';
import { ConfigTabView } from './config-tab-view';
import type { ConfigTab } from './types';

const customCache = new Map<string, ComponentType>();
function customOf(tab: ConfigTab): ComponentType | undefined {
  if (!tab.Custom) return undefined;
  const key = `${tab.id}:${tab.resource}:${tab.label}`;
  const cached = customCache.get(key);
  if (cached) return cached;
  const created = lazy(tab.Custom);
  customCache.set(key, created);
  return created;
}

/** Página de módulo por configuração (seção 5.5 do manual): cabeçalho, abas e `ConfigTabView` por aba. */
export function ConfigModulePage({
  title,
  description,
  tabs,
}: {
  title: string;
  description: string;
  tabs: ConfigTab[];
}) {
  const [params, setParams] = useSearchParams();
  const requested = params.get('tab');
  const active = tabs.some((t) => t.id === requested) ? (requested ?? '') : (tabs[0]?.id ?? '');
  const customs = useMemo(() => new Map(tabs.map((tab) => [tab.id, customOf(tab)])), [tabs]);
  return (
    <div>
      <PageHeader title={title} description={description} />
      <Tabs value={active} onValueChange={(value) => setParams({ tab: value }, { replace: true })}>
        {tabs.length > 1 && (
          <TabsList>
            {tabs.map((tab) => (
              <TabsTrigger key={tab.id} value={tab.id}>
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        )}
        {tabs.map((tab) => {
          const Custom = customs.get(tab.id);
          return (
            <TabsContent key={tab.id} value={tab.id}>
              {active === tab.id &&
                (Custom ? (
                  <Suspense fallback={<SkeletonCard />}>
                    <Custom />
                  </Suspense>
                ) : (
                  <ConfigTabView tab={tab} />
                ))}
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}
