import type { ConfigTab } from '@/core/module-config/types';
import { t } from '@/modules/company/admin/i18n';

export const tabs: ConfigTab[] = [
  {
    id: 'documents',
    label: t('tab_documents'),
    resource: 'files',
    columns: [
      { id: 'name', header: t('col_documents_name'), field: 'name' },
      {
        id: 'kind',
        header: t('col_documents_kind'),
        field: 'kind',
        format: 'badge',
        labels: {
          pdf: { label: t('lab_documents_kind_pdf'), tone: 'neutral' },
          dxf: { label: t('lab_documents_kind_dxf'), tone: 'info' },
          docx: { label: t('lab_documents_kind_docx'), tone: 'neutral' },
          xlsx: { label: t('lab_documents_kind_xlsx'), tone: 'neutral' },
          zip: { label: t('lab_documents_kind_zip'), tone: 'neutral' },
          audio: { label: t('lab_documents_kind_audio'), tone: 'neutral' },
        },
      },
      {
        id: 'version',
        header: t('col_documents_version'),
        field: 'version',
        format: 'number',
        hideOnMobile: true,
      },
      {
        id: 'sizeKb',
        header: t('col_documents_sizeKb'),
        field: 'sizeKb',
        format: 'number',
        align: 'right',
        hideOnMobile: true,
      },
    ],
    filter: { recordType: 'company' },
  },
  {
    id: 'validity',
    label: t('tab_validity'),
    resource: 'deadlines',
    columns: [
      { id: 'title', header: t('col_validity_title'), field: 'title' },
      { id: 'dueDate', header: t('col_validity_dueDate'), field: 'dueDate', format: 'validity' },
      {
        id: 'kind',
        header: t('col_validity_kind'),
        field: 'kind',
        format: 'badge',
        labels: {
          aso: { label: t('lab_validity_kind_aso'), tone: 'warning' },
          training: { label: t('lab_validity_kind_training'), tone: 'info' },
          license: { label: t('lab_validity_kind_license'), tone: 'info' },
          certificate: { label: t('lab_validity_kind_certificate'), tone: 'neutral' },
          insurance: { label: t('lab_validity_kind_insurance'), tone: 'neutral' },
          contract: { label: t('lab_validity_kind_contract'), tone: 'neutral' },
          obligation: { label: t('lab_validity_kind_obligation'), tone: 'warning' },
          registration: { label: t('lab_validity_kind_registration'), tone: 'neutral' },
          ppe: { label: t('lab_validity_kind_ppe'), tone: 'neutral' },
        },
      },
    ],
    filter: { kind: 'certificate,insurance,registration' },
    sort: 'dueDate',
  },
  {
    id: 'meetings',
    label: t('tab_meetings'),
    resource: 'calendar-events',
    columns: [
      { id: 'title', header: t('col_meetings_title'), field: 'title' },
      { id: 'date', header: t('col_meetings_date'), field: 'date', format: 'date' },
      { id: 'location', header: t('col_meetings_location'), field: 'location', hideOnMobile: true },
    ],
    filter: { kind: 'meeting' },
    sort: 'date',
    views: ['table', 'calendar'],
    dateField: 'date',
    titleField: 'title',
  },
];
