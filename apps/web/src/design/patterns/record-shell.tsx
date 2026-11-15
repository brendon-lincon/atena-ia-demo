import { CircleHelp, FileText, History, NotebookPen, Activity } from 'lucide-react';
import type { ReactNode } from 'react';
import { createT } from '@/core/i18n/create-t';
import { messages } from '@/core/i18n/messages';
import { formatDateTime, formatKilobytes, formatRelative } from '@/core/format';
import { Popover, PopoverContent, PopoverTrigger } from '@/design/ui/overlay';
import { Button } from '@/design/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/design/ui/tabs';
import { EmptyState } from './empty-state';
import { NotesPanel, type NoteItem } from './notes-panel';
import { PageHeader, type Crumb } from './page-header';
import { ShareMenu } from './share-menu';
import { StatusBadge, type Lifecycle } from './status-badge';

const t = createT(messages);
export interface AttachmentItem {
  id: string;
  name: string;
  sizeKb: number;
  href?: string;
}
export interface VersionItem {
  id: string;
  number: number;
  author: string;
  at: string;
  reason: string;
}
export interface ActivityItem {
  id: string;
  who: string;
  summary: string;
  at: string;
}

export interface RecordShellProps {
  title: string;
  description?: string;
  crumbs?: Crumb[];
  status?: Lifecycle;
  actions?: ReactNode;
  notes?: { items: NoteItem[]; onAdd?: (body: string) => void };
  attachments?: AttachmentItem[];
  versions?: VersionItem[];
  activity?: ActivityItem[];
  helpText?: string;
  shareSubject?: string;
  children: ReactNode;
}

/** Moldura de todo detalhe: notas, anexos, versões, atividade, compartilhar e ajuda em um único componente. */
export function RecordShell({
  title,
  description,
  crumbs,
  status,
  actions,
  notes,
  attachments = [],
  versions = [],
  activity = [],
  helpText,
  shareSubject,
  children,
}: RecordShellProps) {
  return (
    <div>
      <PageHeader
        title={title}
        description={description}
        crumbs={crumbs}
        meta={status && <StatusBadge status={status} />}
        actions={
          <>
            {actions}
            <ShareMenu subject={shareSubject ?? title} />
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" aria-label={t('record.help')}>
                  <CircleHelp />
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end">
                <p className="text-sm text-muted-foreground">{helpText ?? t('record.helpText')}</p>
              </PopoverContent>
            </Popover>
          </>
        }
      />
      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="min-w-0">{children}</div>
        <aside className="surface-card p-4">
          <Tabs defaultValue="notes">
            <TabsList>
              <TabsTrigger value="notes" aria-label={t('record.notes')}>
                <NotebookPen className="size-4" />
                <span className="hidden 2xl:inline">{t('record.notes')}</span>
              </TabsTrigger>
              <TabsTrigger value="attachments" aria-label={t('record.attachments')}>
                <FileText className="size-4" />
                <span className="hidden 2xl:inline">{t('record.attachments')}</span>
              </TabsTrigger>
              <TabsTrigger value="versions" aria-label={t('record.versions')}>
                <History className="size-4" />
                <span className="hidden 2xl:inline">{t('record.versions')}</span>
              </TabsTrigger>
              <TabsTrigger value="activity" aria-label={t('record.activity')}>
                <Activity className="size-4" />
                <span className="hidden 2xl:inline">{t('record.activity')}</span>
              </TabsTrigger>
            </TabsList>
            <TabsContent value="notes">
              <NotesPanel notes={notes?.items ?? []} onAdd={notes?.onAdd} />
            </TabsContent>
            <TabsContent value="attachments">
              {attachments.length === 0 ? (
                <EmptyState title={t('record.attachmentsEmpty')} className="py-6" />
              ) : (
                <ul className="space-y-2">
                  {attachments.map((file) => (
                    <li
                      key={file.id}
                      className="flex items-center gap-3 rounded-md border border-border p-2.5 text-sm"
                    >
                      <FileText className="size-4 shrink-0 text-muted-foreground" />
                      <span className="min-w-0 flex-1 truncate">{file.name}</span>
                      <span className="tnum text-xs text-muted-foreground">
                        {formatKilobytes(file.sizeKb)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </TabsContent>
            <TabsContent value="versions">
              {versions.length === 0 ? (
                <EmptyState title={t('record.versionsEmpty')} className="py-6" />
              ) : (
                <ol className="space-y-3 border-l border-border pl-4">
                  {versions.map((version) => (
                    <li key={version.id} className="relative text-sm">
                      <span className="absolute top-1.5 -left-[21px] size-2.5 rounded-full border-2 border-surface bg-primary" />
                      <p className="font-medium">
                        {t('record.version', { number: version.number })}
                      </p>
                      <p className="text-muted-foreground">{version.reason}</p>
                      <p className="text-xs text-muted-foreground">
                        {version.author} · {formatDateTime(version.at)}
                      </p>
                    </li>
                  ))}
                </ol>
              )}
            </TabsContent>
            <TabsContent value="activity">
              {activity.length === 0 ? (
                <EmptyState title={t('record.activityEmpty')} className="py-6" />
              ) : (
                <ul className="space-y-3">
                  {activity.map((entry) => (
                    <li key={entry.id} className="text-sm">
                      <p>
                        <span className="font-medium">{entry.who}</span> {entry.summary}
                      </p>
                      <p className="text-xs text-muted-foreground">{formatRelative(entry.at)}</p>
                    </li>
                  ))}
                </ul>
              )}
            </TabsContent>
          </Tabs>
        </aside>
      </div>
    </div>
  );
}
