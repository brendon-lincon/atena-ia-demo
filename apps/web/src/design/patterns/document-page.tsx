import { motion } from 'motion/react';
import { Fragment } from 'react';
import { createT } from '@/core/i18n/create-t';
import { messages } from '@/core/i18n/messages';
import { cn } from '@/design/cn';

const t = createT(messages);
export interface DocumentSegment {
  text: string;
  filled?: boolean;
}
export interface DocumentBlock {
  type: 'heading' | 'paragraph' | 'signature' | 'table';
  text?: string;
  segments?: DocumentSegment[];
  rows?: string[][];
}
export interface DocumentIdentity {
  name: string;
  logoText: string;
  headerNote?: string;
  footerNote?: string;
  accent?: string;
}

/** Folha A4 com a identidade da empresa. Trechos preenchidos pela Atena recebem um brilho azul-claro. */
export function DocumentPage({
  identity,
  blocks,
  number,
  page = 1,
  pages = 1,
}: {
  identity: DocumentIdentity;
  blocks: DocumentBlock[];
  number?: string;
  page?: number;
  pages?: number;
}) {
  return (
    <article
      className="document-sheet relative mx-auto flex aspect-[210/297] w-full max-w-[794px] flex-col bg-paper p-[7%] text-paper-foreground shadow-lg"
      style={
        identity.accent ? ({ '--doc-accent': identity.accent } as React.CSSProperties) : undefined
      }
    >
      <header className="flex items-center gap-3 border-b border-paper-border pb-3">
        <span className="flex size-11 items-center justify-center rounded-md bg-[var(--doc-accent,var(--primary-strong))] text-sm font-bold tracking-tight text-white">
          {identity.logoText}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{identity.name}</p>
          {identity.headerNote && (
            <p className="truncate text-[10px] text-paper-muted">{identity.headerNote}</p>
          )}
        </div>
        {number && <span className="font-numeric text-[10px] text-paper-muted">{number}</span>}
      </header>
      <div className="flex-1 space-y-3 overflow-hidden py-5 text-[11px] leading-relaxed">
        {blocks.map((block, index) => {
          if (block.type === 'heading')
            return (
              <h2 key={index} className="pb-1 text-center text-sm font-bold tracking-tight">
                {block.text}
              </h2>
            );
          if (block.type === 'signature') {
            const [name, role] = (block.text ?? '').split('\n');
            return (
              <div
                key={index}
                className="mt-8 w-56 border-t border-paper-foreground pt-1 text-center"
              >
                <p className="font-medium">{name}</p>
                <p className="text-[10px] text-paper-muted">{role ?? t('document.signature')}</p>
              </div>
            );
          }
          if (block.type === 'table') {
            return (
              <table key={index} className="w-full border-collapse text-[10px]">
                <tbody>
                  {block.rows?.map((row, r) => (
                    <tr key={r} className={cn(r === 0 && 'font-semibold')}>
                      {row.map((cell, c) => (
                        <td key={c} className="border border-paper-border px-1.5 py-1">
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            );
          }
          return (
            <p key={index} className="whitespace-pre-line">
              {(block.segments ?? [{ text: block.text ?? '' }]).map((segment, s) => (
                <Fragment key={s}>
                  {segment.filled ? (
                    <motion.mark
                      initial={{ backgroundColor: 'var(--atena-to)' }}
                      animate={{ backgroundColor: 'rgb(163 207 230 / 0)' }}
                      transition={{ duration: 2.4, delay: 0.2 + s * 0.05 }}
                      className="rounded-sm px-0.5 text-inherit ring-1 ring-[var(--atena-from)]/40"
                    >
                      {segment.text}
                    </motion.mark>
                  ) : (
                    segment.text
                  )}
                </Fragment>
              ))}
            </p>
          );
        })}
      </div>
      <footer className="flex items-center justify-between border-t border-paper-border pt-2 text-[9px] text-paper-muted">
        <span className="truncate">{identity.footerNote}</span>
        <span className="tnum shrink-0">{t('document.page', { current: page, total: pages })}</span>
      </footer>
    </article>
  );
}
