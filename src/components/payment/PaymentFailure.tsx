import { XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface PaymentFailureProps {
  error?: string;
  onRetry?: () => void;
}

export const PaymentFailure = ({ error, onRetry }: PaymentFailureProps) => {
  return (
    <Card className="border-destructive/20 bg-destructive/5">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
          <XCircle className="h-10 w-10 text-destructive" />
        </div>
        <CardTitle className="text-2xl">Payment Failed</CardTitle>
        <CardDescription>
          We couldn't process your payment. Please try again.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="rounded-lg bg-destructive/10 p-3">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}
        <div className="space-y-2 text-sm text-muted-foreground">
          <p className="font-semibold text-foreground">Common reasons for payment failure:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Insufficient funds in your account</li>
            <li>Card declined by your bank</li>
            <li>Incorrect card details</li>
            <li>Network connectivity issues</li>
          </ul>
        </div>
        <div className="flex flex-col gap-2 pt-4">
          {onRetry && (
            <Button onClick={onRetry} className="w-full">
              Retry Payment
            </Button>
          )}
          <Button variant="outline" className="w-full" asChild>
            <a href="mailto:support@vincawealth.com">Contact Support</a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
