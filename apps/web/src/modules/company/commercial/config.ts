import type { ConfigTab } from '@/core/module-config/types';
import { t } from '@/modules/company/commercial/i18n';

export const tabs: ConfigTab[] = [
  {
    id: 'clients',
    label: t('tab_clients'),
    resource: 'contacts',
    columns: [
      { id: 'name', header: t('col_clients_name'), field: 'name' },
      { id: 'city', header: t('col_clients_city'), field: 'city', hideOnMobile: true },
      { id: 'state', header: t('col_clients_state'), field: 'state', hideOnMobile: true },
      { id: 'phone', header: t('col_clients_phone'), field: 'phone', hideOnMobile: true },
    ],
    filter: { roles: 'contratante' },
    sort: 'name',
  },
  {
    id: 'proposals',
    label: t('tab_proposals'),
    resource: 'proposals',
    columns: [
      { id: 'number', header: t('col_proposals_number'), field: 'number' },
      { id: 'title', header: t('col_proposals_title'), field: 'title' },
      {
        id: 'clientId',
        header: t('col_proposals_clientId'),
        field: 'clientId',
        format: 'name',
        hideOnMobile: true,
      },
      {
        id: 'valueCents',
        header: t('col_proposals_valueCents'),
        field: 'valueCents',
        format: 'money',
        align: 'right',
      },
      {
        id: 'stage',
        header: t('col_proposals_stage'),
        field: 'stage',
        format: 'badge',
        labels: {
          lead: { label: t('lab_proposals_stage_lead'), tone: 'neutral' },
          proposal: { label: t('lab_proposals_stage_proposal'), tone: 'info' },
          negotiation: { label: t('lab_proposals_stage_negotiation'), tone: 'warning' },
          won: { label: t('lab_proposals_stage_won'), tone: 'success' },
          lost: { label: t('lab_proposals_stage_lost'), tone: 'danger' },
        },
      },
      {
        id: 'validUntil',
        header: t('col_proposals_validUntil'),
        field: 'validUntil',
        format: 'date',
        hideOnMobile: true,
      },
    ],
    sort: '-sentAt',
  },
  {
    id: 'pipeline',
    label: t('tab_pipeline'),
    resource: 'proposals',
    columns: [
      { id: 'title', header: t('col_pipeline_title'), field: 'title' },
      {
        id: 'valueCents',
        header: t('col_pipeline_valueCents'),
        field: 'valueCents',
        format: 'money',
        align: 'right',
      },
      {
        id: 'stage',
        header: t('col_pipeline_stage'),
        field: 'stage',
        format: 'badge',
        labels: {
          lead: { label: t('lab_pipeline_stage_lead'), tone: 'neutral' },
          proposal: { label: t('lab_pipeline_stage_proposal'), tone: 'info' },
          negotiation: { label: t('lab_pipeline_stage_negotiation'), tone: 'warning' },
          won: { label: t('lab_pipeline_stage_won'), tone: 'success' },
          lost: { label: t('lab_pipeline_stage_lost'), tone: 'danger' },
        },
      },
    ],
    views: ['table'],
    titleField: 'title',
    board: {
      field: 'stage',
      stages: [
        { id: 'lead', label: t('lab_pipeline_stage_lead'), tone: 'neutral' },
        { id: 'proposal', label: t('lab_pipeline_stage_proposal'), tone: 'primary' },
        { id: 'negotiation', label: t('lab_pipeline_stage_negotiation'), tone: 'primary' },
        { id: 'won', label: t('lab_pipeline_stage_won'), tone: 'success' },
        { id: 'lost', label: t('lab_pipeline_stage_lost'), tone: 'danger' },
      ],
      funnel: true,
      valueField: 'valueCents',
    },
  },
  {
    id: 'contracts',
    label: t('tab_contracts'),
    resource: 'contracts',
    columns: [
      { id: 'number', header: t('col_contracts_number'), field: 'number' },
      { id: 'title', header: t('col_contracts_title'), field: 'title' },
      {
        id: 'partyId',
        header: t('col_contracts_partyId'),
        field: 'partyId',
        format: 'name',
        hideOnMobile: true,
      },
      {
        id: 'valueCents',
        header: t('col_contracts_valueCents'),
        field: 'valueCents',
        format: 'money',
        align: 'right',
      },
      { id: 'endDate', header: t('col_contracts_endDate'), field: 'endDate', format: 'date' },
      {
        id: 'status',
        header: t('col_contracts_status'),
        field: 'status',
        format: 'badge',
        labels: {
          active: { label: t('lab_contracts_status_active'), tone: 'success' },
          closed: { label: t('lab_contracts_status_closed'), tone: 'neutral' },
        },
      },
    ],
    filter: { kind: 'client' },
  },
];
