import { createT } from '@/core/i18n/create-t';

export const t = createT({
  label: 'Olhar de Atena',
  description: 'Apontamentos por turno: riscos, prazos, conflitos e itens esquecidos.',
  title: 'Olhar de Atena',
  subtitle:
    'A Atena lê notas, diário, agenda e tarefas três vezes ao dia e aponta o que merece atenção.',
  shifts: { morning: 'Manhã', afternoon: 'Tarde', night: 'Noite' },
  shiftTime: { morning: '06h00', afternoon: '12h00', night: '18h00' },
  tabs: { new: 'Novos', accepted: 'Aceitos', snoozed: 'Adiados', dismissed: 'Descartados' },
  turnCount: '{count} apontamento(s)',
  today: 'Hoje',
  yesterday: 'Ontem',
  allWorks: 'Todas as obras',
  filterWork: 'Obra',
  emptyTitle: 'Nada neste filtro',
  emptyDescription:
    'Quando a Atena apontar algo, aparece aqui, do turno mais recente ao mais antigo.',
  taskCreated: 'Tarefa criada a partir do apontamento',
  accepted: 'Apontamento aceito',
  snoozed: 'Apontamento adiado',
  dismissed: 'Apontamento descartado',
  critical: '{count} crítico(s)',
  openSource: 'Abrir a origem',
});
