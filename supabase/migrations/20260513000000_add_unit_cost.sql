-- Add unit_cost to products
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS unit_cost NUMERIC NOT NULL DEFAULT 0;

-- Add unit_cost to order_items
ALTER TABLE public.order_items ADD COLUMN IF NOT EXISTS unit_cost NUMERIC NOT NULL DEFAULT 0;
