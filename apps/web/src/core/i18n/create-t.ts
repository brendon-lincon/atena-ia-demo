export type Dictionary = { readonly [key: string]: string | Dictionary };

export type MessagePath<T> = T extends string
  ? never
  : {
      [K in keyof T & string]: T[K] extends string ? K : `${K}.${MessagePath<T[K]>}`;
    }[keyof T & string];

type Params = Record<string, string | number>;

/** Cria uma função de tradução tipada para um dicionário (um por módulo ou camada). */
export function createT<const D extends Dictionary>(dictionary: D) {
  return (key: MessagePath<D>, params?: Params): string => {
    let node: string | Dictionary | undefined = dictionary;
    for (const part of key.split('.')) {
      node = typeof node === 'object' ? node[part] : undefined;
    }
    if (typeof node !== 'string') return key;
    return params
      ? node.replace(/\{(\w+)\}/g, (_, name: string) => String(params[name] ?? `{${name}}`))
      : node;
  };
}
