import { ConfigModulePage } from '@/core/module-config/config-module-page';
import { tabs } from '@/modules/company/legal/config';
import { t } from '@/modules/company/legal/i18n';

export default function IndexPage() {
  return <ConfigModulePage title={t('label')} description={t('description')} tabs={tabs} />;
}
