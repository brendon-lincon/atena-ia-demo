import { ConfigModulePage } from '@/core/module-config/config-module-page';
import { tabs } from '@/modules/communication/email/config';
import { t } from '@/modules/communication/email/i18n';

export default function IndexPage() {
  return <ConfigModulePage title={t('label')} description={t('description')} tabs={tabs} />;
}
