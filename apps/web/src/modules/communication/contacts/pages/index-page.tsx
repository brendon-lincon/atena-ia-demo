import { ConfigModulePage } from '@/core/module-config/config-module-page';
import { tabs } from '@/modules/communication/contacts/config';
import { t } from '@/modules/communication/contacts/i18n';

export default function IndexPage() {
  return <ConfigModulePage title={t('label')} description={t('description')} tabs={tabs} />;
}
