import { X } from 'lucide-react';
import {
  Dialog as DialogPrimitive,
  DropdownMenu as MenuPrimitive,
  Popover as PopoverPrimitive,
  Tooltip as TooltipPrimitive,
} from 'radix-ui';
import type { ComponentProps, ReactNode } from 'react';
import { createT } from '@/core/i18n/create-t';
import { messages } from '@/core/i18n/messages';
import { cn } from '@/design/cn';

const t = createT(messages);
const panel = 'border border-border bg-elevated text-foreground shadow-lg';
const enter =
  'data-[state=open]:animate-[fade-in_var(--duration-base)_var(--ease-standard)] data-[state=closed]:animate-[fade-out_var(--duration-micro)_var(--ease-standard)]';

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogClose = DialogPrimitive.Close;
export const DialogTitle = ({
  className,
  ...props
}: ComponentProps<typeof DialogPrimitive.Title>) => (
  <DialogPrimitive.Title
    className={cn('text-xl font-semibold tracking-tight', className)}
    {...props}
  />
);
export const DialogDescription = ({
  className,
  ...props
}: ComponentProps<typeof DialogPrimitive.Description>) => (
  <DialogPrimitive.Description
    className={cn('text-base text-muted-foreground', className)}
    {...props}
  />
);

function Overlay() {
  return (
    <DialogPrimitive.Overlay
      className={cn('fixed inset-0 z-50 bg-overlay backdrop-blur-[2px]', enter)}
    />
  );
}

function CloseButton() {
  return (
    <DialogPrimitive.Close
      className="absolute top-3 right-3 inline-flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
      aria-label={t('common.close')}
    >
      <X className="size-4" />
    </DialogPrimitive.Close>
  );
}

export function DialogContent({
  className,
  children,
  ...props
}: ComponentProps<typeof DialogPrimitive.Content>) {
  return (
    <DialogPrimitive.Portal>
      <Overlay />
      <DialogPrimitive.Content
        className={cn(
          'fixed top-1/2 left-1/2 z-50 grid max-h-[90vh] w-[calc(100vw-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 gap-4 overflow-auto rounded-lg p-6',
          panel,
          enter,
          className,
        )}
        {...props}
      >
        {children}
        <CloseButton />
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}

/** Folha lateral (desktop) ou inferior (celular). */
export function Sheet({
  side = 'right',
  className,
  children,
  ...props
}: ComponentProps<typeof DialogPrimitive.Content> & { side?: 'right' | 'bottom' }) {
  return (
    <DialogPrimitive.Portal>
      <Overlay />
      <DialogPrimitive.Content
        className={cn(
          'fixed z-50 flex flex-col gap-4 overflow-auto p-6 shadow-lg',
          panel,
          side === 'right'
            ? 'inset-y-0 right-0 w-full max-w-md animate-[slide-in-right_var(--duration-emphasis)_var(--ease-standard)] rounded-l-lg'
            : 'inset-x-0 bottom-0 max-h-[85vh] animate-[slide-in-bottom_var(--duration-emphasis)_var(--ease-standard)] rounded-t-lg',
          className,
        )}
        {...props}
      >
        {children}
        <CloseButton />
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}

export const Popover = PopoverPrimitive.Root;
export const PopoverTrigger = PopoverPrimitive.Trigger;
export function PopoverContent({
  className,
  sideOffset = 8,
  ...props
}: ComponentProps<typeof PopoverPrimitive.Content>) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        sideOffset={sideOffset}
        className={cn('z-50 w-72 rounded-md p-4', panel, enter, className)}
        {...props}
      />
    </PopoverPrimitive.Portal>
  );
}

export const TooltipProvider = TooltipPrimitive.Provider;
export function Tooltip({ label, children }: { label: string; children: ReactNode }) {
  return (
    <TooltipPrimitive.Root delayDuration={200}>
      <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
      <TooltipPrimitive.Portal>
        <TooltipPrimitive.Content
          sideOffset={6}
          className="z-50 rounded-sm bg-primary-strong px-2.5 py-1.5 text-xs font-medium text-sidebar-foreground shadow-md"
        >
          {label}
        </TooltipPrimitive.Content>
      </TooltipPrimitive.Portal>
    </TooltipPrimitive.Root>
  );
}

export const Menu = MenuPrimitive.Root;
export const MenuTrigger = MenuPrimitive.Trigger;
export function MenuContent({
  className,
  sideOffset = 6,
  ...props
}: ComponentProps<typeof MenuPrimitive.Content>) {
  return (
    <MenuPrimitive.Portal>
      <MenuPrimitive.Content
        sideOffset={sideOffset}
        className={cn('z-50 min-w-48 rounded-md p-1', panel, enter, className)}
        {...props}
      />
    </MenuPrimitive.Portal>
  );
}
export function MenuItem({ className, ...props }: ComponentProps<typeof MenuPrimitive.Item>) {
  return (
    <MenuPrimitive.Item
      className={cn(
        'flex cursor-pointer items-center gap-2 rounded-sm px-2.5 py-2 text-base outline-none select-none data-[highlighted]:bg-muted [&_svg]:size-4 [&_svg]:text-muted-foreground',
        className,
      )}
      {...props}
    />
  );
}
export const MenuSeparator = ({
  className,
  ...props
}: ComponentProps<typeof MenuPrimitive.Separator>) => (
  <MenuPrimitive.Separator className={cn('my-1 h-px bg-border', className)} {...props} />
);
