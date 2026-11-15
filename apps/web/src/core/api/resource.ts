import { z } from 'zod';
import { request, toSearch } from './client';

export interface ListParams {
  q?: string;
  filter?: Record<string, string | string[]>;
  sort?: string;
  page?: number;
  pageSize?: number;
}
export interface Page<T> {
  data: T[];
  meta: { total: number; page: number; pageSize: number };
}

/** Campos comuns a todo registro do contrato. */
export function recordSchema<S extends z.ZodRawShape>(shape: S) {
  return z.object({
    id: z.string(),
    createdAt: z.string().optional(),
    updatedAt: z.string().optional(),
    ...shape,
  });
}

export interface Resource<T> {
  readonly name: string;
  list(params?: ListParams): Promise<Page<T>>;
  get(id: string): Promise<T>;
  create(data: Partial<T>): Promise<T>;
  update(id: string, patch: Partial<T>): Promise<T>;
  remove(id: string): Promise<void>;
}

/** Cliente tipado de uma coleção do `/api/v1`; o esquema Zod do módulo valida e tipa as respostas. */
export function defineResource<S extends z.ZodType>(name: string, schema: S): Resource<z.infer<S>> {
  type T = z.infer<S>;
  const path = `/${name}`;
  return {
    name,
    async list(params = {}) {
      const { filter, ...rest } = params;
      const payload = await request<{ data: unknown[]; meta: Page<T>['meta'] }>('GET', path, {
        search: toSearch(rest, filter),
      });
      return { data: z.array(schema).parse(payload.data), meta: payload.meta };
    },
    async get(id) {
      return schema.parse((await request<{ data: unknown }>('GET', `${path}/${id}`)).data);
    },
    async create(data) {
      return schema.parse((await request<{ data: unknown }>('POST', path, { body: data })).data);
    },
    async update(id, patch) {
      return schema.parse(
        (await request<{ data: unknown }>('PATCH', `${path}/${id}`, { body: patch })).data,
      );
    },
    async remove(id) {
      await request('DELETE', `${path}/${id}`);
    },
  };
}
