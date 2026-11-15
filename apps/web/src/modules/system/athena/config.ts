import type { ConfigTab } from '@/core/module-config/types';
import { t } from '@/modules/system/athena/i18n';

export const tabs: ConfigTab[] = [
  {
    id: 'insights',
    label: t('tab_insights'),
    resource: 'insights',
    columns: [
      { id: 'title', header: t('col_insights_title'), field: 'title' },
      {
        id: 'severity',
        header: t('col_insights_severity'),
        field: 'severity',
        format: 'badge',
        labels: {
          info: { label: t('lab_insights_severity_info'), tone: 'neutral' },
          attention: { label: t('lab_insights_severity_attention'), tone: 'warning' },
          critical: { label: t('lab_insights_severity_critical'), tone: 'danger' },
        },
      },
      {
        id: 'generatedAt',
        header: t('col_insights_generatedAt'),
        field: 'generatedAt',
        format: 'datetime',
        hideOnMobile: true,
      },
      {
        id: 'status',
        header: t('col_insights_status'),
        field: 'status',
        format: 'badge',
        labels: {
          new: { label: t('lab_insights_status_new'), tone: 'info' },
          accepted: { label: t('lab_insights_status_accepted'), tone: 'success' },
          snoozed: { label: t('lab_insights_status_snoozed'), tone: 'warning' },
          dismissed: { label: t('lab_insights_status_dismissed'), tone: 'neutral' },
        },
      },
    ],
    sort: '-generatedAt',
    detail: [
      { id: 'title', header: t('det_insights_title'), field: 'title' },
      { id: 'body', header: t('det_insights_body'), field: 'body', format: 'multiline' },
      { id: 'source_label', header: t('det_insights_source_label'), field: 'source.label' },
      {
        id: 'suggested_action',
        header: t('det_insights_suggested_action'),
        field: 'suggestedAction.label',
      },
    ],
  },
  {
    id: 'activity',
    label: t('tab_activity'),
    resource: 'activity',
    columns: [
      { id: 'at', header: t('col_activity_at'), field: 'at', format: 'datetime' },
      {
        id: 'userId',
        header: t('col_activity_userId'),
        field: 'userId',
        format: 'name',
        hideOnMobile: true,
      },
      { id: 'summary', header: t('col_activity_summary'), field: 'summary' },
    ],
    sort: '-at',
  },
];
