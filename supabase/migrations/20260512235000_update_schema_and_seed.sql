-- 1. Create assets bucket if not exists
INSERT INTO storage.buckets (id, name, public) 
VALUES ('assets', 'assets', true)
ON CONFLICT (id) DO NOTHING;

-- Policies for assets bucket
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
CREATE POLICY "Public Access" ON storage.objects FOR SELECT TO public USING (bucket_id = 'assets');

DROP POLICY IF EXISTS "Auth Insert" ON storage.objects;
CREATE POLICY "Auth Insert" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'assets');

DROP POLICY IF EXISTS "Auth Update" ON storage.objects;
CREATE POLICY "Auth Update" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'assets');

DROP POLICY IF EXISTS "Auth Delete" ON storage.objects;
CREATE POLICY "Auth Delete" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'assets');

-- 2. Add stock to products
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS stock INTEGER NOT NULL DEFAULT 0;

-- 3. Add commission_rate to sellers
ALTER TABLE public.sellers ADD COLUMN IF NOT EXISTS commission_rate NUMERIC NOT NULL DEFAULT 5;

-- 4. Create expenses table
CREATE TABLE IF NOT EXISTS public.expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    description TEXT NOT NULL,
    amount NUMERIC NOT NULL DEFAULT 0,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "authenticated_all" ON public.expenses;
CREATE POLICY "authenticated_all" ON public.expenses FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 5. Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    name TEXT,
    role TEXT NOT NULL DEFAULT 'seller',
    created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "authenticated_all" ON public.profiles;
CREATE POLICY "authenticated_all" ON public.profiles FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 6. Trigger to auto-create profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, role)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'name', 'admin')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Seed profile for current user
DO $$
DECLARE
    admin_id UUID;
BEGIN
    SELECT id INTO admin_id FROM auth.users WHERE email = 'romulo.snts@gmail.com' LIMIT 1;
    IF admin_id IS NOT NULL THEN
        INSERT INTO public.profiles (id, email, name, role) 
        VALUES (admin_id, 'romulo.snts@gmail.com', 'Administrador', 'admin') 
        ON CONFLICT (id) DO NOTHING;
    END IF;
END $$;

-- 7. Seed Data
DO $$
DECLARE
  c1_id UUID := gen_random_uuid();
  c2_id UUID := gen_random_uuid();
  p1_id UUID := gen_random_uuid();
  p2_id UUID := gen_random_uuid();
  s1_id UUID := gen_random_uuid();
  o1_id UUID := gen_random_uuid();
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.clients) THEN
    INSERT INTO public.clients (id, name, document, segment, neighborhood, city, state, phone)
    VALUES 
      (c1_id, 'PetShop Amigão', '00000000000', 'PetShop', 'Centro', 'São Paulo', 'SP', '11999999999'),
      (c2_id, 'Distribuidora Max', '11111111111', 'Distribuidora', 'Jardins', 'São Paulo', 'SP', '11888888888')
    ON CONFLICT DO NOTHING;

    INSERT INTO public.sellers (id, name, commission_rate)
    VALUES (s1_id, 'Carlos Silva', 5)
    ON CONFLICT DO NOTHING;

    INSERT INTO public.products (id, name, size, neck, height, diameter, unit_price_milheiro, unit_price_cento, unit_price_min, min_quantity, stock)
    VALUES 
      (p1_id, 'Garrafa PET', '500ml', '28mm', '20cm', '6cm', 0.50, 0.60, 0.80, 100, 5000),
      (p2_id, 'Garrafa PET', '1L', '28mm', '25cm', '8cm', 0.80, 0.90, 1.20, 100, 3000)
    ON CONFLICT DO NOTHING;

    INSERT INTO public.orders (id, short_id, client_id, seller_id, status, total, delivery_date)
    VALUES (o1_id, '98765', c1_id, s1_id, 'Entregue', 500, NOW() + INTERVAL '2 days')
    ON CONFLICT DO NOTHING;

    INSERT INTO public.order_items (order_id, product_id, quantity, unit_price)
    VALUES (o1_id, p1_id, 1000, 0.50)
    ON CONFLICT DO NOTHING;
      
    INSERT INTO public.expenses (description, amount, date)
    VALUES ('Combustível Entrega', 150, CURRENT_DATE)
    ON CONFLICT DO NOTHING;
  END IF;
END $$;
