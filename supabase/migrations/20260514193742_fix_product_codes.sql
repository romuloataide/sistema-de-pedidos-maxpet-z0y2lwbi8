DO $$
DECLARE
  rec RECORD;
  counter INT;
BEGIN
  -- Check current max code to continue from there if needed
  SELECT COALESCE(MAX(code), 0) INTO counter FROM public.products WHERE code > 0;
  
  IF counter = 0 THEN
    counter := 1;
  ELSE
    counter := counter + 1;
  END IF;

  -- Update any product that has code 0 or null to give them a valid sequential number
  FOR rec IN SELECT id FROM public.products WHERE code = 0 OR code IS NULL ORDER BY created_at ASC
  LOOP
    UPDATE public.products SET code = counter WHERE id = rec.id;
    counter := counter + 1;
  END LOOP;
  
  -- Reset sequence to the new max
  PERFORM setval('products_code_seq', COALESCE((SELECT MAX(code) FROM public.products), 1) + 1, false);
END $$;
