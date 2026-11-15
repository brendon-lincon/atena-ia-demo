import { createT } from '@/core/i18n/create-t';

export const o = createT({
  receivable: 'A receber em aberto',
  payable: 'A pagar em aberto',
  posted: 'Custos lançados',
  balance: 'Saldo projetado',
  byCategory: 'Custos por categoria',
  cashflow: 'Fluxo de caixa projetado (próximas 8 semanas)',
  in: 'Entradas',
  out: 'Saídas',
  week: 'Semana de {date}',
  categories: {
    materials: 'Materiais',
    labor: 'Mão de obra',
    equipment: 'Equipamentos',
    subcontract: 'Subempreitada',
    logistics: 'Logística',
    indirect: 'Indiretos',
    safety: 'Segurança',
  },
});
