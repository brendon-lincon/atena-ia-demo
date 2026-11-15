import { z } from 'zod';
import { defineResource } from '@/core/api/resource';
import { useList, useRecord } from '@/core/api/hooks';
import { photos } from '@/core/entities';

export const conversationSchema = z.object({
  id: z.string(),
  title: z.string(),
  contactId: z.string().nullable().optional(),
  obraId: z.string().nullable().optional(),
  labels: z.array(z.string()),
  isGroup: z.boolean(),
  unread: z.number(),
  lastMessageAt: z.string(),
});
export type Conversation = z.infer<typeof conversationSchema>;
export const conversationsApi = defineResource('conversations', conversationSchema);

export const messageSchema = z.object({
  id: z.string(),
  conversationId: z.string(),
  direction: z.enum(['in', 'out']),
  type: z.enum(['text', 'image', 'audio']),
  body: z.string().nullable().optional(),
  transcript: z.string().nullable().optional(),
  caption: z.string().nullable().optional(),
  photoId: z.string().nullable().optional(),
  durationSec: z.number().nullable().optional(),
  sentAt: z.string(),
  status: z.string(),
});
export type Message = z.infer<typeof messageSchema>;
export const messagesApi = defineResource('messages', messageSchema);

export const useConversations = () =>
  useList(conversationsApi, { sort: '-lastMessageAt', pageSize: 100 });
export const useMessages = (conversationId?: string) =>
  useList(
    messagesApi,
    { filter: { conversationId: conversationId ?? '' }, sort: 'sentAt', pageSize: 300 },
    { enabled: Boolean(conversationId) },
  );
export const usePhoto = (id?: string | null) => useRecord(photos, id ?? undefined);
