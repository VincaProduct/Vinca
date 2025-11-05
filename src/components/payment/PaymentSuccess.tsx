import { CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface PaymentSuccessProps {
  paymentId?: string;
  orderId?: string;
  onContinue?: () => void;
}

export const PaymentSuccess = ({ paymentId, orderId, onContinue }: PaymentSuccessProps) => {
  return (
    <Card className="border-green-500/20 bg-green-500/5">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
          <CheckCircle className="h-10 w-10 text-green-500" />
        </div>
        <CardTitle className="text-2xl">Payment Successful!</CardTitle>
        <CardDescription>
          Welcome to Pro Version - Your payment has been processed successfully
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {paymentId && (
          <div className="rounded-lg bg-muted p-3">
            <p className="text-sm text-muted-foreground">Payment ID</p>
            <p className="font-mono text-sm">{paymentId}</p>
          </div>
        )}
        {orderId && (
          <div className="rounded-lg bg-muted p-3">
            <p className="text-sm text-muted-foreground">Order ID</p>
            <p className="font-mono text-sm">{orderId}</p>
          </div>
        )}
        <div className="pt-4 space-y-2">
          <h4 className="font-semibold">What's Next?</h4>
          <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
            <li>Access to advanced calculators and tools</li>
            <li>Priority support and guidance</li>
            <li>Exclusive educational content</li>
            <li>Enhanced dashboard features</li>
          </ul>
        </div>
        {onContinue && (
          <Button onClick={onContinue} className="w-full mt-4">
            Continue to Dashboard
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
