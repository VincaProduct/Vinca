-- Create razorpay_orders table
CREATE TABLE public.razorpay_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  razorpay_order_id TEXT UNIQUE NOT NULL,
  amount INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'INR',
  receipt TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'created',
  plan_type TEXT NOT NULL,
  notes JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create razorpay_payments table
CREATE TABLE public.razorpay_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES razorpay_orders(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  razorpay_payment_id TEXT UNIQUE NOT NULL,
  razorpay_order_id TEXT NOT NULL,
  razorpay_signature TEXT NOT NULL,
  amount INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'INR',
  method TEXT,
  status TEXT NOT NULL DEFAULT 'authorized',
  email TEXT,
  contact TEXT,
  captured_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create payment_transactions log
CREATE TABLE public.payment_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  order_id UUID REFERENCES razorpay_orders(id),
  payment_id UUID REFERENCES razorpay_payments(id),
  event_type TEXT NOT NULL,
  event_data JSONB NOT NULL,
  webhook_event_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Update user_memberships table
ALTER TABLE public.user_memberships 
ADD COLUMN payment_id UUID REFERENCES razorpay_payments(id),
ADD COLUMN razorpay_order_id TEXT,
ADD COLUMN payment_date TIMESTAMPTZ;

-- Enable RLS
ALTER TABLE public.razorpay_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.razorpay_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for razorpay_orders
CREATE POLICY "Users can view their own orders"
  ON public.razorpay_orders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own orders"
  ON public.razorpay_orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Super admins can view all orders"
  ON public.razorpay_orders FOR SELECT
  USING (has_role(auth.uid(), 'super_admin'::app_role));

-- RLS Policies for razorpay_payments
CREATE POLICY "Users can view their own payments"
  ON public.razorpay_payments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Super admins can view all payments"
  ON public.razorpay_payments FOR SELECT
  USING (has_role(auth.uid(), 'super_admin'::app_role));

-- RLS Policies for payment_transactions
CREATE POLICY "Users can view their own transactions"
  ON public.payment_transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Super admins can view all transactions"
  ON public.payment_transactions FOR SELECT
  USING (has_role(auth.uid(), 'super_admin'::app_role));

-- Create Indexes
CREATE INDEX idx_razorpay_orders_user_id ON razorpay_orders(user_id);
CREATE INDEX idx_razorpay_orders_razorpay_order_id ON razorpay_orders(razorpay_order_id);
CREATE INDEX idx_razorpay_orders_status ON razorpay_orders(status);
CREATE INDEX idx_razorpay_payments_user_id ON razorpay_payments(user_id);
CREATE INDEX idx_razorpay_payments_razorpay_payment_id ON razorpay_payments(razorpay_payment_id);
CREATE INDEX idx_razorpay_payments_order_id ON razorpay_payments(order_id);
CREATE INDEX idx_payment_transactions_webhook_event_id ON payment_transactions(webhook_event_id);
CREATE INDEX idx_payment_transactions_user_id ON payment_transactions(user_id);

-- Create Updated At Triggers
CREATE TRIGGER update_razorpay_orders_updated_at 
  BEFORE UPDATE ON razorpay_orders 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_razorpay_payments_updated_at 
  BEFORE UPDATE ON razorpay_payments 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();