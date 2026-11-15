import type {
  DiaryEntry,
  DocumentSummary,
  EapItem,
  Incident,
  Measurement,
  ScheduleActivity,
} from '@/core/entities';
import type { TimelineItem, TimelineTone, TimelineTrack } from '@/design/patterns/timeline';
import { t } from '@/modules/works/works/i18n';

export interface Payment {
  id: string;
  dueDate: string;
  status: string;
  amountCents: number;
}

export interface TimelineInput {
  eap: EapItem[];
  activities: ScheduleActivity[];
  measurements: Measurement[];
  documents: DocumentSummary[];
  payments: Payment[];
  diary: DiaryEntry[];
  incidents: Incident[];
}

export interface TimelineModel {
  tracks: TimelineTrack[];
  items: (TimelineItem & { kind: string; detail: string })[];
  from: string;
  to: string;
}

const WEEK = 7;
const PAD_DAYS = 20;
const DAY_MS = 86_400_000;

function toneForProgress(progress: number): TimelineTone {
  if (progress >= 100) return 'success';
  return progress > 0 ? 'primary' : 'neutral';
}

function shift(iso: string, days: number): string {
  return new Date(new Date(iso).getTime() + days * DAY_MS).toISOString().slice(0, 10);
}

/** Monta as trilhas da linha do tempo da obra: fases, marcos, documentos, medições, desembolsos, efetivo e ocorrências. */
export function buildTimeline(input: TimelineInput): TimelineModel {
  const tracks: TimelineTrack[] = [
    { id: 'phases', label: t('timeline.phases') },
    { id: 'milestones', label: t('timeline.milestones') },
    { id: 'documents', label: t('timeline.documents') },
    { id: 'measurements', label: t('timeline.measurements') },
    { id: 'payments', label: t('timeline.payments') },
    { id: 'headcount', label: t('timeline.headcount') },
    { id: 'incidents', label: t('timeline.incidents') },
  ];
  const items: TimelineModel['items'] = [];
  for (const front of input.eap.filter((e) => e.level === 'front')) {
    const children = new Set(input.eap.filter((e) => e.parentId === front.id).map((e) => e.id));
    const acts = input.activities.filter((a) => a.eapItemId && children.has(a.eapItemId));
    if (acts.length === 0) continue;
    items.push({
      id: `phase:${front.id}`,
      trackId: 'phases',
      label: front.name,
      start: acts.map((a) => a.startDate).sort()[0] ?? '',
      end:
        acts
          .map((a) => a.endDate)
          .sort()
          .at(-1) ?? '',
      tone: toneForProgress(front.progressPct),
      kind: t('timeline.phases'),
      detail: `${front.code} · ${Math.round(front.progressPct)}%`,
    });
  }
  for (const m of input.activities.filter((a) => a.isMilestone))
    items.push({
      id: `ms:${m.id}`,
      trackId: 'milestones',
      label: m.name,
      start: m.startDate,
      tone: m.progressPct >= 100 ? 'success' : 'neutral',
      kind: t('timeline.milestones'),
      detail: m.name,
    });
  for (const d of input.documents.filter((x) => x.issuedAt))
    items.push({
      id: `doc:${d.id}`,
      trackId: 'documents',
      label: d.title,
      start: d.issuedAt ?? '',
      tone: 'primary',
      kind: t('timeline.documents'),
      detail: d.title,
    });
  for (const m of input.measurements)
    items.push({
      id: `meas:${m.id}`,
      trackId: 'measurements',
      label: t('timeline.measurementItem', { number: m.number }),
      start: m.periodEnd,
      tone: m.status === 'issued' ? 'success' : m.status === 'approved' ? 'warning' : 'neutral',
      kind: t('timeline.measurements'),
      detail: t('timeline.measurementItem', { number: m.number }),
    });
  for (const p of input.payments)
    items.push({
      id: `pay:${p.id}`,
      trackId: 'payments',
      label: t('timeline.paymentItem'),
      start: p.dueDate,
      tone: p.status === 'paid' ? 'success' : p.status === 'overdue' ? 'danger' : 'primary',
      kind: t('timeline.payments'),
      detail: t('timeline.paymentItem'),
    });
  const weekly = input.diary.filter((_, index) => index % WEEK === 0);
  for (const d of weekly)
    items.push({
      id: `hc:${d.id}`,
      trackId: 'headcount',
      label: t('timeline.headcountItem', { count: d.headcountOwn + d.headcountThird }),
      start: d.date,
      tone: 'neutral',
      kind: t('timeline.headcount'),
      detail: t('timeline.headcountItem', { count: d.headcountOwn + d.headcountThird }),
    });
  for (const i of input.incidents)
    items.push({
      id: `inc:${i.id}`,
      trackId: 'incidents',
      label: i.title,
      start: i.openedAt,
      tone: i.severity === 'high' ? 'danger' : i.severity === 'medium' ? 'warning' : 'neutral',
      kind: t('timeline.incidents'),
      detail: i.title,
    });
  const dates = items
    .flatMap((i) => [i.start, i.end ?? i.start])
    .filter(Boolean)
    .sort();
  const today = new Date().toISOString().slice(0, 10);
  const first = dates[0] ?? today;
  const last = dates.at(-1) ?? today;
  return {
    tracks,
    items,
    from: shift(first < today ? first : today, -PAD_DAYS),
    to: shift(last > today ? last : today, PAD_DAYS),
  };
}
