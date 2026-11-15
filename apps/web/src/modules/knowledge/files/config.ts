import type { ConfigTab } from '@/core/module-config/types';
import { t } from '@/modules/knowledge/files/i18n';

export const tabs: ConfigTab[] = [
  {
    id: 'all',
    label: t('tab_all'),
    resource: 'files',
    columns: [
      { id: 'name', header: t('col_all_name'), field: 'name' },
      {
        id: 'kind',
        header: t('col_all_kind'),
        field: 'kind',
        format: 'badge',
        labels: {
          pdf: { label: t('lab_all_kind_pdf'), tone: 'neutral' },
          dxf: { label: t('lab_all_kind_dxf'), tone: 'info' },
          docx: { label: t('lab_all_kind_docx'), tone: 'neutral' },
          xlsx: { label: t('lab_all_kind_xlsx'), tone: 'neutral' },
          zip: { label: t('lab_all_kind_zip'), tone: 'neutral' },
          audio: { label: t('lab_all_kind_audio'), tone: 'neutral' },
        },
      },
      {
        id: 'obraId',
        header: t('col_all_obraId'),
        field: 'obraId',
        format: 'name',
        hideOnMobile: true,
      },
      {
        id: 'discipline',
        header: t('col_all_discipline'),
        field: 'discipline',
        hideOnMobile: true,
      },
      {
        id: 'version',
        header: t('col_all_version'),
        field: 'version',
        format: 'number',
        hideOnMobile: true,
      },
      {
        id: 'sizeKb',
        header: t('col_all_sizeKb'),
        field: 'sizeKb',
        format: 'number',
        align: 'right',
        hideOnMobile: true,
      },
    ],
    sort: 'name',
  },
  {
    id: 'drawings',
    label: t('tab_drawings'),
    resource: 'files',
    columns: [
      { id: 'name', header: t('col_drawings_name'), field: 'name' },
      { id: 'obraId', header: t('col_drawings_obraId'), field: 'obraId', format: 'name' },
      {
        id: 'discipline',
        header: t('col_drawings_discipline'),
        field: 'discipline',
        hideOnMobile: true,
      },
    ],
    filter: { kind: 'dxf' },
    sort: 'name',
  },
];
