import { ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router';
import { registry } from '@/core/module-registry/registry';
import { Cascade, CascadeItem } from '@/design/patterns/cascade';
import { EmptyState } from '@/design/patterns/empty-state';
import { PageHeader } from '@/design/patterns/page-header';
import { Input } from '@/design/ui/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/design/ui/tabs';
import { t } from '@/modules/system/manual/i18n';

const TABS = ['index', 'procedures', 'glossary', 'start', 'news'] as const;
const STEPS = ['one', 'two', 'three', 'four', 'five'] as const;
const TERMS = ['eap', 'bdi', 'cno', 'art', 'aso', 'curvaS', 'caminhoCritico', 'lp'] as const;

/** Manual: índice por módulo, procedimento passo a passo, glossário técnico e primeiros passos. */
export default function ManualPage() {
  const [query, setQuery] = useState('');
  const match = (text: string) => text.toLowerCase().includes(query.trim().toLowerCase());
  const modules = registry.all().filter((m) => match(`${m.label} ${m.description}`));
  const terms = TERMS.filter((k) => match(`${t(`glossary.${k}.term`)} ${t(`glossary.${k}.def`)}`));
  return (
    <div>
      <PageHeader
        title={t('title')}
        description={t('subtitle')}
        actions={
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('search')}
            aria-label={t('search')}
            className="w-72"
          />
        }
      />
      <Tabs defaultValue="index">
        <TabsList>
          {TABS.map((k) => (
            <TabsTrigger key={k} value={k}>
              {t(`tabs.${k}`)}
            </TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value="index">
          {modules.length === 0 ? (
            <EmptyState title={t('emptyTitle')} description={t('emptyDescription')} />
          ) : (
            <Cascade className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {modules.map((m) => (
                <CascadeItem key={m.id}>
                  <Link
                    to={registry.modulePath(m.id)}
                    className="surface-card group flex h-full gap-3 p-4 transition-shadow hover:shadow-md"
                  >
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-primary-soft text-primary">
                      <m.icon className="size-5" />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-base font-semibold">{m.label}</span>
                      <span className="block text-sm text-muted-foreground">{m.description}</span>
                      <span className="mt-1 inline-flex items-center gap-1 text-sm text-primary">
                        {t('open')} <ArrowRight className="size-3.5" />
                      </span>
                    </span>
                  </Link>
                </CascadeItem>
              ))}
            </Cascade>
          )}
        </TabsContent>
        <TabsContent value="procedures">
          <div className="max-w-3xl space-y-4">
            <div>
              <h2 className="text-xl font-semibold tracking-tight">{t('procedure.title')}</h2>
              <p className="text-muted-foreground">{t('procedure.intro')}</p>
            </div>
            <ol className="space-y-3">
              {STEPS.map((k, i) => (
                <li key={k} className="surface-card flex gap-4 p-4">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                    {i + 1}
                  </span>
                  <div>
                    <p className="text-base font-semibold">{t(`procedure.steps.${k}.title`)}</p>
                    <p className="text-base text-muted-foreground">
                      {t(`procedure.steps.${k}.body`)}
                    </p>
                    <div
                      className="mt-3 h-16 rounded-md border border-dashed border-border bg-muted/50"
                      aria-hidden
                    />
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </TabsContent>
        <TabsContent value="glossary">
          {terms.length === 0 ? (
            <EmptyState title={t('emptyTitle')} description={t('emptyDescription')} />
          ) : (
            <dl className="grid max-w-3xl gap-3">
              {terms.map((k) => (
                <div key={k} className="surface-card p-4">
                  <dt className="text-base font-semibold">{t(`glossary.${k}.term`)}</dt>
                  <dd className="text-base text-muted-foreground">{t(`glossary.${k}.def`)}</dd>
                </div>
              ))}
            </dl>
          )}
        </TabsContent>
        <TabsContent value="start">
          <ol className="max-w-2xl space-y-2">
            {(['one', 'two', 'three', 'four', 'five'] as const).map((k, i) => (
              <li key={k} className="surface-card flex items-center gap-3 p-4 text-base">
                <span className="flex size-7 items-center justify-center rounded-full bg-primary-soft text-sm font-semibold">
                  {i + 1}
                </span>
                {t(`start.${k}`)}
              </li>
            ))}
          </ol>
        </TabsContent>
        <TabsContent value="news">
          <ul className="max-w-2xl space-y-2">
            {(['one', 'two'] as const).map((k) => (
              <li key={k} className="surface-card p-4 text-base">
                {t(`news.${k}`)}
              </li>
            ))}
          </ul>
        </TabsContent>
      </Tabs>
    </div>
  );
}
