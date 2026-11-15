import { useState } from 'react';
import { Button } from '@/design/ui/button';
import { Input } from '@/design/ui/form';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from '@/design/ui/table';
import { useToasts } from '@/design/ui/toast';
import { t } from '@/modules/knowledge/standards/i18n';

const DEFAULTS: [string, string][] = [
  ['Memorial descritivo', 'MEM-{ano}-{seq}'],
  ['Contrato de empreitada', 'CT-{ano}-{seq}'],
  ['Ata de reunião', 'ATA-{ano}-{seq}'],
  ['Ordem de serviço', 'OS-{ano}-{seq}'],
  ['Boletim de medição', 'BM-{seq}'],
];

/** Padrões de numeração por tipo de documento (a gravação é simulada nesta fase). */
export function NumberingTab() {
  const push = useToasts((s) => s.push);
  const [patterns, setPatterns] = useState(DEFAULTS);
  const year = new Date().getFullYear();
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        {t('numbering.title')}. {t('numbering.hint')}
      </p>
      <div className="surface-card overflow-hidden">
        <Table>
          <TableHead>
            <tr>
              <TableHeaderCell>{t('numbering.docType')}</TableHeaderCell>
              <TableHeaderCell>{t('numbering.pattern')}</TableHeaderCell>
              <TableHeaderCell>{t('numbering.example')}</TableHeaderCell>
            </tr>
          </TableHead>
          <TableBody>
            {patterns.map(([name, pattern], i) => (
              <TableRow key={name}>
                <TableCell className="font-medium">{name}</TableCell>
                <TableCell>
                  <Input
                    value={pattern}
                    aria-label={name}
                    onChange={(e) =>
                      setPatterns((cur) =>
                        cur.map((row, j) => (j === i ? [row[0], e.target.value] : row)),
                      )
                    }
                    className="h-9 max-w-64 font-numeric"
                  />
                </TableCell>
                <TableCell className="font-numeric">
                  {pattern.replace('{ano}', String(year)).replace('{seq}', '007')}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <Button onClick={() => push(t('numbering.saved'))}>{t('numbering.save')}</Button>
    </div>
  );
}
