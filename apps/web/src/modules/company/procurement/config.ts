import type { ConfigTab } from '@/core/module-config/types';
import { t } from '@/modules/company/procurement/i18n';

export const tabs: ConfigTab[] = [
  {
    id: 'requests',
    label: t('tab_requests'),
    resource: 'purchase-requests',
    columns: [
      { id: 'number', header: t('col_requests_number'), field: 'number' },
      { id: 'title', header: t('col_requests_title'), field: 'title' },
      {
        id: 'obraId',
        header: t('col_requests_obraId'),
        field: 'obraId',
        format: 'name',
        hideOnMobile: true,
      },
      {
        id: 'status',
        header: t('col_requests_status'),
        field: 'status',
        format: 'badge',
        labels: {
          draft: { label: t('lab_requests_status_draft'), tone: 'neutral' },
          quoting: { label: t('lab_requests_status_quoting'), tone: 'warning' },
          ordered: { label: t('lab_requests_status_ordered'), tone: 'info' },
          received: { label: t('lab_requests_status_received'), tone: 'success' },
          cancelled: { label: t('lab_requests_status_cancelled'), tone: 'danger' },
        },
      },
      { id: 'neededBy', header: t('col_requests_neededBy'), field: 'neededBy', format: 'date' },
      { id: 'origin', header: t('col_requests_origin'), field: 'origin', hideOnMobile: true },
    ],
    sort: 'neededBy',
    views: ['table', 'cards'],
  },
  {
    id: 'quotes',
    label: t('tab_quotes'),
    resource: 'quotes',
    columns: [
      { id: 'supplierId', header: t('col_quotes_supplierId'), field: 'supplierId', format: 'name' },
      {
        id: 'totalCents',
        header: t('col_quotes_totalCents'),
        field: 'totalCents',
        format: 'money',
        align: 'right',
      },
      {
        id: 'deliveryDays',
        header: t('col_quotes_deliveryDays'),
        field: 'deliveryDays',
        format: 'number',
        align: 'right',
      },
      {
        id: 'validUntil',
        header: t('col_quotes_validUntil'),
        field: 'validUntil',
        format: 'date',
        hideOnMobile: true,
      },
      {
        id: 'status',
        header: t('col_quotes_status'),
        field: 'status',
        format: 'badge',
        labels: {
          received: { label: t('lab_quotes_status_received'), tone: 'neutral' },
          selected: { label: t('lab_quotes_status_selected'), tone: 'success' },
          rejected: { label: t('lab_quotes_status_rejected'), tone: 'danger' },
        },
      },
    ],
    sort: 'totalCents',
  },
  {
    id: 'orders',
    label: t('tab_orders'),
    resource: 'purchase-requests',
    columns: [
      { id: 'number', header: t('col_orders_number'), field: 'number' },
      { id: 'title', header: t('col_orders_title'), field: 'title' },
      {
        id: 'status',
        header: t('col_orders_status'),
        field: 'status',
        format: 'badge',
        labels: {
          draft: { label: t('lab_orders_status_draft'), tone: 'neutral' },
          quoting: { label: t('lab_orders_status_quoting'), tone: 'warning' },
          ordered: { label: t('lab_orders_status_ordered'), tone: 'info' },
          received: { label: t('lab_orders_status_received'), tone: 'success' },
          cancelled: { label: t('lab_orders_status_cancelled'), tone: 'danger' },
        },
      },
      { id: 'neededBy', header: t('col_orders_neededBy'), field: 'neededBy', format: 'date' },
    ],
    filter: { status: 'ordered,received' },
  },
  {
    id: 'suppliers',
    label: t('tab_suppliers'),
    resource: 'contacts',
    columns: [
      { id: 'name', header: t('col_suppliers_name'), field: 'name' },
      { id: 'city', header: t('col_suppliers_city'), field: 'city', hideOnMobile: true },
      { id: 'state', header: t('col_suppliers_state'), field: 'state', hideOnMobile: true },
      { id: 'phone', header: t('col_suppliers_phone'), field: 'phone', hideOnMobile: true },
      { id: 'email', header: t('col_suppliers_email'), field: 'email', hideOnMobile: true },
    ],
    filter: { roles: 'fornecedor' },
    sort: 'name',
  },
];
