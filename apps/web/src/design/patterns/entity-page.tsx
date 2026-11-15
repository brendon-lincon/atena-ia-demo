import type { ReactNode } from 'react';
import { Dialog, DialogTitle, Sheet } from '@/design/ui/overlay';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/design/ui/tabs';
import { PageHeader, type Crumb } from './page-header';

export interface EntityTab {
  value: string;
  label: string;
  icon?: ReactNode;
  content: ReactNode;
}

/** Página de módulo por configuração: cabeçalho, abas e detalhe lateral. Renderiza qualquer aba descrita no manifesto. */
export function EntityPage({
  title,
  description,
  crumbs,
  actions,
  tabs,
  value,
  onValueChange,
  detail,
}: {
  title: string;
  description?: string;
  crumbs?: Crumb[];
  actions?: ReactNode;
  tabs: EntityTab[];
  value?: string;
  onValueChange?: (value: string) => void;
  detail?: { open: boolean; title: string; onClose: () => void; content: ReactNode };
}) {
  return (
    <div>
      <PageHeader
        title={title}
        description={description}
        crumbs={crumbs}
        actions={actions}
        className="pb-3"
      />
      <Tabs value={value} defaultValue={tabs[0]?.value} onValueChange={onValueChange}>
        {tabs.length > 1 && (
          <TabsList>
            {tabs.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value}>
                {tab.icon}
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        )}
        {tabs.map((tab) => (
          <TabsContent key={tab.value} value={tab.value}>
            {tab.content}
          </TabsContent>
        ))}
      </Tabs>
      {detail && (
        <Dialog open={detail.open} onOpenChange={(open) => !open && detail.onClose()}>
          <Sheet className="max-w-xl">
            <DialogTitle>{detail.title}</DialogTitle>
            {detail.content}
          </Sheet>
        </Dialog>
      )}
    </div>
  );
}
