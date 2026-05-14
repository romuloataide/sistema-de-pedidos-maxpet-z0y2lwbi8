DO $$
DECLARE
  r RECORD;
BEGIN
  -- Check if any products have code = 0 or code IS NULL and generate a proper sequence code
  FOR r IN SELECT id FROM public.products WHERE code = 0 OR code IS NULL
  LOOP
    UPDATE public.products SET code = nextval('products_code_seq') WHERE id = r.id;
  END LOOP;
END $$;
