import { createT } from '@/core/i18n/create-t';

export const t = createT({
  label: 'Central de revisão',
  description: 'Tudo que aguarda conferência, de qualquer módulo.',
  title: 'Central de revisão',
  subtitle:
    'Confira a origem, ajuste o valor e aprove. Itens de baixa confiança aparecem em destaque.',
  queue: 'Fila',
  pending: '{count} aguardando',
  needsYou: 'Precisa de você',
  allDone: 'Tudo conferido',
  allDoneDescription:
    'Não há itens aguardando revisão. Novos itens chegam aqui conforme a Atena os lê.',
  selectHint: 'Escolha um item da fila para conferir.',
  openRecord: 'Abrir o registro',
  kinds: {
    quantity_takeoff: 'Quantitativo',
    measurement_send: 'Medição',
    exam_renewal: 'Exame',
    photo_classification: 'Foto',
    invoice_classification: 'Nota fiscal',
    diary_extraction: 'Diário',
    email_draft: 'E-mail',
    document_draft: 'Documento',
    schedule_update: 'Cronograma',
    price_update: 'Preço',
  },
  done: {
    approved: 'Item aprovado',
    rejected: 'Item rejeitado',
    measurement: 'Medição emitida ao contratante',
    budget: 'Orçamento aprovado',
    task: 'Tarefa de renovação criada',
  },
  failed: 'Não foi possível registrar a decisão. Tente novamente.',
});
