import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { companies } from '@/core/entities';
import { useCompany } from '@/core/entities/use-company';
import { DocumentPage } from '@/design/patterns/document-page';
import { SkeletonCard } from '@/design/patterns/skeleton';
import { Button } from '@/design/ui/button';
import { Input, Label } from '@/design/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/design/ui/misc';
import { useToasts } from '@/design/ui/toast';
import { t } from '@/modules/knowledge/standards/i18n';

type Identity = NonNullable<ReturnType<typeof useCompany>['data']>['identity'];

/** Editor de identidade visual com prévia ao vivo numa folha A4. */
export function IdentityTab() {
  const company = useCompany();
  const client = useQueryClient();
  const push = useToasts((s) => s.push);
  const [edits, setEdits] = useState<Partial<Identity>>({});
  if (!company.data) return <SkeletonCard />;
  const identity: Identity = { ...company.data.identity, ...edits };
  const set = (key: keyof Identity) => (value: string) =>
    setEdits((cur) => ({ ...cur, [key]: value }));
  const save = () =>
    void companies
      .update(company.data?.id ?? '', { identity })
      .then(() => client.invalidateQueries({ queryKey: ['company'] }))
      .then(() => push(t('identity.saved')));
  return (
    <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
      <Card className="h-fit">
        <CardHeader>
          <CardTitle>{t('identity.title')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">{t('identity.hint')}</p>
          <div className="space-y-1.5">
            <Label htmlFor="logo">{t('identity.logoText')}</Label>
            <Input
              id="logo"
              maxLength={4}
              value={identity.logoText}
              onChange={(e) => set('logoText')(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="c1">{t('identity.primary')}</Label>
              <Input
                id="c1"
                type="color"
                value={identity.primaryColor}
                onChange={(e) => set('primaryColor')(e.target.value)}
                className="h-10 p-1"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="c2">{t('identity.accent')}</Label>
              <Input
                id="c2"
                type="color"
                value={identity.accentColor}
                onChange={(e) => set('accentColor')(e.target.value)}
                className="h-10 p-1"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="head">{t('identity.header')}</Label>
            <Input
              id="head"
              value={identity.headerNote}
              onChange={(e) => set('headerNote')(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="foot">{t('identity.footer')}</Label>
            <Input
              id="foot"
              value={identity.footerNote}
              onChange={(e) => set('footerNote')(e.target.value)}
            />
          </div>
          <Button onClick={save}>{t('identity.save')}</Button>
        </CardContent>
      </Card>
      <div className="space-y-2">
        <p className="text-sm font-medium text-muted-foreground">{t('identity.preview')}</p>
        <DocumentPage
          identity={{
            name: company.data.name,
            logoText: identity.logoText,
            headerNote: identity.headerNote,
            footerNote: identity.footerNote,
            accent: identity.primaryColor,
          }}
          number="MEM-2026-001"
          blocks={[
            { type: 'heading', text: t('identity.sampleHeading') },
            { type: 'paragraph', text: t('identity.sampleBody') },
            { type: 'paragraph', text: t('identity.sampleItem') },
            { type: 'signature', text: t('identity.sampleSignature') },
          ]}
        />
      </div>
    </div>
  );
}
