import { useQuery, useQueryClient } from '@tanstack/react-query';
import { create } from 'zustand';
import { z } from 'zod';
import { defineResource } from '@/core/api/resource';
import { useRealtimeEvent } from '@/core/realtime/hooks';

export const notificationSchema = z.object({
  id: z.string(),
  title: z.string(),
  body: z.string(),
  kind: z.string(),
  link: z.string().optional(),
  readAt: z.string().nullable().optional(),
  createdAt: z.string(),
});
export type AppNotification = z.infer<typeof notificationSchema>;
export const notificationsApi = defineResource('notifications', notificationSchema);

interface LiveState {
  items: AppNotification[];
  push: (item: AppNotification) => void;
  clear: () => void;
}
export const useLiveNotifications = create<LiveState>((set) => ({
  items: [],
  push: (item) => set((state) => ({ items: [item, ...state.items] })),
  clear: () => set({ items: [] }),
}));

/** Avisos do servidor somados aos que chegam pelo canal em tempo real. */
export function useNotifications(onArrive?: (item: AppNotification) => void) {
  const client = useQueryClient();
  const live = useLiveNotifications();
  const stored = useQuery({
    queryKey: ['notifications', 'list', { sort: '-createdAt' }],
    queryFn: () => notificationsApi.list({ sort: '-createdAt', pageSize: 20 }),
  });
  useRealtimeEvent('notification', (data) => {
    const parsed = notificationSchema.safeParse(data);
    if (!parsed.success) return;
    live.push(parsed.data);
    onArrive?.(parsed.data);
  });
  useRealtimeEvent('poll', () => void client.invalidateQueries({ queryKey: ['notifications'] }));
  const items = [...live.items, ...(stored.data?.data ?? [])];
  return { items, unread: items.filter((n) => !n.readAt).length, markAllRead: () => live.clear() };
}
