/** Serviços e produtividade de referência (homem-hora por unidade). Valores ilustrativos da demonstração. */
export interface ServiceType {
  id: string;
  unit: string;
  hhPerUnit: number;
}

export const SERVICES: ServiceType[] = [
  { id: 'concrete', unit: 'm³', hhPerUnit: 2.4 },
  { id: 'formwork', unit: 'm²', hhPerUnit: 1.1 },
  { id: 'rebar', unit: 'kg', hhPerUnit: 0.08 },
  { id: 'masonry', unit: 'm²', hhPerUnit: 1.2 },
  { id: 'floor', unit: 'm²', hhPerUnit: 0.55 },
  { id: 'excavation', unit: 'm³', hhPerUnit: 0.35 },
];

export const HOURS_PER_DAY = 8.8;
const WORKDAYS_PER_WEEK = 6;

export interface Sizing {
  crew: number;
  days: number;
  totalHh: number;
}

/** Equipe necessária para cumprir o prazo e, dada uma equipe, o prazo resultante (recalculado ao vivo). */
export function sizeByDeadline(
  service: ServiceType,
  quantity: number,
  calendarDays: number,
): Sizing {
  const totalHh = service.hhPerUnit * quantity;
  const workdays = Math.max((calendarDays * WORKDAYS_PER_WEEK) / 7, 1);
  return {
    totalHh,
    crew: Math.max(Math.ceil(totalHh / (workdays * HOURS_PER_DAY)), 1),
    days: calendarDays,
  };
}

export function sizeByCrew(service: ServiceType, quantity: number, crew: number): Sizing {
  const totalHh = service.hhPerUnit * quantity;
  const workdays = totalHh / (Math.max(crew, 1) * HOURS_PER_DAY);
  return { totalHh, crew, days: Math.ceil((workdays * 7) / WORKDAYS_PER_WEEK) };
}
