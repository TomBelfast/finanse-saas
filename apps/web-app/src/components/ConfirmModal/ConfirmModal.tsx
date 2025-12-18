import React, { FunctionComponent, ReactNode } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '~/components/ui/dialog';
import { Button } from '~/components/ui/button';
import { useTranslation } from 'react-i18next';
import { Loader2 } from 'lucide-react';

interface OwnProps {
  open: boolean;
  onClose: () => void;
  onSave: () => Promise<void>;
  saving?: boolean;
  children: ReactNode;
  modalTitle: string;
  buttonTitle: string;
}

const ConfirmModal: FunctionComponent<OwnProps> = ({
  onSave,
  saving,
  open,
  onClose,
  children,
  modalTitle,
  buttonTitle,
}) => {
  const { t } = useTranslation('common');

  const onOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>{modalTitle}</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          {children}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            {t<string>('button.cancel')}
          </Button>
          <Button onClick={onSave} disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {buttonTitle}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmModal;
