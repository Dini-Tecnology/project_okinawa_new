
CREATE TABLE public.demo_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  name text NOT NULL,
  restaurant text NOT NULL,
  email text NOT NULL,
  phone text,
  access_code text NOT NULL,
  verified boolean NOT NULL DEFAULT false
);

ALTER TABLE public.demo_leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public insert" ON public.demo_leads
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "No public reads" ON public.demo_leads
  FOR SELECT TO anon, authenticated
  USING (false);
