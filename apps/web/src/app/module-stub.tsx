import type { ModuleManifest } from '@/core/module-registry/types';
import { EmptyState } from '@/design/patterns/empty-state';
import { PageHeader } from '@/design/patterns/page-header';
import { t } from './i18n';

/** Página provisória de módulo ainda sem telas: o menu e as rotas já existem. */
export function ModuleStub({ manifest }: { manifest: ModuleManifest }) {
  return (
    <div>
      <PageHeader title={manifest.label} description={manifest.description} />
      <div className="surface-card">
        <EmptyState
          illustration="first-steps"
          title={t('shell.stubTitle')}
          description={t('shell.stubDescription')}
        />
      </div>
    </div>
  );
}
