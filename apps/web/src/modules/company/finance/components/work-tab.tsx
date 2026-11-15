import { ConfigTabView } from '@/core/module-config/config-tab-view';
import { tabs } from '@/modules/company/finance/config';

/** Aba da obra: a mesma aba "entries" do módulo, filtrada pela obra. */
export default function WorkTab({ obraId }: { obraId: string }) {
  const tab = tabs.find((x) => x.id === 'entries');
  return tab ? <ConfigTabView tab={tab} extraFilter={{ obraId: obraId }} /> : null;
}
