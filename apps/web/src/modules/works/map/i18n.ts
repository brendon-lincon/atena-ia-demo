import { createT } from '@/core/i18n/create-t';

export const t = createT({
  label: 'Mapa',
  description: 'Obras, equipes e rotas em um mapa interativo.',
  title: 'Mapa',
  subtitle: 'Situação das obras e deslocamentos a partir da sede.',
  layers: 'Camadas',
  routes: 'Rotas a partir da sede',
  team: 'Equipe alocada',
  hq: 'Sede',
  selectHint: 'Selecione uma obra no mapa para ver o resumo.',
  open: 'Abrir a obra',
  progress: 'Avanço',
  headcount: 'Efetivo',
  distance: 'Distância da sede',
  km: '{value} km',
  teamTitle: 'Equipe por função',
  noTeam: 'Sem equipe alocada',
});
