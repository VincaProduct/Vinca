-- Instagram / Facebook in-app browser -> Chrome or Safari, for one-tap Google
-- sign-in. The in-app browser saves what the visitor has done so far (score,
-- calculator numbers, ad tags) under a random ID; the real browser opens
-- /auth?handoff=<id>, claims it once and the row is deleted.
-- Nothing here is linked to a person. Unclaimed rows are removed after an hour.
-- Safe to run more than once.

CREATE TABLE IF NOT EXISTS public.browser_handoffs (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payload    JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- No direct access from the website: only the two functions below
ALTER TABLE public.browser_handoffs ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.create_browser_handoff(p_payload JSONB)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  new_id UUID;
BEGIN
  IF p_payload IS NULL OR octet_length(p_payload::text) > 20000 THEN
    RAISE EXCEPTION 'payload missing or too large';
  END IF;
  DELETE FROM public.browser_handoffs WHERE created_at < now() - interval '1 hour';
  INSERT INTO public.browser_handoffs (payload) VALUES (p_payload) RETURNING id INTO new_id;
  RETURN new_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.claim_browser_handoff(p_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  result JSONB;
BEGIN
  DELETE FROM public.browser_handoffs
   WHERE id = p_id AND created_at > now() - interval '30 minutes'
  RETURNING payload INTO result;
  RETURN result;
END;
$$;

REVOKE ALL ON FUNCTION public.create_browser_handoff(JSONB) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.claim_browser_handoff(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_browser_handoff(JSONB) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.claim_browser_handoff(UUID) TO anon, authenticated;
