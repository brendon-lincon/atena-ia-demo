import { useEffect, useRef } from 'react';
import { onEvent } from './realtime';

export function useRealtimeEvent(
  type: 'heartbeat' | 'notification' | 'job' | 'poll',
  handler: (data: unknown) => void,
): void {
  const ref = useRef(handler);
  useEffect(() => {
    ref.current = handler;
  });
  useEffect(() => onEvent(type, (data) => ref.current(data)), [type]);
}
