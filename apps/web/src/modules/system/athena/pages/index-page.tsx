import { ConfigModulePage } from '@/core/module-config/config-module-page';
import { tabs } from '@/modules/system/athena/config';
import { t } from '@/modules/system/athena/i18n';

export default function IndexPage() {
  return <ConfigModulePage title={t('label')} description={t('description')} tabs={tabs} />;
}
