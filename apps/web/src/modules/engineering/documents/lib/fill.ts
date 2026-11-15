import type { Company, Contact, Contract, EapItem, Obra } from '@/core/entities';
import { formatDate, formatMoney } from '@/core/format';
import type { DocumentBlock, DocumentSegment } from '@/design/patterns/document-page';
import { t } from '@/modules/engineering/documents/i18n';

export type Origin = 'obra' | 'client' | 'company' | 'contract' | 'eap' | 'auto';
export interface FieldValue {
  value: string;
  origin: Origin | null;
}
export interface FillSources {
  obra?: Obra;
  client?: Contact;
  company: Company;
  contract?: Contract;
  fronts: EapItem[];
  today: Date;
  sequence: number;
}

/** Preenche o que os dados do sistema conhecem; o restante fica em branco para a pessoa preencher. */
export function autofill(s: FillSources): Record<string, FieldValue> {
  const auto = (value: string, origin: Origin): FieldValue => ({ value, origin });
  const out: Record<string, FieldValue> = {
    empresa: auto(s.company.legalName, 'company'),
    cnpj: auto(s.company.cnpj, 'company'),
    sede: auto(`${s.company.address.city}/${s.company.address.state}`, 'company'),
    responsavel: auto(s.company.technicalResponsible.name, 'company'),
    conselho: auto(s.company.technicalResponsible.council, 'company'),
    registro: auto(s.company.technicalResponsible.registration, 'company'),
    data: auto(formatDate(s.today.toISOString().slice(0, 10)), 'auto'),
    numero: auto(`${String(s.sequence).padStart(3, '0')}/${s.today.getFullYear()}`, 'auto'),
    tipo: auto('provisório', 'auto'),
    indice: auto('INCC-M', 'contract'),
    retencao: auto('5', 'contract'),
    garantia: auto('5', 'contract'),
  };
  if (s.obra) {
    Object.assign(out, {
      obra: auto(s.obra.name, 'obra'),
      cidade: auto(s.obra.city, 'obra'),
      uf: auto(s.obra.state, 'obra'),
      escopo: auto(s.obra.description.split(':')[0]?.toLowerCase() ?? '', 'obra'),
      avanco: auto(String(s.obra.actualPhysicalPct), 'obra'),
      efetivo: auto(String(s.obra.headcount), 'obra'),
      inicio: auto(formatDate(s.obra.startDate), 'obra'),
      termino: auto(formatDate(s.obra.endDate), 'obra'),
      servicos: auto(
        [...s.fronts]
          .sort((a, b) => a.code.localeCompare(b.code, 'pt-BR', { numeric: true }))
          .map((f) => `${f.code}. ${f.name}`)
          .join('\n'),
        'eap',
      ),
    });
  }
  if (s.client) out.contratante = auto(s.client.name, 'client');
  if (s.contract) out.valor = auto(formatMoney(s.contract.valueCents), 'contract');
  return out;
}

const PLACEHOLDER = /\{\{(\w+)\}\}/g;

export function fieldKeys(blocks: { text?: string }[]): string[] {
  return [
    ...new Set(
      blocks.flatMap((b) => [...(b.text ?? '').matchAll(PLACEHOLDER)].map((m) => m[1] ?? '')),
    ),
  ];
}

/** Divide o texto do modelo em trechos; os campos preenchidos pela Atena saem marcados para o brilho azul-claro. */
export function toSegments(text: string, values: Record<string, FieldValue>): DocumentSegment[] {
  const parts: DocumentSegment[] = [];
  let last = 0;
  for (const m of text.matchAll(PLACEHOLDER)) {
    const index = m.index;
    if (index > last) parts.push({ text: text.slice(last, index) });
    const field = values[m[1] ?? ''];
    parts.push(
      field?.value
        ? { text: field.value, filled: field.origin !== null }
        : { text: `[${t(`fieldLabels.${(m[1] ?? 'texto') as 'obra'}`)}]` },
    );
    last = index + m[0].length;
  }
  if (last < text.length) parts.push({ text: text.slice(last) });
  return parts;
}

export function toBlocks(
  template: { blocks: { type: DocumentBlock['type']; text?: string }[] },
  values: Record<string, FieldValue>,
): DocumentBlock[] {
  return template.blocks.map((b) =>
    b.type === 'paragraph'
      ? { type: b.type, segments: toSegments(b.text ?? '', values) }
      : {
          type: b.type,
          text: toSegments(b.text ?? '', values)
            .map((s) => s.text)
            .join(''),
        },
  );
}

/** Versão em texto puro dos blocos (é o que fica gravado no documento emitido). */
export function flatten(blocks: DocumentBlock[]): { type: DocumentBlock['type']; text: string }[] {
  return blocks.map((b) => ({
    type: b.type,
    text: b.segments ? b.segments.map((s) => s.text).join('') : (b.text ?? ''),
  }));
}
