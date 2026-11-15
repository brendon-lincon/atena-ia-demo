import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { defineResource } from '@/core/api/resource';
import { looseRecord } from '@/core/api/loose';
import { useList, useRecord } from '@/core/api/hooks';

const blockSchema = z.object({
  type: z.enum(['heading', 'paragraph', 'signature', 'table']),
  text: z.string().optional(),
  rows: z.array(z.array(z.string())).optional(),
});
export const documentSchema = z.object({
  id: z.string(),
  templateId: z.string().optional(),
  obraId: z.string().nullable().optional(),
  type: z.string(),
  title: z.string(),
  number: z.string(),
  version: z.number().optional(),
  status: z.enum(['draft', 'in_review', 'approved', 'issued', 'cancelled', 'archived']),
  issuedAt: z.string().nullable().optional(),
  blocks: z.array(blockSchema),
  createdAt: z.string().optional(),
});
export type DocumentFull = z.infer<typeof documentSchema>;
export const documentsApi = defineResource('documents', documentSchema);

export const templateSchema = z.object({
  id: z.string(),
  name: z.string(),
  category: z.string(),
  description: z.string(),
  blocks: z.array(blockSchema),
  fields: z.array(z.object({ key: z.string(), label: z.string() })),
});
export type Template = z.infer<typeof templateSchema>;
const templatesApi = defineResource('document-templates', templateSchema);
export const filesApi = defineResource('files', looseRecord);

export const useDocuments = () => useList(documentsApi, { sort: '-createdAt', pageSize: 200 });
export const useDocument = (id?: string) => useRecord(documentsApi, id);
export const useTemplates = () => useList(templatesApi, { pageSize: 50 });
export const usePdfFiles = () => useList(filesApi, { filter: { kind: 'pdf' }, pageSize: 100 });

export function useSaveDocument() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<DocumentFull>) => documentsApi.create(data),
    onSuccess: () => client.invalidateQueries({ queryKey: ['documents'] }),
  });
}

export function useAdvanceDocument() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: DocumentFull['status'] }) =>
      documentsApi.update(id, {
        status,
        issuedAt: status === 'issued' ? new Date().toISOString().slice(0, 10) : null,
      }),
    onSuccess: () => client.invalidateQueries({ queryKey: ['documents'] }),
  });
}
