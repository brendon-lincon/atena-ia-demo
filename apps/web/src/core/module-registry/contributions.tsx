import { lazy, Suspense, useState, type ComponentType } from 'react';
import type { Contribution } from './types';

const cache = new Map<string, ComponentType<never>>();

function componentOf<P extends object>(contribution: Contribution<P>): ComponentType<P> {
  const cached = cache.get(contribution.id);
  if (cached) return cached as unknown as ComponentType<P>;
  const created = lazy(contribution.load);
  cache.set(contribution.id, created);
  return created;
}

/** Renderiza, com carregamento sob demanda, o componente entregue por uma contribuição. */
export function Contributed<P extends object>({
  contribution,
  ...props
}: { contribution: Contribution<P> } & P) {
  const [Component] = useState(() => componentOf(contribution));
  return (
    <Suspense fallback={null}>
      <Component {...(props as unknown as P)} />
    </Suspense>
  );
}
