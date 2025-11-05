import { createHmac } from "https://deno.land/std@0.177.0/node/crypto.ts";

export interface RazorpayCredentials {
  keyId: string;
  keySecret: string;
  webhookSecret: string;
}

export function getRazorpayCredentials(): RazorpayCredentials {
  const environment = Deno.env.get('PAYMENT_ENVIRONMENT') || 'test';
  
  if (environment === 'production') {
    return {
      keyId: Deno.env.get('RAZORPAY_PROD_KEY_ID') || '',
      keySecret: Deno.env.get('RAZORPAY_PROD_KEY_SECRET') || '',
      webhookSecret: Deno.env.get('RAZORPAY_PROD_WEBHOOK_SECRET') || ''
    };
  }
  
  return {
    keyId: Deno.env.get('RAZORPAY_TEST_KEY_ID') || '',
    keySecret: Deno.env.get('RAZORPAY_TEST_KEY_SECRET') || '',
    webhookSecret: Deno.env.get('RAZORPAY_TEST_WEBHOOK_SECRET') || ''
  };
}

export function verifyPaymentSignature(
  orderId: string,
  paymentId: string,
  signature: string,
  secret: string
): boolean {
  const message = `${orderId}|${paymentId}`;
  const generatedSignature = createHmac('sha256', secret)
    .update(message)
    .digest('hex');
  
  return generatedSignature === signature;
}

export function verifyWebhookSignature(
  body: string,
  signature: string,
  secret: string
): boolean {
  const generatedSignature = createHmac('sha256', secret)
    .update(body)
    .digest('hex');
  
  return generatedSignature === signature;
}

export async function createRazorpayOrder(
  amount: number,
  currency: string,
  receipt: string,
  notes: Record<string, string>
): Promise<any> {
  const credentials = getRazorpayCredentials();
  
  const authHeader = `Basic ${btoa(`${credentials.keyId}:${credentials.keySecret}`)}`;
  
  const response = await fetch('https://api.razorpay.com/v1/orders', {
    method: 'POST',
    headers: {
      'Authorization': authHeader,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      amount,
      currency,
      receipt,
      notes
    })
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Razorpay API error: ${error}`);
  }
  
  return await response.json();
}
