import { ConfigModulePage } from '@/core/module-config/config-module-page';
import { tabs } from '@/modules/home/agenda/config';
import { t } from '@/modules/home/agenda/i18n';

export default function IndexPage() {
  return <ConfigModulePage title={t('label')} description={t('description')} tabs={tabs} />;
}
