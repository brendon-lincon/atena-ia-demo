import { z } from 'zod';
import { defineResource } from '@/core/api/resource';

const itemSchema = z.object({
  id: z.string(),
  code: z.string(),
  title: z.string(),
  kind: z.string(),
});
export const libraryApi = defineResource('library-items', itemSchema);
