import { createT } from '@/core/i18n/create-t';

export const t = createT({
  label: 'Tarefas',
  description: 'Tarefas da empresa e de obra em um só lugar.',
  title: 'Tarefas',
  subtitle: 'Quadro, lista e prazos da equipe.',
  workTab: 'Tarefas',
  columns: {
    title: 'Tarefa',
    assignee: 'Responsável',
    due: 'Prazo',
    priority: 'Prioridade',
    status: 'Situação',
    work: 'Obra',
  },
  status: { todo: 'A fazer', doing: 'Em andamento', blocked: 'Bloqueada', done: 'Concluída' },
  priority: { low: 'Baixa', medium: 'Média', high: 'Alta', urgent: 'Urgente' },
  board: 'Quadro',
  list: 'Lista',
  newTask: 'Nova tarefa',
  newPlaceholder: 'O que precisa ser feito?',
  add: 'Adicionar',
  created: 'Tarefa criada',
  fromAtena: 'Sugerida pela Atena',
  emptyTitle: 'Nenhuma tarefa por aqui',
  emptyDescription: 'Crie a primeira tarefa para organizar o trabalho da equipe.',
  overdue: 'Atrasada',
});
