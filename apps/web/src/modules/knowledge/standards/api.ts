import { z } from 'zod';
import { defineResource } from '@/core/api/resource';
import { useList } from '@/core/api/hooks';

const blockSchema = z.object({
  type: z.enum(['heading', 'paragraph', 'signature', 'table']),
  text: z.string().optional(),
});
export const templateSchema = z.object({
  id: z.string(),
  name: z.string(),
  category: z.string(),
  description: z.string(),
  system: z.boolean().optional(),
  blocks: z.array(blockSchema),
  fields: z.array(z.object({ key: z.string(), label: z.string() })),
});
export type Template = z.infer<typeof templateSchema>;
export const templatesApi = defineResource('document-templates', templateSchema);

export const emailTemplateSchema = z.object({
  id: z.string(),
  name: z.string(),
  subject: z.string(),
  body: z.string(),
  system: z.boolean().optional(),
  variables: z.array(z.string()),
});
export type EmailTemplate = z.infer<typeof emailTemplateSchema>;
export const emailTemplatesApi = defineResource('email-templates', emailTemplateSchema);

export const useTemplates = () => useList(templatesApi, { pageSize: 100 });
export const useEmailTemplates = () => useList(emailTemplatesApi, { pageSize: 100 });
