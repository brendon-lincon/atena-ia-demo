import { ConfigModulePage } from '@/core/module-config/config-module-page';
import { tabs } from '@/modules/engineering/engineering/config';
import { t } from '@/modules/engineering/engineering/i18n';

export default function IndexPage() {
  return <ConfigModulePage title={t('label')} description={t('description')} tabs={tabs} />;
}
