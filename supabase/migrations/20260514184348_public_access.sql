-- Make all tables accessible without authentication

DROP POLICY IF EXISTS "authenticated_all" ON public.clients;
CREATE POLICY "public_all" ON public.clients FOR ALL TO public USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_all" ON public.company_settings;
CREATE POLICY "public_all" ON public.company_settings FOR ALL TO public USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_all" ON public.expenses;
CREATE POLICY "public_all" ON public.expenses FOR ALL TO public USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_all" ON public.order_items;
CREATE POLICY "public_all" ON public.order_items FOR ALL TO public USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_all" ON public.orders;
CREATE POLICY "public_all" ON public.orders FOR ALL TO public USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_all" ON public.products;
CREATE POLICY "public_all" ON public.products FOR ALL TO public USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_all" ON public.profiles;
CREATE POLICY "public_all" ON public.profiles FOR ALL TO public USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_all" ON public.sellers;
CREATE POLICY "public_all" ON public.sellers FOR ALL TO public USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated insert for clinic_settings" ON public.clinic_settings;
DROP POLICY IF EXISTS "Authenticated update for clinic_settings" ON public.clinic_settings;
DROP POLICY IF EXISTS "Public read access for clinic_settings" ON public.clinic_settings;
CREATE POLICY "public_all_clinic_settings" ON public.clinic_settings FOR ALL TO public USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated full access for navigation_items" ON public.navigation_items;
DROP POLICY IF EXISTS "Public read access for navigation_items" ON public.navigation_items;
CREATE POLICY "public_all_navigation_items" ON public.navigation_items FOR ALL TO public USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated upsert for site_content" ON public.site_content;
DROP POLICY IF EXISTS "Public read access for site_content" ON public.site_content;
CREATE POLICY "public_all_site_content" ON public.site_content FOR ALL TO public USING (true) WITH CHECK (true);
