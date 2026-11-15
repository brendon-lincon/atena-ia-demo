import { Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router';
import { useUpdate } from '@/core/api/hooks';
import { formatRelative } from '@/core/format';
import { cn } from '@/design/cn';
import { EmptyState, ErrorState } from '@/design/patterns/empty-state';
import { PageHeader } from '@/design/patterns/page-header';
import { SkeletonRows } from '@/design/patterns/skeleton';
import { Segmented } from '@/design/ui/segmented';
import { Input } from '@/design/ui/form';
import { Avatar } from '@/design/ui/misc';
import {
  conversationsApi,
  useConversations,
  useMessages,
} from '@/modules/communication/conversations/api';
import { ContextPanel } from '@/modules/communication/conversations/components/context-panel';
import { Thread } from '@/modules/communication/conversations/components/thread';
import { t } from '@/modules/communication/conversations/i18n';
import { initialsOf } from '@/modules/communication/conversations/initials';

type Filter = 'all' | 'unread' | 'groups';

/** Três colunas: lista de conversas, conversa aberta e painel do contato e da obra. No celular, uma coluna por vez. */
export default function ConversationsPage() {
  const list = useConversations();
  const update = useUpdate(conversationsApi);
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const all = useMemo(() => list.data?.data ?? [], [list.data]);
  const rows = all.filter(
    (c) =>
      (filter === 'all' || (filter === 'unread' ? c.unread > 0 : c.isGroup)) &&
      c.title.toLowerCase().includes(query.toLowerCase()),
  );
  const selectedId = params.get('c');
  const selected = all.find((c) => c.id === selectedId);
  const messages = useMessages(selected?.id);
  const open = (id: string, unread: number) => {
    setParams({ c: id }, { replace: true });
    if (unread > 0) update.mutate({ id, patch: { unread: 0 } });
  };

  return (
    <div>
      <PageHeader
        title={t('title')}
        className="pb-3"
        actions={
          <Segmented
            value={filter}
            onChange={setFilter}
            options={[
              { value: 'all', label: t('all') },
              { value: 'unread', label: t('unread') },
              { value: 'groups', label: t('groups') },
            ]}
          />
        }
      />
      {list.isError ? (
        <ErrorState onRetry={() => void list.refetch()} />
      ) : list.isLoading ? (
        <SkeletonRows />
      ) : all.length === 0 ? (
        <div className="surface-card">
          <EmptyState title={t('emptyTitle')} description={t('emptyDescription')} />
        </div>
      ) : (
        <div className="surface-card grid h-[calc(100vh-14rem)] min-h-[480px] overflow-hidden md:grid-cols-[300px_1fr] xl:grid-cols-[300px_1fr_320px]">
          <div
            className={cn(
              'flex min-h-0 flex-col border-r border-border',
              selected && 'hidden md:flex',
            )}
          >
            <div className="relative border-b border-border p-3">
              <Search className="pointer-events-none absolute top-1/2 left-6 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t('searchPlaceholder')}
                aria-label={t('searchPlaceholder')}
                className="pl-9"
              />
            </div>
            <ul className="scrollbar-thin flex-1 overflow-y-auto">
              {rows.map((c) => (
                <li key={c.id}>
                  <button
                    type="button"
                    onClick={() => open(c.id, c.unread)}
                    className={cn(
                      'flex w-full items-center gap-3 border-b border-border/70 px-3 py-3 text-left transition-colors hover:bg-muted/60',
                      c.id === selected?.id && 'bg-primary-soft',
                    )}
                  >
                    <Avatar initials={initialsOf(c.title)} />
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center justify-between gap-2">
                        <span
                          className={cn(
                            'truncate text-base',
                            c.unread > 0 ? 'font-semibold' : 'font-medium',
                          )}
                        >
                          {c.title}
                        </span>
                        <span className="shrink-0 text-xs text-muted-foreground">
                          {formatRelative(c.lastMessageAt)}
                        </span>
                      </span>
                      <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        {c.labels.slice(0, 2).join(' · ')}
                        {c.unread > 0 && (
                          <span className="ml-auto flex size-5 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground tnum">
                            {c.unread}
                          </span>
                        )}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <div className={cn('min-h-0', !selected && 'hidden md:block')}>
            {selected ? (
              <Thread
                key={selected.id}
                conversation={selected}
                messages={messages.data?.data ?? []}
                loading={messages.isLoading}
                onBack={() => setParams({}, { replace: true })}
              />
            ) : (
              <EmptyState
                illustration="first-steps"
                title={t('selectHint')}
                description={t('selectDescription')}
                className="h-full justify-center"
              />
            )}
          </div>
          {selected && (
            <div className="scrollbar-thin hidden min-h-0 overflow-y-auto border-l border-border bg-muted/30 xl:block">
              <ContextPanel conversation={selected} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
