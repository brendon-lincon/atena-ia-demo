import { Link } from 'react-router';
import { useDirectory } from '@/core/directory/use-directory';
import { formatPercent } from '@/core/format';
import { obraLights } from '@/core/domain/health-labels';
import { ProgressRing } from '@/design/patterns/progress-ring';
import { StatusBadge } from '@/design/patterns/status-badge';
import { Button } from '@/design/ui/button';
import { Avatar, Badge, Card, CardContent, CardHeader, CardTitle } from '@/design/ui/misc';
import type { Conversation } from '@/modules/communication/conversations/api';
import { t } from '@/modules/communication/conversations/i18n';
import { initialsOf } from '@/modules/communication/conversations/initials';

/** Painel lateral: contato e obra vinculados à conversa. */
export function ContextPanel({ conversation }: { conversation: Conversation }) {
  const dir = useDirectory();
  const contact = dir.contacts.find((c) => c.id === conversation.contactId);
  const obra = dir.obras.find((o) => o.id === conversation.obraId);
  const light = obra ? obraLights(obra)[0] : undefined;
  return (
    <aside className="space-y-4 p-4">
      <Card>
        <CardHeader>
          <CardTitle>{t('panel.contact')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-3">
            <Avatar initials={initialsOf(conversation.title)} />
            <div className="min-w-0">
              <p className="truncate text-base font-semibold">
                {contact?.name ?? conversation.title}
              </p>
              {contact?.title && (
                <p className="truncate text-sm text-muted-foreground">{contact.title}</p>
              )}
            </div>
          </div>
          {contact?.phone && (
            <p className="text-sm">
              <span className="text-muted-foreground">{t('panel.phone')}: </span>
              {contact.phone}
            </p>
          )}
          {contact?.email && (
            <p className="truncate text-sm">
              <span className="text-muted-foreground">{t('panel.email')}: </span>
              {contact.email}
            </p>
          )}
          <div className="flex flex-wrap gap-1.5">
            {conversation.labels.map((l) => (
              <Badge key={l} tone="info">
                {l}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>{t('panel.work')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {obra ? (
            <>
              <div className="flex items-center gap-3">
                <ProgressRing value={obra.actualPhysicalPct} size={56} stroke={6}>
                  <span className="text-xs font-semibold tnum">
                    {formatPercent(obra.actualPhysicalPct, 0)}
                  </span>
                </ProgressRing>
                <div className="min-w-0">
                  <p className="text-base font-semibold leading-snug">{obra.name}</p>
                  {light && (
                    <StatusBadge
                      tone={
                        light.tone === 'green'
                          ? 'success'
                          : light.tone === 'yellow'
                            ? 'warning'
                            : light.tone === 'red'
                              ? 'danger'
                              : 'neutral'
                      }
                      label={`${light.label} ${light.value}`}
                    />
                  )}
                </div>
              </div>
              <Button asChild variant="outline" size="sm">
                <Link to={`/works/${obra.id}`}>{t('panel.openWork')}</Link>
              </Button>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">{t('panel.noWork')}</p>
          )}
        </CardContent>
      </Card>
    </aside>
  );
}
