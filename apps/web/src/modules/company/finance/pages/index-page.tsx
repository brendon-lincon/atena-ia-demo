import { ConfigModulePage } from '@/core/module-config/config-module-page';
import { tabs } from '@/modules/company/finance/config';
import { t } from '@/modules/company/finance/i18n';

export default function IndexPage() {
  return <ConfigModulePage title={t('label')} description={t('description')} tabs={tabs} />;
}
