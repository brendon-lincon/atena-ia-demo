import { z } from 'zod';
import { defineResource } from '@/core/api/resource';
import { useList } from '@/core/api/hooks';

export const libraryItemSchema = z.object({
  id: z.string(),
  area: z.string(),
  areaLabel: z.string(),
  subarea: z.string(),
  code: z.string(),
  title: z.string(),
  issuer: z.string(),
  kind: z.string(),
  source: z.string(),
  summary: z.string(),
  version: z.string(),
  effectiveFrom: z.string(),
  status: z.string(),
  hasFile: z.boolean(),
  appliesTo: z.object({ obraTypes: z.array(z.string()), states: z.array(z.string()) }),
});
export type LibraryItem = z.infer<typeof libraryItemSchema>;
export const libraryApi = defineResource('library-items', libraryItemSchema);
export const useLibrary = () => useList(libraryApi, { sort: 'code', pageSize: 200 });
