import type { ConfigTab } from '@/core/module-config/types';
import { t } from '@/modules/company/accounting/i18n';

export const tabs: ConfigTab[] = [
  {
    id: 'invoices',
    label: t('tab_invoices'),
    resource: 'receivables',
    columns: [
      { id: 'invoiceNumber', header: t('col_invoices_invoiceNumber'), field: 'invoiceNumber' },
      { id: 'description', header: t('col_invoices_description'), field: 'description' },
      {
        id: 'amountCents',
        header: t('col_invoices_amountCents'),
        field: 'amountCents',
        format: 'money',
        align: 'right',
      },
      { id: 'dueDate', header: t('col_invoices_dueDate'), field: 'dueDate', format: 'date' },
      {
        id: 'status',
        header: t('col_invoices_status'),
        field: 'status',
        format: 'badge',
        labels: {
          open: { label: t('lab_invoices_status_open'), tone: 'info' },
          paid: { label: t('lab_invoices_status_paid'), tone: 'success' },
          overdue: { label: t('lab_invoices_status_overdue'), tone: 'danger' },
          forecast: { label: t('lab_invoices_status_forecast'), tone: 'neutral' },
        },
      },
    ],
    sort: '-dueDate',
  },
  {
    id: 'obligations',
    label: t('tab_obligations'),
    resource: 'deadlines',
    columns: [
      { id: 'title', header: t('col_obligations_title'), field: 'title' },
      { id: 'dueDate', header: t('col_obligations_dueDate'), field: 'dueDate', format: 'validity' },
      {
        id: 'kind',
        header: t('col_obligations_kind'),
        field: 'kind',
        format: 'badge',
        labels: {
          aso: { label: t('lab_obligations_kind_aso'), tone: 'warning' },
          training: { label: t('lab_obligations_kind_training'), tone: 'info' },
          license: { label: t('lab_obligations_kind_license'), tone: 'info' },
          certificate: { label: t('lab_obligations_kind_certificate'), tone: 'neutral' },
          insurance: { label: t('lab_obligations_kind_insurance'), tone: 'neutral' },
          contract: { label: t('lab_obligations_kind_contract'), tone: 'neutral' },
          obligation: { label: t('lab_obligations_kind_obligation'), tone: 'warning' },
          registration: { label: t('lab_obligations_kind_registration'), tone: 'neutral' },
          ppe: { label: t('lab_obligations_kind_ppe'), tone: 'neutral' },
        },
      },
    ],
    filter: { kind: 'obligation' },
    sort: 'dueDate',
  },
  {
    id: 'certificates',
    label: t('tab_certificates'),
    resource: 'deadlines',
    columns: [
      { id: 'title', header: t('col_certificates_title'), field: 'title' },
      {
        id: 'dueDate',
        header: t('col_certificates_dueDate'),
        field: 'dueDate',
        format: 'validity',
      },
    ],
    filter: { kind: 'certificate' },
    sort: 'dueDate',
  },
  {
    id: 'payables',
    label: t('tab_payables'),
    resource: 'payables',
    columns: [
      { id: 'description', header: t('col_payables_description'), field: 'description' },
      {
        id: 'amountCents',
        header: t('col_payables_amountCents'),
        field: 'amountCents',
        format: 'money',
        align: 'right',
      },
      { id: 'dueDate', header: t('col_payables_dueDate'), field: 'dueDate', format: 'date' },
      {
        id: 'status',
        header: t('col_payables_status'),
        field: 'status',
        format: 'badge',
        labels: {
          open: { label: t('lab_payables_status_open'), tone: 'info' },
          paid: { label: t('lab_payables_status_paid'), tone: 'success' },
          overdue: { label: t('lab_payables_status_overdue'), tone: 'danger' },
        },
      },
    ],
    sort: 'dueDate',
  },
];
