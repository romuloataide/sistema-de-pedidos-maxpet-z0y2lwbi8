DO $$
BEGIN
  ALTER TABLE public.company_settings ADD COLUMN IF NOT EXISTS logo_bg_color TEXT DEFAULT '#EBF2F7';
  ALTER TABLE public.company_settings ADD COLUMN IF NOT EXISTS monthly_goal NUMERIC DEFAULT 10000;
END $$;
