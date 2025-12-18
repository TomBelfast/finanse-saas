import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '~/components/ui/dialog';
import { Input } from '~/components/ui/input';
import { Button } from '~/components/ui/button';
import { useAppDispatch } from '~/initializeStore';
import { userActions } from '@akademiasaas/shared';
import { toast } from 'sonner';

interface Props {
  open: boolean;
  onClose: () => void;
}

const ImpersonationModal: React.FC<Props> = ({ open, onClose }) => {
  const dispatch = useAppDispatch();
  const [customToken, setCustomToken] = React.useState('');

  const handleImpersonate = async () => {
    try {
      await dispatch(userActions.impersonateUser(customToken));
      onClose();
      setCustomToken('');
    } catch (error) {
      toast.error('Impersonation failed');
    }
  };

  const onOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      onClose();
      setCustomToken('');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Impersonation</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Input
            placeholder="Enter custom token"
            value={customToken}
            onChange={(e) => setCustomToken(e.target.value)}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleImpersonate} disabled={!customToken}>
            Impersonate
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ImpersonationModal;
