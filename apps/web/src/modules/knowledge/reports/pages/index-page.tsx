import { ConfigModulePage } from '@/core/module-config/config-module-page';
import { tabs } from '@/modules/knowledge/reports/config';
import { t } from '@/modules/knowledge/reports/i18n';

export default function IndexPage() {
  return <ConfigModulePage title={t('label')} description={t('description')} tabs={tabs} />;
}
