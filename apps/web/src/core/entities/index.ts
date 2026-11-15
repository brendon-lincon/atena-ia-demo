/** Entidades compartilhadas entre módulos: esquema Zod (= tipo) e cliente de cada coleção do contrato. */
import { z } from 'zod';
import { defineResource } from '@/core/api/resource';

const date = z.string();
const nullableString = z.string().nullable().optional();

export const obraSchema = z.object({
  id: z.string(),
  code: z.string(),
  name: z.string(),
  clientId: z.string(),
  type: z.enum(['industrial_new', 'renovation', 'subcontract']),
  status: z.enum(['in_progress', 'mobilizing', 'closing']),
  description: z.string(),
  city: z.string(),
  state: z.string(),
  timezone: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  contractValueCents: z.number(),
  startDate: date,
  endDate: date,
  actualPhysicalPct: z.number(),
  plannedPhysicalPct: z.number(),
  costVariancePct: z.number().nullable(),
  budgetedCostToDateCents: z.number(),
  actualCostToDateCents: z.number(),
  headcount: z.number(),
  managerId: z.string(),
  foremanId: nullableString,
  progressHistory: z.array(z.number()),
});
export type Obra = z.infer<typeof obraSchema>;
export const obras = defineResource('obras', obraSchema);

export const eapItemSchema = z.object({
  id: z.string(),
  obraId: z.string(),
  parentId: nullableString,
  code: z.string(),
  name: z.string(),
  level: z.enum(['front', 'leaf']),
  weightPct: z.number(),
  contractedCents: z.number(),
  progressPct: z.number(),
  unit: nullableString,
  quantity: z.number().nullable().optional(),
  unitPriceCents: z.number().nullable().optional(),
  contractorId: nullableString,
  status: z.string(),
});
export type EapItem = z.infer<typeof eapItemSchema>;
export const eapItems = defineResource('eap-items', eapItemSchema);

export const scheduleActivitySchema = z.object({
  id: z.string(),
  obraId: z.string(),
  eapItemId: nullableString,
  name: z.string(),
  startDate: date,
  endDate: date,
  baselineStart: date,
  baselineEnd: date,
  progressPct: z.number(),
  predecessors: z.array(
    z.object({
      activityId: z.string(),
      type: z.enum(['FS', 'SS', 'FF', 'SF']),
      lagDays: z.number(),
    }),
  ),
  isMilestone: z.boolean(),
});
export type ScheduleActivity = z.infer<typeof scheduleActivitySchema>;
export const scheduleActivities = defineResource('schedule-activities', scheduleActivitySchema);

export const allocationSchema = z.object({
  id: z.string(),
  employeeId: z.string(),
  obraId: z.string(),
  role: z.string(),
  teamName: nullableString,
  startDate: date,
  endDate: date,
  loadPct: z.number(),
});
export type Allocation = z.infer<typeof allocationSchema>;
export const allocations = defineResource('allocations', allocationSchema);

export const employeeSchema = z.object({
  id: z.string(),
  contactId: z.string(),
  name: z.string(),
  role: z.string(),
  roleLabel: z.string(),
  obraId: z.string(),
  teamName: nullableString,
  status: z.string(),
});
export type Employee = z.infer<typeof employeeSchema>;
export const employees = defineResource('employees', employeeSchema);

export const contactSchema = z.object({
  id: z.string(),
  kind: z.string(),
  name: z.string(),
  roles: z.array(z.string()),
  city: z.string().optional(),
  state: z.string().optional(),
  title: nullableString,
  phone: nullableString,
  email: nullableString,
});
export type Contact = z.infer<typeof contactSchema>;
export const contacts = defineResource('contacts', contactSchema);

export const userSchema = z.object({
  id: z.string(),
  name: z.string(),
  role: z.string(),
  roleLabel: z.string(),
  initials: z.string(),
});
export const users = defineResource('users', userSchema);

export const taskSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  status: z.enum(['todo', 'doing', 'blocked', 'done']),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  dueDate: nullableString,
  assigneeId: nullableString,
  obraId: nullableString,
  origin: z.string().optional(),
});
export type Task = z.infer<typeof taskSchema>;
export const tasks = defineResource('tasks', taskSchema);

export const insightSchema = z.object({
  id: z.string(),
  kind: z.string(),
  severity: z.enum(['info', 'attention', 'critical']),
  title: z.string(),
  body: z.string(),
  shift: z.enum(['morning', 'afternoon', 'night']),
  obraId: nullableString,
  source: z.object({ type: z.string(), recordId: nullableString, label: z.string() }),
  suggestedAction: z.object({ label: z.string(), type: z.string() }).catchall(z.unknown()),
  status: z.enum(['new', 'accepted', 'snoozed', 'dismissed']),
  generatedAt: z.string(),
});
export type Insight = z.infer<typeof insightSchema>;
export const insights = defineResource('insights', insightSchema);

export const reviewItemSchema = z.object({
  id: z.string(),
  kind: z.string(),
  title: z.string(),
  obraId: nullableString,
  recordType: z.string(),
  recordId: z.string(),
  confidence: z.number(),
  priority: z.number(),
  source: z.object({ label: z.string(), preview: z.string() }),
  suggestedValue: z.string(),
  approvedValue: nullableString,
  status: z.enum(['pending', 'approved', 'adjusted', 'rejected']),
  needsYou: z.boolean(),
});
export type ReviewItem = z.infer<typeof reviewItemSchema>;
export const reviewItems = defineResource('review-items', reviewItemSchema);

export const calendarEventSchema = z.object({
  id: z.string(),
  title: z.string(),
  kind: z.string(),
  date,
  startTime: nullableString,
  endTime: nullableString,
  allDay: z.boolean(),
  obraId: nullableString,
  location: z.string(),
});
export type CalendarEvent = z.infer<typeof calendarEventSchema>;
export const calendarEvents = defineResource('calendar-events', calendarEventSchema);

export const deadlineSchema = z.object({
  id: z.string(),
  title: z.string(),
  dueDate: date,
  kind: z.string(),
  recordType: z.string(),
  recordId: z.string(),
  obraId: nullableString,
});
export type Deadline = z.infer<typeof deadlineSchema>;
export const deadlines = defineResource('deadlines', deadlineSchema);

export const diaryEntrySchema = z.object({
  id: z.string(),
  obraId: z.string(),
  date,
  weather: z.object({ condition: z.string(), tempC: z.number(), rainMm: z.number() }),
  headcountOwn: z.number(),
  headcountThird: z.number(),
  services: z.array(
    z.object({
      eapItemId: z.string(),
      description: z.string(),
      quantity: z.number(),
      unit: z.string(),
    }),
  ),
  incidents: nullableString,
  notes: z.string(),
  photoIds: z.array(z.string()),
  dayCostCents: z.number(),
});
export type DiaryEntry = z.infer<typeof diaryEntrySchema>;
export const diaryEntries = defineResource('diary-entries', diaryEntrySchema);

export const photoSchema = z.object({
  id: z.string(),
  obraId: z.string(),
  diaryEntryId: z.string(),
  eapItemId: nullableString,
  takenAt: z.string(),
  caption: z.string(),
  file: z.string(),
  tags: z.array(z.string()),
});
export type Photo = z.infer<typeof photoSchema>;
export const photos = defineResource('photos', photoSchema);

export const incidentSchema = z.object({
  id: z.string(),
  obraId: z.string(),
  title: z.string(),
  description: z.string(),
  category: z.string(),
  severity: z.enum(['low', 'medium', 'high']),
  status: z.enum(['open', 'mitigating', 'resolved']),
  openedAt: date,
  resolvedAt: nullableString,
  impactDays: z.number(),
  impactCostCents: z.number(),
});
export type Incident = z.infer<typeof incidentSchema>;
export const incidents = defineResource('incidents-site', incidentSchema);

export const measurementSchema = z.object({
  id: z.string(),
  obraId: z.string(),
  number: z.number(),
  periodStart: date,
  periodEnd: date,
  status: z.string(),
  amountCents: z.number(),
});
export type Measurement = z.infer<typeof measurementSchema>;
export const measurements = defineResource('measurements', measurementSchema);

export const contractSchema = z.object({
  id: z.string(),
  kind: z.string(),
  title: z.string(),
  number: z.string(),
  partyId: z.string(),
  obraId: z.string().nullable().optional(),
  valueCents: z.number(),
  startDate: date,
  endDate: date,
  status: z.string(),
});
export type Contract = z.infer<typeof contractSchema>;
export const contracts = defineResource('contracts', contractSchema);

export const documentSummarySchema = z.object({
  id: z.string(),
  obraId: nullableString,
  type: z.string(),
  title: z.string(),
  status: z.string(),
  issuedAt: nullableString,
});
export type DocumentSummary = z.infer<typeof documentSummarySchema>;
export const documents = defineResource('documents', documentSummarySchema);

export const companySchema = z.object({
  id: z.string(),
  name: z.string(),
  legalName: z.string(),
  cnpj: z.string(),
  address: z.object({ street: z.string(), city: z.string(), state: z.string() }),
  technicalResponsible: z.object({
    name: z.string(),
    title: z.string(),
    council: z.string(),
    registration: z.string(),
  }),
  identity: z.object({
    primaryColor: z.string(),
    accentColor: z.string(),
    logoText: z.string(),
    headerNote: z.string(),
    footerNote: z.string(),
  }),
});
export type Company = z.infer<typeof companySchema>;
export const companies = defineResource('company', companySchema);
