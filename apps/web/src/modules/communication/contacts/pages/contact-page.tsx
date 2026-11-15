import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from 'react-router';
import { z } from 'zod';
import { useRecord } from '@/core/api/hooks';
import { looseRecord } from '@/core/api/loose';
import { defineResource } from '@/core/api/resource';
import { contacts } from '@/core/entities';
import { formatRelative } from '@/core/format';
import { useRecordShellData } from '@/core/record/use-record-shell';
import { EmptyState, ErrorState } from '@/design/patterns/empty-state';
import { RecordShell } from '@/design/patterns/record-shell';
import { SkeletonCard } from '@/design/patterns/skeleton';
import { Button } from '@/design/ui/button';
import { Badge, Card, CardContent, CardHeader, CardTitle } from '@/design/ui/misc';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/design/ui/tabs';
import { c } from '@/modules/communication/contacts/page-i18n';

const loose = z.array(looseRecord);
const conversations = defineResource('conversations', looseRecord);
const emails = defineResource('emails', looseRecord);
const contracts = defineResource('contracts', looseRecord);

/** Ficha do contato: dados e histórico de conversas, e-mails e contratos. */
export default function ContactPage() {
  const { id } = useParams();
  const contact = useRecord(contacts, id);
  const extras = useRecordShellData('contacts', id);
  const history = useQuery({
    queryKey: ['contact-history', id],
    enabled: Boolean(id),
    queryFn: async () => {
      const [a, b, d] = await Promise.all([
        conversations.list({ filter: { contactId: id ?? '' } }),
        emails.list({ filter: { contactId: id ?? '' }, sort: '-receivedAt' }),
        contracts.list({ filter: { partyId: id ?? '' } }),
      ]);
      return {
        conversations: loose.parse(a.data),
        emails: loose.parse(b.data),
        contracts: loose.parse(d.data),
      };
    },
  });
  if (contact.isLoading) return <SkeletonCard />;
  if (contact.isError || !contact.data)
    return contact.error && 'status' in contact.error && contact.error.status === 404 ? (
      <EmptyState
        illustration="error"
        title={c('notFound')}
        action={
          <Button asChild variant="outline">
            <Link to="/contacts">{c('back')}</Link>
          </Button>
        }
      />
    ) : (
      <ErrorState onRetry={() => void contact.refetch()} />
    );
  const k = contact.data;
  return (
    <RecordShell
      title={k.name}
      description={k.title ?? undefined}
      crumbs={[{ label: c('crumb'), to: '/contacts' }, { label: k.name }]}
      {...extras}
    >
      <div className="space-y-5">
        <Card>
          <CardHeader>
            <CardTitle>{c('data')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-wrap gap-1.5">
              {k.roles.map((r) => (
                <Badge key={r} tone="info">
                  {r}
                </Badge>
              ))}
            </div>
            <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-base">
              {k.phone && (
                <>
                  <dt className="text-muted-foreground">{c('phone')}</dt>
                  <dd className="text-right">{k.phone}</dd>
                </>
              )}
              {k.email && (
                <>
                  <dt className="text-muted-foreground">{c('email')}</dt>
                  <dd className="text-right">{k.email}</dd>
                </>
              )}
              {k.city && (
                <>
                  <dt className="text-muted-foreground">{c('city')}</dt>
                  <dd className="text-right">
                    {k.city}/{k.state}
                  </dd>
                </>
              )}
            </dl>
          </CardContent>
        </Card>
        <Tabs defaultValue="conversations">
          <TabsList>
            <TabsTrigger value="conversations">{c('conversations')}</TabsTrigger>
            <TabsTrigger value="emails">{c('emails')}</TabsTrigger>
            <TabsTrigger value="contracts">{c('contracts')}</TabsTrigger>
          </TabsList>
          <TabsContent value="conversations">
            <ul className="space-y-2">
              {(history.data?.conversations ?? []).map((x) => (
                <li key={x.id}>
                  <Link
                    className="surface-card block p-3 text-base hover:shadow-md"
                    to={`/conversations?c=${x.id}`}
                  >
                    {String(x.title)}{' '}
                    <span className="text-sm text-muted-foreground">
                      · {formatRelative(String(x.lastMessageAt))}
                    </span>
                  </Link>
                </li>
              ))}
              {history.data?.conversations.length === 0 && (
                <EmptyState title={c('empty')} className="py-6" />
              )}
            </ul>
          </TabsContent>
          <TabsContent value="emails">
            <ul className="space-y-2">
              {(history.data?.emails ?? []).map((x) => (
                <li key={x.id} className="surface-card p-3 text-base">
                  {String(x.subject)}{' '}
                  <span className="text-sm text-muted-foreground">
                    · {formatRelative(String(x.receivedAt))}
                  </span>
                </li>
              ))}
              {history.data?.emails.length === 0 && (
                <EmptyState title={c('empty')} className="py-6" />
              )}
            </ul>
          </TabsContent>
          <TabsContent value="contracts">
            <ul className="space-y-2">
              {(history.data?.contracts ?? []).map((x) => (
                <li key={x.id} className="surface-card p-3 text-base">
                  {String(x.number)} — {String(x.title)}
                </li>
              ))}
              {history.data?.contracts.length === 0 && (
                <EmptyState title={c('empty')} className="py-6" />
              )}
            </ul>
          </TabsContent>
        </Tabs>
      </div>
    </RecordShell>
  );
}
