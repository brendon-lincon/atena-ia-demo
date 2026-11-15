import type { ConfigTab } from '@/core/module-config/types';
import { t } from '@/modules/company/safety/i18n';

export const tabs: ConfigTab[] = [
  {
    id: 'exams',
    label: t('tab_exams'),
    resource: 'health-exams',
    columns: [
      { id: 'employeeId', header: t('col_exams_employeeId'), field: 'employeeId', format: 'name' },
      {
        id: 'type',
        header: t('col_exams_type'),
        field: 'type',
        format: 'badge',
        labels: {
          admission: { label: t('lab_exams_type_admission'), tone: 'neutral' },
          periodic: { label: t('lab_exams_type_periodic'), tone: 'info' },
          return: { label: t('lab_exams_type_return'), tone: 'neutral' },
          demission: { label: t('lab_exams_type_demission'), tone: 'neutral' },
        },
      },
      {
        id: 'issuedAt',
        header: t('col_exams_issuedAt'),
        field: 'issuedAt',
        format: 'date',
        hideOnMobile: true,
      },
      {
        id: 'validUntil',
        header: t('col_exams_validUntil'),
        field: 'validUntil',
        format: 'validity',
      },
      {
        id: 'result',
        header: t('col_exams_result'),
        field: 'result',
        format: 'badge',
        labels: {
          fit: { label: t('lab_exams_result_fit'), tone: 'success' },
          fit_with_restrictions: {
            label: t('lab_exams_result_fit_with_restrictions'),
            tone: 'warning',
          },
        },
        hideOnMobile: true,
      },
    ],
    sort: 'validUntil',
  },
  {
    id: 'trainings',
    label: t('tab_trainings'),
    resource: 'trainings',
    columns: [
      {
        id: 'employeeId',
        header: t('col_trainings_employeeId'),
        field: 'employeeId',
        format: 'name',
      },
      { id: 'courseCode', header: t('col_trainings_courseCode'), field: 'courseCode' },
      { id: 'title', header: t('col_trainings_title'), field: 'title', hideOnMobile: true },
      {
        id: 'completedAt',
        header: t('col_trainings_completedAt'),
        field: 'completedAt',
        format: 'date',
        hideOnMobile: true,
      },
      {
        id: 'validUntil',
        header: t('col_trainings_validUntil'),
        field: 'validUntil',
        format: 'validity',
      },
    ],
    sort: 'validUntil',
  },
  {
    id: 'accidents',
    label: t('tab_accidents'),
    resource: 'work-accidents',
    columns: [
      { id: 'date', header: t('col_accidents_date'), field: 'date', format: 'date' },
      { id: 'obraId', header: t('col_accidents_obraId'), field: 'obraId', format: 'name' },
      {
        id: 'employeeId',
        header: t('col_accidents_employeeId'),
        field: 'employeeId',
        format: 'name',
        hideOnMobile: true,
      },
      {
        id: 'severity',
        header: t('col_accidents_severity'),
        field: 'severity',
        format: 'badge',
        labels: {
          no_leave: { label: t('lab_accidents_severity_no_leave'), tone: 'neutral' },
          with_leave: { label: t('lab_accidents_severity_with_leave'), tone: 'warning' },
        },
      },
      {
        id: 'daysOff',
        header: t('col_accidents_daysOff'),
        field: 'daysOff',
        format: 'number',
        align: 'right',
        hideOnMobile: true,
      },
      {
        id: 'investigationStatus',
        header: t('col_accidents_investigationStatus'),
        field: 'investigationStatus',
        format: 'badge',
        labels: {
          closed: { label: t('lab_accidents_investigationStatus_closed'), tone: 'success' },
          open: { label: t('lab_accidents_investigationStatus_open'), tone: 'warning' },
        },
        hideOnMobile: true,
      },
    ],
    sort: '-date',
  },
  {
    id: 'deadlines',
    label: t('tab_deadlines'),
    resource: 'deadlines',
    columns: [
      { id: 'title', header: t('col_deadlines_title'), field: 'title' },
      { id: 'dueDate', header: t('col_deadlines_dueDate'), field: 'dueDate', format: 'validity' },
      {
        id: 'kind',
        header: t('col_deadlines_kind'),
        field: 'kind',
        format: 'badge',
        labels: {
          aso: { label: t('lab_deadlines_kind_aso'), tone: 'warning' },
          training: { label: t('lab_deadlines_kind_training'), tone: 'info' },
          license: { label: t('lab_deadlines_kind_license'), tone: 'info' },
          certificate: { label: t('lab_deadlines_kind_certificate'), tone: 'neutral' },
          insurance: { label: t('lab_deadlines_kind_insurance'), tone: 'neutral' },
          contract: { label: t('lab_deadlines_kind_contract'), tone: 'neutral' },
          obligation: { label: t('lab_deadlines_kind_obligation'), tone: 'warning' },
          registration: { label: t('lab_deadlines_kind_registration'), tone: 'neutral' },
          ppe: { label: t('lab_deadlines_kind_ppe'), tone: 'neutral' },
        },
      },
    ],
    filter: { kind: 'aso,training' },
    sort: 'dueDate',
  },
];
