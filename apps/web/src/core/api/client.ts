import { session } from '@/core/auth/session';

const BASE = '/api/v1';

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
  ) {
    super(message);
  }
}

export type Query = Record<string, string | number | boolean | string[] | undefined>;

export function toSearch(
  query: Query | undefined,
  filter?: Record<string, string | string[]>,
): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value !== undefined && value !== '')
      params.set(key, Array.isArray(value) ? value.join(',') : String(value));
  }
  for (const [key, value] of Object.entries(filter ?? {})) {
    params.set(`filter[${key}]`, Array.isArray(value) ? value.join(',') : value);
  }
  const text = params.toString();
  return text ? `?${text}` : '';
}

/** Única porta de saída de dados do front-end: nenhum componente chama a rede diretamente. */
export async function request<T>(
  method: string,
  path: string,
  options: { body?: unknown; search?: string; auth?: boolean } = {},
): Promise<T> {
  const token = session.get();
  let response: Response;
  try {
    response = await fetch(`${BASE}${path}${options.search ?? ''}`, {
      method,
      headers: {
        ...(options.body === undefined ? {} : { 'Content-Type': 'application/json' }),
        ...(token && options.auth !== false ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
    });
  } catch {
    throw new ApiError(0, 'network', 'Sem conexão com o servidor.');
  }
  if (response.status === 401 && options.auth !== false) session.expire();
  const payload = (await response.json().catch(() => null)) as {
    data?: T;
    error?: { code: string; message: string };
  } | null;
  if (!response.ok || !payload || payload.error) {
    throw new ApiError(
      response.status,
      payload?.error?.code ?? 'unknown',
      payload?.error?.message ?? 'Não foi possível concluir a operação.',
    );
  }
  return payload as T;
}

export function eventsUrl(): string {
  return `${BASE}/events?token=${encodeURIComponent(session.get() ?? '')}`;
}
