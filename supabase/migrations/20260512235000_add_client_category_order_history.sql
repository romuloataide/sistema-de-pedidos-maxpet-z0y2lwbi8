ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS category text DEFAULT 'Normal';
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS history jsonb DEFAULT '[]'::jsonb;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'order_status') THEN
    -- just a placeholder to ensure the block evaluates safely
    PERFORM 1;
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public.append_order_history()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    NEW.history = COALESCE(OLD.history, '[]'::jsonb) || jsonb_build_object(
      'status', NEW.status,
      'date', NOW()
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS order_status_history_trigger ON public.orders;
CREATE TRIGGER order_status_history_trigger
BEFORE UPDATE ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.append_order_history();

-- Also set initial history for existing orders if empty
UPDATE public.orders SET history = jsonb_build_array(
  jsonb_build_object('status', status, 'date', created_at)
) WHERE history IS NULL OR jsonb_array_length(history) = 0;
