import { ConfigModulePage } from '@/core/module-config/config-module-page';
import { tabs } from '@/modules/knowledge/files/config';
import { t } from '@/modules/knowledge/files/i18n';

export default function IndexPage() {
  return <ConfigModulePage title={t('label')} description={t('description')} tabs={tabs} />;
}
