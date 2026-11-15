import { Camera, FileText, Mail, MessageCircle, Mic, NotebookPen } from 'lucide-react';
import type { ComponentType, ReactNode } from 'react';
import { cn } from '@/design/cn';

export type SourceKind = 'file' | 'message' | 'photo' | 'diary' | 'audio' | 'email';
const ICON: Record<SourceKind, ComponentType<{ className?: string }>> = {
  file: FileText,
  message: MessageCircle,
  photo: Camera,
  diary: NotebookPen,
  audio: Mic,
  email: Mail,
};

/** Origem do dado (arquivo e página, mensagem, nota do diário...), sempre visível ao lado do valor. */
export function SourceTag({
  kind,
  children,
  onClick,
  className,
}: {
  kind: SourceKind;
  children: ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  const Icon = ICON[kind];
  const Tag = onClick ? 'button' : 'span';
  return (
    <Tag
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={cn(
        'inline-flex max-w-full items-center gap-1.5 rounded-sm border border-border bg-surface px-2 py-0.5 text-xs text-muted-foreground',
        onClick && 'hover:border-ring hover:text-foreground',
        className,
      )}
    >
      <Icon className="size-3.5 shrink-0" />
      <span className="truncate">{children}</span>
    </Tag>
  );
}
