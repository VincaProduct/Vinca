import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
  buttonText?: string;
}

/**
 * SuccessModal Component
 * Displays post-submission confirmation with impact messaging
 */
export default function SuccessModal({
  isOpen,
  onClose,
  title = 'Thank you 🙏',
  message = 'Your reflection helps improve financial clarity for everyone.',
  buttonText = 'Continue',
}: SuccessModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl text-slate-900">{title}</DialogTitle>
        </DialogHeader>

        <div className="py-6">
          <p className="text-center text-slate-600 text-base leading-relaxed">{message}</p>
        </div>

        <DialogFooter>
          <Button
            onClick={onClose}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            {buttonText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
