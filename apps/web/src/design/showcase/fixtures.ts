import { addDays, format } from 'date-fns';
import type { BoardCard } from '@/design/patterns/funnel-board';
import type { GanttActivity } from '@/design/patterns/gantt-chart';
import type { HistogramBar } from '@/design/patterns/charts';
import type { MapMarker, MapRoute } from '@/design/patterns/map-view';
import type { SCurvePoint } from '@/design/patterns/charts';
import type { TimelineItem, TimelineTrack, VerticalEntry } from '@/design/patterns/timeline';
import type { FlowStep } from '@/design/patterns/flow-steps';
import type { NoteItem } from '@/design/patterns/notes-panel';
import type { DocumentBlock } from '@/design/patterns/document-page';
import type { Lifecycle } from '@/design/patterns/status-badge';

const iso = (offset: number) => format(addDays(new Date(), offset), 'yyyy-MM-dd');

export const ganttActivities: GanttActivity[] = [
  {
    id: 'a1',
    group: 'Terraplenagem e drenagem',
    name: 'Terraplenagem geral',
    start: iso(-95),
    end: iso(-42),
    progress: 100,
  },
  {
    id: 'a2',
    group: 'Terraplenagem e drenagem',
    name: 'Drenagem pluvial',
    start: iso(-60),
    end: iso(-28),
    progress: 100,
    predecessors: [{ id: 'a1', type: 'SS' }],
  },
  {
    id: 'a3',
    group: 'Bases dos tanques',
    name: 'Base do tanque TQ-07',
    start: iso(-20),
    end: iso(-6),
    progress: 100,
    predecessors: [{ id: 'a1', type: 'FS' }],
  },
  {
    id: 'a4',
    group: 'Bases dos tanques',
    name: 'Concretagem base TQ-08',
    start: iso(-16),
    end: iso(0),
    baselineStart: iso(-16),
    baselineEnd: iso(-3),
    progress: 78,
    critical: true,
    predecessors: [{ id: 'a3', type: 'SS' }],
  },
  {
    id: 'a5',
    group: 'Bases dos tanques',
    name: 'Base do tanque TQ-09',
    start: iso(-10),
    end: iso(4),
    baselineStart: iso(-10),
    baselineEnd: iso(4),
    progress: 40,
    predecessors: [{ id: 'a4', type: 'SS' }],
  },
  {
    id: 'a6',
    group: 'Bases dos tanques',
    name: 'Base do tanque TQ-12',
    start: iso(8),
    end: iso(22),
    baselineStart: iso(8),
    baselineEnd: iso(22),
    progress: 0,
    critical: true,
    predecessors: [{ id: 'a4', type: 'FS' }],
  },
  {
    id: 'a7',
    group: 'Casa de gerador',
    name: 'Fundação e baldrame',
    start: iso(-12),
    end: iso(8),
    baselineStart: iso(-14),
    baselineEnd: iso(6),
    progress: 60,
  },
  {
    id: 'a8',
    group: 'Casa de gerador',
    name: 'Estrutura e alvenaria',
    start: iso(8),
    end: iso(30),
    progress: 0,
    predecessors: [{ id: 'a7', type: 'FS' }],
  },
  {
    id: 'a9',
    group: 'Plataformas',
    name: 'Fundações das plataformas',
    start: iso(30),
    end: iso(95),
    progress: 0,
    critical: true,
    predecessors: [{ id: 'a6', type: 'FS' }],
  },
  {
    id: 'a10',
    group: 'Plataformas',
    name: 'Marco: liberação do 1º tanque',
    start: iso(40),
    end: iso(40),
    progress: 0,
    milestone: true,
  },
  {
    id: 'a11',
    group: 'Pavimentação',
    name: 'Sub-base e base',
    start: iso(160),
    end: iso(195),
    progress: 0,
    predecessors: [{ id: 'a9', type: 'FS' }],
  },
];

export const timelineTracks: TimelineTrack[] = [
  { id: 'phases', label: 'Fases' },
  { id: 'milestones', label: 'Marcos' },
  { id: 'measurements', label: 'Medições' },
  { id: 'incidents', label: 'Ocorrências' },
];
export const timelineItems: TimelineItem[] = [
  {
    id: 't1',
    trackId: 'phases',
    label: 'Terraplenagem',
    start: iso(-95),
    end: iso(-42),
    tone: 'success',
  },
  {
    id: 't2',
    trackId: 'phases',
    label: 'Bases dos tanques',
    start: iso(-44),
    end: iso(22),
    tone: 'primary',
  },
  {
    id: 't3',
    trackId: 'phases',
    label: 'Plataformas',
    start: iso(30),
    end: iso(165),
    tone: 'neutral',
  },
  {
    id: 't4',
    trackId: 'milestones',
    label: 'Liberação da frente',
    start: iso(-45),
    tone: 'success',
  },
  { id: 't5', trackId: 'milestones', label: 'Entrega final', start: iso(228), tone: 'neutral' },
  { id: 't6', trackId: 'measurements', label: 'Medição 1', start: iso(-73), tone: 'success' },
  { id: 't7', trackId: 'measurements', label: 'Medição 2', start: iso(-43), tone: 'success' },
  { id: 't8', trackId: 'measurements', label: 'Medição 3', start: iso(-13), tone: 'warning' },
  { id: 't9', trackId: 'incidents', label: 'Chuva forte', start: iso(-2), tone: 'danger' },
];
export const timelineRange = { from: iso(-110), to: iso(240) };

export const verticalEntries: VerticalEntry[] = [
  {
    id: 'v1',
    date: iso(-1),
    title: 'Falta de aço CA-50 12,5 mm',
    description: 'Estoque cobre só mais 1 dia.',
    tone: 'danger',
  },
  { id: 'v2', date: iso(-1), title: 'Concretagem do TQ-09 liberada', tone: 'success' },
  {
    id: 'v3',
    date: iso(-2),
    title: 'Chuva interrompeu a concretagem do TQ-08',
    description: 'Paralisação de 3 horas.',
    tone: 'warning',
  },
];

export const sCurve: SCurvePoint[] = Array.from({ length: 24 }, (_, i) => {
  const day = -100 + i * 14;
  const planned = Math.min(100, Math.round((100 / (1 + Math.exp(-(i - 12) / 3.4))) * 10) / 10);
  return {
    date: iso(day),
    planned,
    actual: day <= 0 ? Math.round(planned * 0.9 * 10) / 10 : undefined,
  };
});

export const histogram: { data: HistogramBar[]; roles: { key: string; label: string }[] } = {
  roles: [
    { key: 'rebar', label: 'Armador' },
    { key: 'mason', label: 'Pedreiro' },
    { key: 'carpenter', label: 'Carpinteiro' },
  ],
  data: [
    { label: 'S1', values: { rebar: 5, mason: 3, carpenter: 2 }, capacity: 12 },
    { label: 'S2', values: { rebar: 5, mason: 4, carpenter: 2 }, capacity: 12 },
    { label: 'S3', values: { rebar: 10, mason: 4, carpenter: 2 }, capacity: 12 },
    { label: 'S4', values: { rebar: 10, mason: 3, carpenter: 3 }, capacity: 12 },
    { label: 'S5', values: { rebar: 5, mason: 3, carpenter: 3 }, capacity: 12 },
  ],
};

export interface DemoRow {
  id: string;
  name: string;
  client: string;
  valueCents: number;
  progress: number;
  status: Lifecycle;
  stage: string;
  due: string;
}
export const rows: DemoRow[] = [
  {
    id: 'r1',
    name: 'Base de Distribuição Candeias',
    client: 'Atlas Distribuidora',
    valueCents: 1_840_000_000,
    progress: 34,
    status: 'approved',
    stage: 'won',
    due: iso(228),
  },
  {
    id: 'r2',
    name: 'Reforma da Base Cuiabá',
    client: 'Atlas Distribuidora',
    valueCents: 320_000_000,
    progress: 71,
    status: 'approved',
    stage: 'won',
    due: iso(34),
  },
  {
    id: 'r3',
    name: 'Serviços civis do parque de tanques',
    client: 'Vértice Montagens',
    valueCents: 210_000_000,
    progress: 52,
    status: 'in_review',
    stage: 'negotiation',
    due: iso(75),
  },
  {
    id: 'r4',
    name: 'Base de Distribuição Osasco',
    client: 'Atlas Distribuidora',
    valueCents: 970_000_000,
    progress: 0,
    status: 'draft',
    stage: 'proposal',
    due: iso(358),
  },
  {
    id: 'r5',
    name: 'Base de Distribuição Paulínia',
    client: 'Atlas Distribuidora',
    valueCents: 1_290_000_000,
    progress: 100,
    status: 'issued',
    stage: 'lead',
    due: iso(-180),
  },
];
export const boardCards: (BoardCard & { row: DemoRow })[] = rows.map((row) => ({
  id: row.id,
  stageId: row.stage,
  row,
}));

export const markers: MapMarker[] = [
  { id: 'candeias', lat: -12.6713, lng: -38.5506, label: 'Candeias/BA', tone: 'warning' },
  { id: 'vertice', lat: -12.6769, lng: -38.5441, label: 'Parque de tanques', tone: 'success' },
  { id: 'cuiaba', lat: -15.6014, lng: -56.0979, label: 'Cuiabá/MT', tone: 'success' },
  { id: 'osasco', lat: -23.5325, lng: -46.7917, label: 'Osasco/SP', tone: 'neutral' },
  {
    id: 'hq',
    lat: -20.4628,
    lng: -54.6153,
    label: 'Campo Grande/MS',
    tone: 'primary',
    kind: 'office',
  },
];
export const routes: MapRoute[] = [
  { from: [-54.6153, -20.4628], to: [-56.0979, -15.6014] },
  { from: [-54.6153, -20.4628], to: [-38.5506, -12.6713] },
  { from: [-54.6153, -20.4628], to: [-46.7917, -23.5325] },
];

export const flowSteps: FlowStep[] = [
  { id: 'cno', label: 'CNO', status: 'done' },
  { id: 'art', label: 'ART', status: 'done' },
  { id: 'alvara', label: 'Alvará', status: 'current', dueDate: iso(45) },
  { id: 'env', label: 'Licenças ambientais', status: 'pending', dueDate: iso(120) },
  {
    id: 'fire',
    label: 'Bombeiros',
    status: 'blocked',
    dueDate: iso(-4),
    detail: 'Aguardando projeto',
  },
];

export const notes: NoteItem[] = [
  {
    id: 'n1',
    author: 'Antônio Carvalho',
    initials: 'AC',
    body: 'Reunião com a fiscalização: prioridade na liberação do TQ-09.',
    at: new Date(Date.now() - 3 * 3_600_000).toISOString(),
    pinned: true,
  },
  {
    id: 'n2',
    author: 'Beatriz Nogueira',
    initials: 'BN',
    body: 'Levantamento feito a partir da revisão 02 do projeto.',
    at: new Date(Date.now() - 26 * 3_600_000).toISOString(),
  },
];

export const documentBlocks: DocumentBlock[] = [
  { type: 'heading', text: 'MEMORIAL DESCRITIVO' },
  {
    type: 'paragraph',
    segments: [
      { text: '1. OBJETO\nO presente memorial descreve os serviços de ' },
      { text: 'recuperação estrutural e piso industrial', filled: true },
      { text: ' da obra ' },
      { text: 'Reforma da Base Cuiabá', filled: true },
      { text: ', contratada por ' },
      { text: 'Atlas Distribuidora de Combustíveis S.A.', filled: true },
      { text: '.' },
    ],
  },
  {
    type: 'paragraph',
    text: '2. NORMAS APLICÁVEIS\nOs serviços serão executados conforme as normas da ABNT aplicáveis e as Normas Regulamentadoras de segurança do trabalho, em especial a NR-18.',
  },
  {
    type: 'table',
    rows: [
      ['Frente', 'Unidade', 'Quantidade'],
      ['Piso industrial', 'm²', '6.400'],
      ['Reforço de pilares', 'm', '940'],
    ],
  },
  { type: 'signature', text: 'Antônio Carvalho\nResponsável técnico' },
];

export const paletteAnswer = {
  reply:
    'Em Cuiabá, o gasto com hospedagem lançado até hoje é de R$ 152.678,40, em um lançamento do Hotel Pantanal Palace.',
  sources: [{ label: 'Lançamento de custo — hospedagem' }],
};
