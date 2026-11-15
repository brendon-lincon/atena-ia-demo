import { ConfigModulePage } from '@/core/module-config/config-module-page';
import { tabs } from '@/modules/company/accounting/config';
import { t } from '@/modules/company/accounting/i18n';

export default function IndexPage() {
  return <ConfigModulePage title={t('label')} description={t('description')} tabs={tabs} />;
}
