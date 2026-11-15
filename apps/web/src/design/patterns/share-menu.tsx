import { Download, Mail, MessageCircle, Share2 } from 'lucide-react';
import { useState } from 'react';
import { createT } from '@/core/i18n/create-t';
import { messages } from '@/core/i18n/messages';
import { Button } from '@/design/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  Menu,
  MenuContent,
  MenuItem,
  MenuTrigger,
} from '@/design/ui/overlay';
import { useToasts } from '@/design/ui/toast';

const t = createT(messages);
type Channel = 'email' | 'whatsapp';

/** Baixar, enviar por e-mail ou WhatsApp. Na demonstração, o envio é simulado com confirmação. */
export function ShareMenu({ onDownload, subject }: { onDownload?: () => void; subject: string }) {
  const [channel, setChannel] = useState<Channel | null>(null);
  const push = useToasts((state) => state.push);
  return (
    <>
      <Menu>
        <MenuTrigger asChild>
          <Button variant="outline">
            <Share2 /> {t('share.title')}
          </Button>
        </MenuTrigger>
        <MenuContent align="end">
          <MenuItem onSelect={onDownload}>
            <Download /> {t('share.download')}
          </MenuItem>
          <MenuItem onSelect={() => setChannel('email')}>
            <Mail /> {t('share.email')}
          </MenuItem>
          <MenuItem onSelect={() => setChannel('whatsapp')}>
            <MessageCircle /> {t('share.whatsapp')}
          </MenuItem>
        </MenuContent>
      </Menu>
      <Dialog open={channel !== null} onOpenChange={(open) => !open && setChannel(null)}>
        <DialogContent>
          <DialogTitle>{t('share.confirmTitle')}</DialogTitle>
          <DialogDescription>
            {subject}. {t('share.confirmDescription')}
          </DialogDescription>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setChannel(null)}>
              {t('common.cancel')}
            </Button>
            <Button
              onClick={() => {
                setChannel(null);
                push(t('share.sent'));
              }}
            >
              {t('common.confirm')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
