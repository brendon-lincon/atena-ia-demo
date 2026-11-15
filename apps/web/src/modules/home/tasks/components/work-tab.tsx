import TasksPage from '@/modules/home/tasks/pages/tasks-page';

/** Aba "Tarefas" da obra: o mesmo componente do módulo, filtrado pela obra. */
export default function WorkTasksTab({ obraId }: { obraId: string }) {
  return <TasksPage obraId={obraId} />;
}
