import { useQuery } from '@tanstack/react-query';
import { companies } from './index';

/** Dados e identidade da empresa usuária (o logotipo do cliente aparece nos documentos emitidos). */
export function useCompany() {
  return useQuery({
    queryKey: ['company', 'current'],
    queryFn: async () => (await companies.list()).data[0],
    staleTime: 300_000,
  });
}
