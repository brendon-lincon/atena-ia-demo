import { cva, type VariantProps } from 'class-variance-authority';
import {
  Avatar as AvatarPrimitive,
  Progress as ProgressPrimitive,
  ScrollArea as ScrollPrimitive,
  Separator as SeparatorPrimitive,
} from 'radix-ui';
import type { ComponentProps, HTMLAttributes } from 'react';
import { cn } from '@/design/cn';

export const badgeVariants = cva(
  'inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium',
  {
    variants: {
      tone: {
        neutral: 'bg-muted text-muted-foreground',
        info: 'bg-primary-soft text-foreground',
        success: 'bg-success-soft text-success-text',
        warning: 'bg-warning-soft text-warning-text',
        danger: 'bg-danger-soft text-danger-text',
      },
    },
    defaultVariants: { tone: 'neutral' },
  },
);

export type Tone = NonNullable<VariantProps<typeof badgeVariants>['tone']>;

export function Badge({
  className,
  tone,
  ...props
}: HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ tone }), className)} {...props} />;
}

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('surface-card', className)} {...props} />;
}

export function CardHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('flex items-start justify-between gap-3 p-5 pb-3', className)} {...props} />
  );
}

export function CardTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn('text-lg font-semibold tracking-tight', className)} {...props} />;
}

export function CardContent({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('p-5 pt-2', className)} {...props} />;
}

export function Separator({
  className,
  orientation = 'horizontal',
  ...props
}: ComponentProps<typeof SeparatorPrimitive.Root>) {
  return (
    <SeparatorPrimitive.Root
      orientation={orientation}
      className={cn(
        'shrink-0 bg-border',
        orientation === 'horizontal' ? 'h-px w-full' : 'h-full w-px',
        className,
      )}
      {...props}
    />
  );
}

export function Avatar({
  className,
  initials,
  ...props
}: ComponentProps<typeof AvatarPrimitive.Root> & { initials: string }) {
  return (
    <AvatarPrimitive.Root
      className={cn(
        'inline-flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary-soft text-sm font-semibold text-foreground',
        className,
      )}
      {...props}
    >
      <AvatarPrimitive.Fallback>{initials}</AvatarPrimitive.Fallback>
    </AvatarPrimitive.Root>
  );
}

export function Progress({
  value,
  className,
  indicatorClassName,
  ...props
}: ComponentProps<typeof ProgressPrimitive.Root> & { indicatorClassName?: string }) {
  return (
    <ProgressPrimitive.Root
      value={value}
      className={cn('relative h-2 w-full overflow-hidden rounded-full bg-muted', className)}
      {...props}
    >
      <ProgressPrimitive.Indicator
        className={cn(
          'progress-gradient h-full origin-left rounded-full transition-transform duration-[var(--duration-data)] ease-[var(--ease-standard)]',
          indicatorClassName,
        )}
        style={{ transform: `translateX(-${100 - (value ?? 0)}%)` }}
      />
    </ProgressPrimitive.Root>
  );
}

export function ScrollArea({
  className,
  children,
  ...props
}: ComponentProps<typeof ScrollPrimitive.Root>) {
  return (
    <ScrollPrimitive.Root className={cn('relative overflow-hidden', className)} {...props}>
      <ScrollPrimitive.Viewport className="size-full rounded-[inherit]">
        {children}
      </ScrollPrimitive.Viewport>
      <ScrollPrimitive.Scrollbar
        orientation="vertical"
        className="flex w-2 touch-none p-px select-none"
      >
        <ScrollPrimitive.Thumb className="relative flex-1 rounded-full bg-border" />
      </ScrollPrimitive.Scrollbar>
      <ScrollPrimitive.Scrollbar
        orientation="horizontal"
        className="flex h-2 flex-col touch-none p-px select-none"
      >
        <ScrollPrimitive.Thumb className="relative flex-1 rounded-full bg-border" />
      </ScrollPrimitive.Scrollbar>
    </ScrollPrimitive.Root>
  );
}
