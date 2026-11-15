import type { ConfigTab } from '@/core/module-config/types';
import { t } from '@/modules/communication/email/i18n';

export const tabs: ConfigTab[] = [
  {
    id: 'inbox',
    label: t('tab_inbox'),
    resource: 'emails',
    columns: [
      { id: 'subject', header: t('col_inbox_subject'), field: 'subject' },
      {
        id: 'contactId',
        header: t('col_inbox_contactId'),
        field: 'contactId',
        format: 'name',
        hideOnMobile: true,
      },
      {
        id: 'obraId',
        header: t('col_inbox_obraId'),
        field: 'obraId',
        format: 'name',
        hideOnMobile: true,
      },
      {
        id: 'receivedAt',
        header: t('col_inbox_receivedAt'),
        field: 'receivedAt',
        format: 'datetime',
        hideOnMobile: true,
      },
      {
        id: 'read',
        header: t('col_inbox_read'),
        field: 'read',
        format: 'badge',
        labels: {
          true: { label: t('lab_inbox_read_true'), tone: 'neutral' },
          false: { label: t('lab_inbox_read_false'), tone: 'info' },
        },
        hideOnMobile: true,
      },
    ],
    filter: { folder: 'inbox' },
    sort: '-receivedAt',
    detail: [
      { id: 'subject', header: t('det_inbox_subject'), field: 'subject' },
      { id: 'contactId', header: t('det_inbox_contactId'), field: 'contactId', format: 'name' },
      {
        id: 'receivedAt',
        header: t('det_inbox_receivedAt'),
        field: 'receivedAt',
        format: 'datetime',
      },
      { id: 'body', header: t('det_inbox_body'), field: 'body', format: 'multiline' },
    ],
  },
  {
    id: 'drafts',
    label: t('tab_drafts'),
    resource: 'emails',
    columns: [
      { id: 'subject', header: t('col_drafts_subject'), field: 'subject' },
      {
        id: 'contactId',
        header: t('col_drafts_contactId'),
        field: 'contactId',
        format: 'name',
        hideOnMobile: true,
      },
      {
        id: 'obraId',
        header: t('col_drafts_obraId'),
        field: 'obraId',
        format: 'name',
        hideOnMobile: true,
      },
      {
        id: 'draftedBy',
        header: t('col_drafts_draftedBy'),
        field: 'draftedBy',
        hideOnMobile: true,
      },
    ],
    filter: { folder: 'drafts' },
    sort: '-receivedAt',
    detail: [
      { id: 'subject', header: t('det_drafts_subject'), field: 'subject' },
      { id: 'contactId', header: t('det_drafts_contactId'), field: 'contactId', format: 'name' },
      { id: 'body', header: t('det_drafts_body'), field: 'body', format: 'multiline' },
    ],
  },
  {
    id: 'sent',
    label: t('tab_sent'),
    resource: 'emails',
    columns: [
      { id: 'subject', header: t('col_sent_subject'), field: 'subject' },
      {
        id: 'contactId',
        header: t('col_sent_contactId'),
        field: 'contactId',
        format: 'name',
        hideOnMobile: true,
      },
      {
        id: 'receivedAt',
        header: t('col_sent_receivedAt'),
        field: 'receivedAt',
        format: 'datetime',
      },
    ],
    filter: { folder: 'sent' },
    sort: '-receivedAt',
    detail: [
      { id: 'subject', header: t('det_sent_subject'), field: 'subject' },
      { id: 'contactId', header: t('det_sent_contactId'), field: 'contactId', format: 'name' },
      { id: 'body', header: t('det_sent_body'), field: 'body', format: 'multiline' },
    ],
  },
  {
    id: 'templates',
    label: t('tab_templates'),
    resource: 'email-templates',
    columns: [
      { id: 'name', header: t('col_templates_name'), field: 'name' },
      { id: 'subject', header: t('col_templates_subject'), field: 'subject', hideOnMobile: true },
      {
        id: 'variables',
        header: t('col_templates_variables'),
        field: 'variables',
        format: 'list',
        hideOnMobile: true,
      },
    ],
    detail: [
      { id: 'name', header: t('det_templates_name'), field: 'name' },
      { id: 'subject', header: t('det_templates_subject'), field: 'subject' },
      { id: 'body', header: t('det_templates_body'), field: 'body', format: 'multiline' },
    ],
  },
];
