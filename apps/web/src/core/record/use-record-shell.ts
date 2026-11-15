import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';
import { useCreate } from '@/core/api/hooks';
import { defineResource } from '@/core/api/resource';
import { useAuth } from '@/core/auth/auth-store';
import { useDirectory } from '@/core/directory/use-directory';
import type { RecordShellProps } from '@/design/patterns/record-shell';

const noteSchema = z.object({
  id: z.string(),
  recordType: z.string(),
  recordId: z.string(),
  body: z.string(),
  authorId: z.string().optional(),
  pinned: z.boolean().optional(),
  createdAt: z.string(),
});
const fileSchema = z.object({ id: z.string(), name: z.string(), sizeKb: z.number() });
const versionSchema = z.object({
  id: z.string(),
  number: z.number(),
  authorId: z.string(),
  reason: z.string(),
  createdAt: z.string(),
});
const activitySchema = z.object({
  id: z.string(),
  userId: z.string(),
  summary: z.string(),
  at: z.string(),
});
const notes = defineResource('notes', noteSchema);
const files = defineResource('files', fileSchema);
const versions = defineResource('versions', versionSchema);
const activity = defineResource('activity', activitySchema);

/** Notas, anexos, versões e atividade de qualquer registro, no formato da moldura de registro. */
export function useRecordShellData(
  recordType: string,
  recordId: string | undefined,
): Pick<RecordShellProps, 'notes' | 'attachments' | 'versions' | 'activity'> {
  const dir = useDirectory();
  const user = useAuth((state) => state.user);
  const enabled = Boolean(recordId);
  const filter = { recordType, recordId: recordId ?? '' };
  const noteQuery = useQuery({
    queryKey: ['notes', 'list', filter],
    queryFn: () => notes.list({ filter, sort: '-createdAt' }),
    enabled,
  });
  const fileQuery = useQuery({
    queryKey: ['files', 'list', filter],
    queryFn: () => files.list({ filter }),
    enabled,
  });
  const versionQuery = useQuery({
    queryKey: ['versions', 'list', filter],
    queryFn: () => versions.list({ filter, sort: '-number' }),
    enabled,
  });
  const activityQuery = useQuery({
    queryKey: ['activity', 'list', filter],
    queryFn: () => activity.list({ filter, sort: '-at', pageSize: 20 }),
    enabled,
  });
  const create = useCreate(notes);
  return {
    notes: {
      items: (noteQuery.data?.data ?? []).map((n) => ({
        id: n.id,
        author: dir.name(n.authorId) || user?.name || '',
        initials:
          dir
            .name(n.authorId)
            .split(' ')
            .map((p) => p[0])
            .slice(0, 2)
            .join('') ||
          user?.initials ||
          '',
        body: n.body,
        at: n.createdAt,
        pinned: n.pinned,
      })),
      onAdd: (body) =>
        create.mutate({ recordType, recordId: recordId ?? '', body, authorId: user?.id }),
    },
    attachments: (fileQuery.data?.data ?? []).map((f) => ({
      id: f.id,
      name: f.name,
      sizeKb: f.sizeKb,
    })),
    versions: (versionQuery.data?.data ?? []).map((v) => ({
      id: v.id,
      number: v.number,
      author: dir.name(v.authorId),
      at: v.createdAt,
      reason: v.reason,
    })),
    activity: (activityQuery.data?.data ?? []).map((a) => ({
      id: a.id,
      who: dir.name(a.userId),
      summary: a.summary,
      at: a.at,
    })),
  };
}
