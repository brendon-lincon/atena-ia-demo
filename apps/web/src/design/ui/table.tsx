import type { HTMLAttributes, TdHTMLAttributes, ThHTMLAttributes } from 'react';
import { cn } from '@/design/cn';

export function Table({ className, ...props }: HTMLAttributes<HTMLTableElement>) {
  return (
    <div className="scrollbar-thin w-full overflow-x-auto">
      <table className={cn('w-full border-collapse text-base', className)} {...props} />
    </div>
  );
}
export const TableHead = (props: HTMLAttributes<HTMLTableSectionElement>) => <thead {...props} />;
export const TableBody = (props: HTMLAttributes<HTMLTableSectionElement>) => <tbody {...props} />;
export const TableRow = ({ className, ...props }: HTMLAttributes<HTMLTableRowElement>) => (
  <tr
    className={cn(
      'border-b border-border transition-colors last:border-0 hover:bg-muted/60',
      className,
    )}
    {...props}
  />
);
export const TableHeaderCell = ({
  className,
  ...props
}: ThHTMLAttributes<HTMLTableCellElement>) => (
  <th
    className={cn('h-10 px-3 text-left text-sm font-medium text-muted-foreground', className)}
    {...props}
  />
);
export const TableCell = ({ className, ...props }: TdHTMLAttributes<HTMLTableCellElement>) => (
  <td className={cn('h-12 px-3 tnum', className)} {...props} />
);
