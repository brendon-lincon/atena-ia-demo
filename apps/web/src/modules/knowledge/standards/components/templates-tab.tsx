import { Copy, FileText, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useCreate, useRemove } from '@/core/api/hooks';
import { useCompany } from '@/core/entities/use-company';
import { DocumentPage } from '@/design/patterns/document-page';
import { SkeletonRows } from '@/design/patterns/skeleton';
import { Button } from '@/design/ui/button';
import { Badge } from '@/design/ui/misc';
import { Dialog, DialogContent, DialogTitle } from '@/design/ui/overlay';
import { useToasts } from '@/design/ui/toast';
import { templatesApi, useTemplates, type Template } from '@/modules/knowledge/standards/api';
import { t } from '@/modules/knowledge/standards/i18n';

/** Padrões de documento: criar (duplicando), consultar e remover modelos personalizados. */
export function TemplatesTab() {
  const list = useTemplates();
  const company = useCompany();
  const create = useCreate(templatesApi);
  const remove = useRemove(templatesApi);
  const push = useToasts((s) => s.push);
  const [open, setOpen] = useState<Template>();
  if (list.isLoading) return <SkeletonRows />;
  return (
    <>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {(list.data?.data ?? []).map((tpl) => (
          <article key={tpl.id} className="surface-card flex flex-col gap-2 p-4">
            <div className="flex items-start gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-primary-soft text-primary">
                <FileText className="size-5" />
              </span>
              <div className="min-w-0">
                <h3 className="text-base font-semibold">{tpl.name}</h3>
                <p className="text-sm text-muted-foreground">{tpl.description}</p>
              </div>
            </div>
            <div className="mt-auto flex flex-wrap items-center gap-2 pt-2">
              <Badge tone={tpl.system ? 'neutral' : 'info'}>
                {tpl.system ? t('templates.system') : t('templates.custom')}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {t('templates.fields', { count: tpl.fields.length })}
              </span>
              <span className="ml-auto flex gap-1">
                <Button size="sm" variant="ghost" onClick={() => setOpen(tpl)}>
                  {t('templates.preview')}
                </Button>
                <Button
                  size="icon-sm"
                  variant="ghost"
                  aria-label={t('templates.duplicate')}
                  onClick={() =>
                    create.mutate(
                      {
                        ...tpl,
                        id: undefined,
                        name: t('templates.copy', { name: tpl.name }),
                        system: false,
                      },
                      { onSuccess: () => push(t('templates.duplicated')) },
                    )
                  }
                >
                  <Copy />
                </Button>
                {!tpl.system && (
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    aria-label={t('templates.remove')}
                    onClick={() =>
                      remove.mutate(tpl.id, { onSuccess: () => push(t('templates.removed')) })
                    }
                  >
                    <Trash2 />
                  </Button>
                )}
              </span>
            </div>
          </article>
        ))}
      </div>
      <Dialog open={Boolean(open)} onOpenChange={(o) => !o && setOpen(undefined)}>
        <DialogContent className="max-w-3xl">
          <DialogTitle>{open?.name}</DialogTitle>
          {open && company.data && (
            <DocumentPage
              identity={{
                name: company.data.name,
                logoText: company.data.identity.logoText,
                headerNote: company.data.identity.headerNote,
                footerNote: company.data.identity.footerNote,
                accent: company.data.identity.primaryColor,
              }}
              blocks={open.blocks}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
