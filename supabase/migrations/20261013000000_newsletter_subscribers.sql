-- Blog newsletter sign-ups ("get notified about new articles").
-- Visitors can only add their own email; only super admins can read the list.

CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  -- Where they signed up, e.g. "/blog/benefits-of-starting-sip-early"
  source text,
  status text NOT NULL DEFAULT 'subscribed' CHECK (status IN ('subscribed', 'unsubscribed')),
  -- When they ticked/accepted "send me new articles" (consent record)
  consented_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT newsletter_subscribers_email_format CHECK (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$')
);

-- One row per address, whatever the capitalisation
CREATE UNIQUE INDEX IF NOT EXISTS newsletter_subscribers_email_key
  ON public.newsletter_subscribers (lower(email));

ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can subscribe" ON public.newsletter_subscribers;
CREATE POLICY "Anyone can subscribe"
  ON public.newsletter_subscribers FOR INSERT
  WITH CHECK (status = 'subscribed' AND length(email) <= 254);

DROP POLICY IF EXISTS "Super admins manage subscribers" ON public.newsletter_subscribers;
CREATE POLICY "Super admins manage subscribers"
  ON public.newsletter_subscribers FOR ALL
  USING (has_role(auth.uid(), 'super_admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role));
