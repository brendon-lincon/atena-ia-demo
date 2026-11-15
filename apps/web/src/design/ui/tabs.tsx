import { motion } from 'motion/react';
import { Tabs as TabsPrimitive } from 'radix-ui';
import { createContext, useContext, useId, useState, type ComponentProps } from 'react';
import { cn } from '@/design/cn';
import { spring } from '@/design/motion.generated';

interface TabsContext {
  value: string | undefined;
  group: string;
}
const Context = createContext<TabsContext>({ value: undefined, group: '' });

/** Abas com indicador que desliza entre as opções (layoutId compartilhado). */
export function Tabs({
  value,
  defaultValue,
  onValueChange,
  ...props
}: ComponentProps<typeof TabsPrimitive.Root>) {
  const group = useId();
  const [inner, setInner] = useState(defaultValue);
  const current = value ?? inner;
  return (
    <Context.Provider value={{ value: current, group }}>
      <TabsPrimitive.Root
        value={current}
        onValueChange={(next) => {
          setInner(next);
          onValueChange?.(next);
        }}
        {...props}
      />
    </Context.Provider>
  );
}

export function TabsList({ className, ...props }: ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      className={cn(
        'scrollbar-thin flex items-center gap-1 overflow-x-auto border-b border-border',
        className,
      )}
      {...props}
    />
  );
}

export function TabsTrigger({
  className,
  value,
  children,
  ...props
}: ComponentProps<typeof TabsPrimitive.Trigger>) {
  const { value: active, group } = useContext(Context);
  const selected = active === value;
  return (
    <TabsPrimitive.Trigger
      value={value}
      className={cn(
        'relative inline-flex h-11 shrink-0 items-center gap-2 px-3 text-base font-medium text-muted-foreground transition-colors hover:text-foreground data-[state=active]:text-foreground',
        className,
      )}
      {...props}
    >
      {children}
      {selected && (
        <motion.span
          layoutId={`tab-${group}`}
          transition={spring}
          className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-primary"
        />
      )}
    </TabsPrimitive.Trigger>
  );
}

export function TabsContent({ className, ...props }: ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      className={cn('pt-4 focus-visible:outline-none', className)}
      {...props}
    />
  );
}
