import { Loader2 } from 'lucide-react';

interface PaymentLoadingProps {
  message?: string;
}

export const PaymentLoading = ({ message = 'Processing payment...' }: PaymentLoadingProps) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-4">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
      <p className="text-lg font-medium text-foreground">{message}</p>
      <p className="text-sm text-muted-foreground">Please do not close this window</p>
    </div>
  );
};
