-- Create Sellers
CREATE TABLE IF NOT EXISTS public.sellers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create Clients
CREATE TABLE IF NOT EXISTS public.clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    responsible TEXT,
    document TEXT NOT NULL,
    segment TEXT,
    address TEXT,
    neighborhood TEXT,
    city TEXT,
    state TEXT,
    phone TEXT,
    whatsapp TEXT,
    email TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create Products
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    size TEXT,
    neck TEXT,
    height TEXT,
    diameter TEXT,
    unit_price_milheiro NUMERIC NOT NULL DEFAULT 0,
    unit_price_cento NUMERIC NOT NULL DEFAULT 0,
    unit_price_min NUMERIC NOT NULL DEFAULT 0,
    min_quantity INTEGER NOT NULL DEFAULT 1,
    image_url TEXT,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create Orders
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    short_id TEXT NOT NULL,
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE RESTRICT,
    seller_id UUID REFERENCES public.sellers(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'Pedido registrado',
    delivery_date TIMESTAMPTZ,
    payment_method TEXT,
    notes TEXT,
    internal_notes TEXT,
    total NUMERIC NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create Order Items
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price NUMERIC NOT NULL DEFAULT 0
);

-- Create Settings
CREATE TABLE IF NOT EXISTS public.company_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_name TEXT NOT NULL,
    document TEXT NOT NULL,
    address TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT NOT NULL,
    logo_url TEXT
);

-- Insert default settings
INSERT INTO public.company_settings (id, company_name, document, address, phone, email)
VALUES ('00000000-0000-0000-0000-000000000001', 'MaxPET Embalagens LTda', '00.000.000/0001-00', 'Rodovia BR-135, Km 5, Distrito Industrial, São Luís - MA', '(98) 98897-7895', 'vendas@maxpet.com.br')
ON CONFLICT DO NOTHING;

-- Enable RLS
ALTER TABLE public.sellers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_settings ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to do everything
DO $$
BEGIN
    DROP POLICY IF EXISTS "authenticated_all" ON public.sellers;
    CREATE POLICY "authenticated_all" ON public.sellers FOR ALL TO authenticated USING (true) WITH CHECK (true);
    
    DROP POLICY IF EXISTS "authenticated_all" ON public.clients;
    CREATE POLICY "authenticated_all" ON public.clients FOR ALL TO authenticated USING (true) WITH CHECK (true);
    
    DROP POLICY IF EXISTS "authenticated_all" ON public.products;
    CREATE POLICY "authenticated_all" ON public.products FOR ALL TO authenticated USING (true) WITH CHECK (true);
    
    DROP POLICY IF EXISTS "authenticated_all" ON public.orders;
    CREATE POLICY "authenticated_all" ON public.orders FOR ALL TO authenticated USING (true) WITH CHECK (true);
    
    DROP POLICY IF EXISTS "authenticated_all" ON public.order_items;
    CREATE POLICY "authenticated_all" ON public.order_items FOR ALL TO authenticated USING (true) WITH CHECK (true);
    
    DROP POLICY IF EXISTS "authenticated_all" ON public.company_settings;
    CREATE POLICY "authenticated_all" ON public.company_settings FOR ALL TO authenticated USING (true) WITH CHECK (true);
END $$;

-- Seed User
DO $$
DECLARE
  new_user_id uuid;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'romulo.snts@gmail.com') THEN
    new_user_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role, aud,
      confirmation_token, recovery_token, email_change_token_new,
      email_change, email_change_token_current,
      phone, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      new_user_id,
      '00000000-0000-0000-0000-000000000000',
      'romulo.snts@gmail.com',
      crypt('Skip@Pass', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Admin"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '',
      NULL, '', '', ''
    );
  END IF;
END $$;
