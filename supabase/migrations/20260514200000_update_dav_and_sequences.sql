DO $$
DECLARE
  prod RECORD;
  seq INT := 1;
BEGIN
  -- 1. Create DAV configuration and data columns
  ALTER TABLE public.company_settings ADD COLUMN IF NOT EXISTS dav_config JSONB DEFAULT '{}'::jsonb;
  ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS dav_data JSONB DEFAULT '{}'::jsonb;
  ALTER TABLE public.order_items ADD COLUMN IF NOT EXISTS dav_data JSONB DEFAULT '{}'::jsonb;

  -- 2. Fix the existing #0000 products by giving them proper sequential codes
  FOR prod IN SELECT id FROM public.products ORDER BY created_at ASC
  LOOP
    UPDATE public.products SET code = seq WHERE id = prod.id;
    seq := seq + 1;
  END LOOP;
  
  -- 3. Reset the sequence correctly so the next product added continues the sequence
  PERFORM setval('products_code_seq', COALESCE((SELECT MAX(code) FROM public.products), 0) + 1, false);

END $$;
