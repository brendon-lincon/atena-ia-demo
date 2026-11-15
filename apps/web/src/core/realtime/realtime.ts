import { eventsUrl } from '@/core/api/client';

type Handler = (data: unknown) => void;
const POLL_MS = 5000;
const listeners = new Map<string, Set<Handler>>();
let source: EventSource | null = null;
let poll: number | undefined;

function emit(type: string, data: unknown): void {
  listeners.get(type)?.forEach((handler) => handler(data));
}

/** Canal em tempo real (SSE). Se cair, o front-end segue por consulta periódica (evento `poll`). */
export function startRealtime(): void {
  if (source) return;
  source = new EventSource(eventsUrl());
  for (const type of ['heartbeat', 'notification', 'job']) {
    source.addEventListener(type, (event) =>
      emit(type, JSON.parse((event as MessageEvent<string>).data)),
    );
  }
  source.onopen = () => {
    window.clearInterval(poll);
    poll = undefined;
  };
  source.onerror = () => {
    poll ??= window.setInterval(() => emit('poll', null), POLL_MS);
  };
}

export function stopRealtime(): void {
  source?.close();
  source = null;
  window.clearInterval(poll);
  poll = undefined;
}

export function onEvent(type: string, handler: Handler): () => void {
  const set = listeners.get(type) ?? new Set<Handler>();
  set.add(handler);
  listeners.set(type, set);
  return () => set.delete(handler);
}
