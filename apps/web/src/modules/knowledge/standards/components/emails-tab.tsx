import { Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useCreate, useRemove, useUpdate } from '@/core/api/hooks';
import { SkeletonRows } from '@/design/patterns/skeleton';
import { Button } from '@/design/ui/button';
import { Input, Label, Textarea } from '@/design/ui/form';
import { Badge } from '@/design/ui/misc';
import { useToasts } from '@/design/ui/toast';
import { cn } from '@/design/cn';
import { emailTemplatesApi, useEmailTemplates } from '@/modules/knowledge/standards/api';
import { t } from '@/modules/knowledge/standards/i18n';

/** Padrões de e-mail (script, sem IA): criar, editar e remover. */
export function EmailsTab() {
  const list = useEmailTemplates();
  const update = useUpdate(emailTemplatesApi);
  const create = useCreate(emailTemplatesApi);
  const remove = useRemove(emailTemplatesApi);
  const push = useToasts((s) => s.push);
  const [picked, setPicked] = useState<string>();
  const [draft, setDraft] = useState<{ subject?: string; body?: string }>({});
  if (list.isLoading) return <SkeletonRows />;
  const items = list.data?.data ?? [];
  const current = items.find((i) => i.id === picked) ?? items[0];
  const subject = draft.subject ?? current?.subject ?? '';
  const body = draft.body ?? current?.body ?? '';
  return (
    <div className="grid gap-5 lg:grid-cols-[280px_1fr]">
      <div className="surface-card scrollbar-thin max-h-[560px] space-y-0.5 overflow-y-auto p-2">
        <Button
          variant="outline"
          size="sm"
          className="mb-1 w-full"
          onClick={() =>
            create.mutate(
              { name: t('emails.newName'), subject: '', body: '', system: false, variables: [] },
              {
                onSuccess: (n) => {
                  setPicked(n.id);
                  push(t('emails.created'));
                },
              },
            )
          }
        >
          <Plus /> {t('emails.new')}
        </Button>
        {items.map((i) => (
          <button
            key={i.id}
            type="button"
            onClick={() => {
              setPicked(i.id);
              setDraft({});
            }}
            className={cn(
              'w-full rounded-md px-3 py-2 text-left text-base hover:bg-muted',
              i.id === current?.id && 'bg-primary-soft font-medium',
            )}
          >
            {i.name}
          </button>
        ))}
      </div>
      {current && (
        <div className="surface-card space-y-4 p-5">
          <div className="space-y-1.5">
            <Label htmlFor="em-sub">{t('emails.subject')}</Label>
            <Input
              id="em-sub"
              value={subject}
              onChange={(e) => setDraft((d) => ({ ...d, subject: e.target.value }))}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="em-body">{t('emails.body')}</Label>
            <Textarea
              id="em-body"
              rows={6}
              value={body}
              onChange={(e) => setDraft((d) => ({ ...d, body: e.target.value }))}
            />
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-sm text-muted-foreground">{t('emails.variables')}:</span>
            {[
              ...new Set(
                [...subject.matchAll(/\{\{(\w+)\}\}/g), ...body.matchAll(/\{\{(\w+)\}\}/g)].map(
                  (m) => m[1] ?? '',
                ),
              ),
            ].map((v) => (
              <Badge key={v} tone="info">
                {v}
              </Badge>
            ))}
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() =>
                update.mutate(
                  { id: current.id, patch: { subject, body } },
                  {
                    onSuccess: () => {
                      setDraft({});
                      push(t('emails.saved'));
                    },
                  },
                )
              }
            >
              {t('emails.save')}
            </Button>
            {!current.system && (
              <Button
                variant="ghost"
                onClick={() =>
                  remove.mutate(current.id, { onSuccess: () => push(t('emails.removed')) })
                }
              >
                <Trash2 /> {t('emails.remove')}
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
