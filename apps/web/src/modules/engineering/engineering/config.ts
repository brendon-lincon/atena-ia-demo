import type { ConfigTab } from '@/core/module-config/types';
import { t } from '@/modules/engineering/engineering/i18n';

export const tabs: ConfigTab[] = [
  {
    id: 'masterlist',
    label: t('tab_masterlist'),
    resource: 'files',
    columns: [
      { id: 'name', header: t('col_masterlist_name'), field: 'name' },
      { id: 'obraId', header: t('col_masterlist_obraId'), field: 'obraId', format: 'name' },
      {
        id: 'discipline',
        header: t('col_masterlist_discipline'),
        field: 'discipline',
        hideOnMobile: true,
      },
      {
        id: 'version',
        header: t('col_masterlist_version'),
        field: 'version',
        format: 'number',
        hideOnMobile: true,
      },
    ],
    filter: { kind: 'pdf,dxf' },
    sort: 'name',
  },
  {
    id: 'inspections',
    label: t('tab_inspections'),
    resource: 'calendar-events',
    columns: [
      { id: 'title', header: t('col_inspections_title'), field: 'title' },
      { id: 'date', header: t('col_inspections_date'), field: 'date', format: 'date' },
      {
        id: 'obraId',
        header: t('col_inspections_obraId'),
        field: 'obraId',
        format: 'name',
        hideOnMobile: true,
      },
      {
        id: 'location',
        header: t('col_inspections_location'),
        field: 'location',
        hideOnMobile: true,
      },
    ],
    filter: { kind: 'inspection' },
    sort: 'date',
  },
  {
    id: 'arts',
    label: t('tab_arts'),
    resource: 'compliance-items',
    columns: [
      { id: 'title', header: t('col_arts_title'), field: 'title' },
      { id: 'obraId', header: t('col_arts_obraId'), field: 'obraId', format: 'name' },
      { id: 'protocol', header: t('col_arts_protocol'), field: 'protocol', hideOnMobile: true },
      {
        id: 'status',
        header: t('col_arts_status'),
        field: 'status',
        format: 'badge',
        labels: {
          not_started: { label: t('lab_arts_status_not_started'), tone: 'neutral' },
          in_progress: { label: t('lab_arts_status_in_progress'), tone: 'info' },
          submitted: { label: t('lab_arts_status_submitted'), tone: 'info' },
          issued: { label: t('lab_arts_status_issued'), tone: 'success' },
          expired: { label: t('lab_arts_status_expired'), tone: 'danger' },
        },
      },
    ],
    filter: { step: 'art' },
  },
  {
    id: 'critical',
    label: t('tab_critical'),
    resource: 'review-items',
    columns: [
      { id: 'title', header: t('col_critical_title'), field: 'title' },
      {
        id: 'obraId',
        header: t('col_critical_obraId'),
        field: 'obraId',
        format: 'name',
        hideOnMobile: true,
      },
      {
        id: 'confidence',
        header: t('col_critical_confidence'),
        field: 'confidence',
        format: 'percent',
        hideOnMobile: true,
      },
    ],
    filter: { kind: 'quantity_takeoff,schedule_update,price_update' },
  },
];
