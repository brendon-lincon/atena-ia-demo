import { Link } from 'react-router';
import { useList } from '@/core/api/hooks';
import { formatRelative } from '@/core/format';
import { EmptyState } from '@/design/patterns/empty-state';
import { SkeletonRows } from '@/design/patterns/skeleton';
import { Badge } from '@/design/ui/misc';
import { conversationsApi } from '@/modules/communication/conversations/api';
import { t } from '@/modules/communication/conversations/i18n';

/** Aba "Conversas" da obra: as conversas vinculadas, abrindo no módulo. */
export default function WorkConversationsTab({ obraId }: { obraId: string }) {
  const list = useList(conversationsApi, { filter: { obraId }, sort: '-lastMessageAt' });
  if (list.isLoading) return <SkeletonRows rows={3} />;
  const rows = list.data?.data ?? [];
  if (rows.length === 0)
    return <EmptyState title={t('emptyTitle')} description={t('emptyDescription')} />;
  return (
    <ul className="grid gap-3 lg:grid-cols-2">
      {rows.map((c) => (
        <li key={c.id}>
          <Link
            to={`/conversations?c=${c.id}`}
            className="surface-card flex items-center justify-between gap-3 p-4 transition-shadow hover:shadow-md"
          >
            <span className="min-w-0">
              <span className="block truncate text-base font-semibold">{c.title}</span>
              <span className="text-sm text-muted-foreground">
                {formatRelative(c.lastMessageAt)}
              </span>
            </span>
            {c.unread > 0 && <Badge tone="info">{c.unread}</Badge>}
          </Link>
        </li>
      ))}
    </ul>
  );
}
