import PlanningPage from '@/modules/works/planning/pages/planning-page';

/** Aba "Planejamento" da obra: o mesmo componente do módulo, filtrado pela obra. */
export default function WorkPlanningTab({ obraId }: { obraId: string }) {
  return <PlanningPage obraId={obraId} />;
}
