// AVOID UPDATING THIS FILE DIRECTLY. It is automatically generated.
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      clients: {
        Row: {
          address: string | null
          category: string | null
          city: string | null
          created_at: string | null
          document: string
          email: string | null
          id: string
          name: string
          neighborhood: string | null
          notes: string | null
          phone: string | null
          responsible: string | null
          segment: string | null
          state: string | null
          whatsapp: string | null
        }
        Insert: {
          address?: string | null
          category?: string | null
          city?: string | null
          created_at?: string | null
          document: string
          email?: string | null
          id?: string
          name: string
          neighborhood?: string | null
          notes?: string | null
          phone?: string | null
          responsible?: string | null
          segment?: string | null
          state?: string | null
          whatsapp?: string | null
        }
        Update: {
          address?: string | null
          category?: string | null
          city?: string | null
          created_at?: string | null
          document?: string
          email?: string | null
          id?: string
          name?: string
          neighborhood?: string | null
          notes?: string | null
          phone?: string | null
          responsible?: string | null
          segment?: string | null
          state?: string | null
          whatsapp?: string | null
        }
        Relationships: []
      }
      clinic_settings: {
        Row: {
          address: string | null
          address_icon_url: string | null
          address_url: string | null
          colors: Json | null
          email: string | null
          email_icon_url: string | null
          footer_icon_size: number | null
          footer_icons_config: Json | null
          footer_logo_url: string | null
          header_logo_url: string | null
          home_content: Json | null
          id: string
          instagram_icon_url: string | null
          instagram_url: string | null
          layout: Json | null
          logo_url: string | null
          phone: string | null
          sidebar_logo_url: string | null
          updated_at: string | null
          welcome_logo_url: string | null
          whatsapp_icon_url: string | null
        }
        Insert: {
          address?: string | null
          address_icon_url?: string | null
          address_url?: string | null
          colors?: Json | null
          email?: string | null
          email_icon_url?: string | null
          footer_icon_size?: number | null
          footer_icons_config?: Json | null
          footer_logo_url?: string | null
          header_logo_url?: string | null
          home_content?: Json | null
          id?: string
          instagram_icon_url?: string | null
          instagram_url?: string | null
          layout?: Json | null
          logo_url?: string | null
          phone?: string | null
          sidebar_logo_url?: string | null
          updated_at?: string | null
          welcome_logo_url?: string | null
          whatsapp_icon_url?: string | null
        }
        Update: {
          address?: string | null
          address_icon_url?: string | null
          address_url?: string | null
          colors?: Json | null
          email?: string | null
          email_icon_url?: string | null
          footer_icon_size?: number | null
          footer_icons_config?: Json | null
          footer_logo_url?: string | null
          header_logo_url?: string | null
          home_content?: Json | null
          id?: string
          instagram_icon_url?: string | null
          instagram_url?: string | null
          layout?: Json | null
          logo_url?: string | null
          phone?: string | null
          sidebar_logo_url?: string | null
          updated_at?: string | null
          welcome_logo_url?: string | null
          whatsapp_icon_url?: string | null
        }
        Relationships: []
      }
      company_settings: {
        Row: {
          address: string
          company_name: string
          dav_config: Json | null
          document: string
          email: string
          id: string
          logo_bg_color: string | null
          logo_url: string | null
          monthly_goal: number | null
          phone: string
        }
        Insert: {
          address: string
          company_name: string
          dav_config?: Json | null
          document: string
          email: string
          id?: string
          logo_bg_color?: string | null
          logo_url?: string | null
          monthly_goal?: number | null
          phone: string
        }
        Update: {
          address?: string
          company_name?: string
          dav_config?: Json | null
          document?: string
          email?: string
          id?: string
          logo_bg_color?: string | null
          logo_url?: string | null
          monthly_goal?: number | null
          phone?: string
        }
        Relationships: []
      }
      expenses: {
        Row: {
          amount: number
          created_at: string | null
          date: string
          description: string
          id: string
        }
        Insert: {
          amount?: number
          created_at?: string | null
          date?: string
          description: string
          id?: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          date?: string
          description?: string
          id?: string
        }
        Relationships: []
      }
      navigation_items: {
        Row: {
          created_at: string | null
          icon_url: string | null
          id: string
          order: number | null
          parent_id: string | null
          section_key: string | null
          title: string
          type: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          icon_url?: string | null
          id?: string
          order?: number | null
          parent_id?: string | null
          section_key?: string | null
          title: string
          type: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          icon_url?: string | null
          id?: string
          order?: number | null
          parent_id?: string | null
          section_key?: string | null
          title?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "navigation_items_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "navigation_items"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          dav_data: Json | null
          id: string
          order_id: string
          product_id: string
          quantity: number
          unit_cost: number
          unit_price: number
        }
        Insert: {
          dav_data?: Json | null
          id?: string
          order_id: string
          product_id: string
          quantity?: number
          unit_cost?: number
          unit_price?: number
        }
        Update: {
          dav_data?: Json | null
          id?: string
          order_id?: string
          product_id?: string
          quantity?: number
          unit_cost?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          client_id: string
          created_at: string | null
          dav_data: Json | null
          delivery_date: string | null
          history: Json | null
          id: string
          internal_notes: string | null
          notes: string | null
          payment_method: string | null
          seller_id: string | null
          short_id: string
          status: string
          total: number
        }
        Insert: {
          client_id: string
          created_at?: string | null
          dav_data?: Json | null
          delivery_date?: string | null
          history?: Json | null
          id?: string
          internal_notes?: string | null
          notes?: string | null
          payment_method?: string | null
          seller_id?: string | null
          short_id: string
          status?: string
          total?: number
        }
        Update: {
          client_id?: string
          created_at?: string | null
          dav_data?: Json | null
          delivery_date?: string | null
          history?: Json | null
          id?: string
          internal_notes?: string | null
          notes?: string | null
          payment_method?: string | null
          seller_id?: string | null
          short_id?: string
          status?: string
          total?: number
        }
        Relationships: [
          {
            foreignKeyName: "orders_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "sellers"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          active: boolean | null
          code: number
          created_at: string | null
          diameter: string | null
          height: string | null
          id: string
          image_url: string | null
          min_quantity: number
          name: string
          neck: string | null
          size: string | null
          stock: number
          unit_cost: number
          unit_price_cento: number
          unit_price_milheiro: number
          unit_price_min: number
        }
        Insert: {
          active?: boolean | null
          code?: number
          created_at?: string | null
          diameter?: string | null
          height?: string | null
          id?: string
          image_url?: string | null
          min_quantity?: number
          name: string
          neck?: string | null
          size?: string | null
          stock?: number
          unit_cost?: number
          unit_price_cento?: number
          unit_price_milheiro?: number
          unit_price_min?: number
        }
        Update: {
          active?: boolean | null
          code?: number
          created_at?: string | null
          diameter?: string | null
          height?: string | null
          id?: string
          image_url?: string | null
          min_quantity?: number
          name?: string
          neck?: string | null
          size?: string | null
          stock?: number
          unit_cost?: number
          unit_price_cento?: number
          unit_price_milheiro?: number
          unit_price_min?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string
          id: string
          name: string | null
          role: string
        }
        Insert: {
          created_at?: string | null
          email: string
          id: string
          name?: string | null
          role?: string
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          name?: string | null
          role?: string
        }
        Relationships: []
      }
      sellers: {
        Row: {
          commission_rate: number
          created_at: string | null
          id: string
          name: string
        }
        Insert: {
          commission_rate?: number
          created_at?: string | null
          id?: string
          name: string
        }
        Update: {
          commission_rate?: number
          created_at?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      site_content: {
        Row: {
          content: Json | null
          id: string
          section_key: string
          settings: Json | null
          updated_at: string | null
        }
        Insert: {
          content?: Json | null
          id?: string
          section_key: string
          settings?: Json | null
          updated_at?: string | null
        }
        Update: {
          content?: Json | null
          id?: string
          section_key?: string
          settings?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const


// ====== DATABASE EXTENDED CONTEXT (auto-generated) ======
// This section contains actual PostgreSQL column types, constraints, RLS policies,
// functions, triggers, indexes and materialized views not present in the type definitions above.
// IMPORTANT: The TypeScript types above map UUID, TEXT, VARCHAR all to "string".
// Use the COLUMN TYPES section below to know the real PostgreSQL type for each column.
// Always use the correct PostgreSQL type when writing SQL migrations.

// --- COLUMN TYPES (actual PostgreSQL types) ---
// Use this to know the real database type when writing migrations.
// "string" in TypeScript types above may be uuid, text, varchar, timestamptz, etc.
// Table: clients
//   id: uuid (not null, default: gen_random_uuid())
//   name: text (not null)
//   responsible: text (nullable)
//   document: text (not null)
//   segment: text (nullable)
//   address: text (nullable)
//   neighborhood: text (nullable)
//   city: text (nullable)
//   state: text (nullable)
//   phone: text (nullable)
//   whatsapp: text (nullable)
//   email: text (nullable)
//   notes: text (nullable)
//   created_at: timestamp with time zone (nullable, default: now())
//   category: text (nullable, default: 'Normal'::text)
// Table: clinic_settings
//   id: uuid (not null, default: gen_random_uuid())
//   logo_url: text (nullable)
//   phone: text (nullable)
//   address: text (nullable)
//   colors: jsonb (nullable, default: '{}'::jsonb)
//   home_content: jsonb (nullable, default: '{}'::jsonb)
//   updated_at: timestamp with time zone (nullable, default: now())
//   layout: jsonb (nullable, default: '{}'::jsonb)
//   footer_logo_url: text (nullable)
//   address_url: text (nullable)
//   instagram_url: text (nullable)
//   whatsapp_icon_url: text (nullable)
//   instagram_icon_url: text (nullable)
//   email_icon_url: text (nullable)
//   address_icon_url: text (nullable)
//   email: text (nullable)
//   footer_icon_size: integer (nullable, default: 24)
//   footer_icons_config: jsonb (nullable, default: '{}'::jsonb)
//   sidebar_logo_url: text (nullable)
//   header_logo_url: text (nullable)
//   welcome_logo_url: text (nullable)
// Table: company_settings
//   id: uuid (not null, default: gen_random_uuid())
//   company_name: text (not null)
//   document: text (not null)
//   address: text (not null)
//   phone: text (not null)
//   email: text (not null)
//   logo_url: text (nullable)
//   logo_bg_color: text (nullable, default: '#EBF2F7'::text)
//   monthly_goal: numeric (nullable, default: 10000)
//   dav_config: jsonb (nullable, default: '{}'::jsonb)
// Table: expenses
//   id: uuid (not null, default: gen_random_uuid())
//   description: text (not null)
//   amount: numeric (not null, default: 0)
//   date: date (not null, default: CURRENT_DATE)
//   created_at: timestamp with time zone (nullable, default: now())
// Table: navigation_items
//   id: uuid (not null, default: gen_random_uuid())
//   parent_id: uuid (nullable)
//   title: text (not null)
//   type: text (not null)
//   section_key: text (nullable)
//   order: integer (nullable, default: 0)
//   created_at: timestamp with time zone (nullable, default: now())
//   updated_at: timestamp with time zone (nullable, default: now())
//   icon_url: text (nullable)
// Table: order_items
//   id: uuid (not null, default: gen_random_uuid())
//   order_id: uuid (not null)
//   product_id: uuid (not null)
//   quantity: integer (not null, default: 1)
//   unit_price: numeric (not null, default: 0)
//   unit_cost: numeric (not null, default: 0)
//   dav_data: jsonb (nullable, default: '{}'::jsonb)
// Table: orders
//   id: uuid (not null, default: gen_random_uuid())
//   short_id: text (not null)
//   client_id: uuid (not null)
//   seller_id: uuid (nullable)
//   status: text (not null, default: 'Pedido registrado'::text)
//   delivery_date: timestamp with time zone (nullable)
//   payment_method: text (nullable)
//   notes: text (nullable)
//   internal_notes: text (nullable)
//   total: numeric (not null, default: 0)
//   created_at: timestamp with time zone (nullable, default: now())
//   history: jsonb (nullable, default: '[]'::jsonb)
//   dav_data: jsonb (nullable, default: '{}'::jsonb)
// Table: products
//   id: uuid (not null, default: gen_random_uuid())
//   name: text (not null)
//   size: text (nullable)
//   neck: text (nullable)
//   height: text (nullable)
//   diameter: text (nullable)
//   unit_price_milheiro: numeric (not null, default: 0)
//   unit_price_cento: numeric (not null, default: 0)
//   unit_price_min: numeric (not null, default: 0)
//   min_quantity: integer (not null, default: 1)
//   image_url: text (nullable)
//   active: boolean (nullable, default: true)
//   created_at: timestamp with time zone (nullable, default: now())
//   stock: integer (not null, default: 0)
//   unit_cost: numeric (not null, default: 0)
//   code: integer (not null, default: nextval('products_code_seq'::regclass))
// Table: profiles
//   id: uuid (not null)
//   email: text (not null)
//   name: text (nullable)
//   role: text (not null, default: 'seller'::text)
//   created_at: timestamp with time zone (nullable, default: now())
// Table: sellers
//   id: uuid (not null, default: gen_random_uuid())
//   name: text (not null)
//   created_at: timestamp with time zone (nullable, default: now())
//   commission_rate: numeric (not null, default: 5)
// Table: site_content
//   id: uuid (not null, default: gen_random_uuid())
//   section_key: text (not null)
//   content: jsonb (nullable, default: '[]'::jsonb)
//   settings: jsonb (nullable, default: '{}'::jsonb)
//   updated_at: timestamp with time zone (nullable, default: now())

// --- CONSTRAINTS ---
// Table: clients
//   PRIMARY KEY clients_pkey: PRIMARY KEY (id)
// Table: clinic_settings
//   PRIMARY KEY clinic_settings_pkey: PRIMARY KEY (id)
// Table: company_settings
//   PRIMARY KEY company_settings_pkey: PRIMARY KEY (id)
// Table: expenses
//   PRIMARY KEY expenses_pkey: PRIMARY KEY (id)
// Table: navigation_items
//   FOREIGN KEY navigation_items_parent_id_fkey: FOREIGN KEY (parent_id) REFERENCES navigation_items(id) ON DELETE CASCADE
//   PRIMARY KEY navigation_items_pkey: PRIMARY KEY (id)
//   CHECK navigation_items_type_check: CHECK ((type = ANY (ARRAY['part'::text, 'theme'::text, 'subtheme'::text])))
// Table: order_items
//   FOREIGN KEY order_items_order_id_fkey: FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
//   PRIMARY KEY order_items_pkey: PRIMARY KEY (id)
//   FOREIGN KEY order_items_product_id_fkey: FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT
// Table: orders
//   FOREIGN KEY orders_client_id_fkey: FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE RESTRICT
//   PRIMARY KEY orders_pkey: PRIMARY KEY (id)
//   FOREIGN KEY orders_seller_id_fkey: FOREIGN KEY (seller_id) REFERENCES sellers(id) ON DELETE SET NULL
// Table: products
//   PRIMARY KEY products_pkey: PRIMARY KEY (id)
// Table: profiles
//   FOREIGN KEY profiles_id_fkey: FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE
//   PRIMARY KEY profiles_pkey: PRIMARY KEY (id)
// Table: sellers
//   PRIMARY KEY sellers_pkey: PRIMARY KEY (id)
// Table: site_content
//   PRIMARY KEY site_content_pkey: PRIMARY KEY (id)
//   UNIQUE site_content_section_key_key: UNIQUE (section_key)

// --- ROW LEVEL SECURITY POLICIES ---
// Table: clients
//   Policy "public_all" (ALL, PERMISSIVE) roles={public}
//     USING: true
//     WITH CHECK: true
// Table: clinic_settings
//   Policy "public_all_clinic_settings" (ALL, PERMISSIVE) roles={public}
//     USING: true
//     WITH CHECK: true
// Table: company_settings
//   Policy "public_all" (ALL, PERMISSIVE) roles={public}
//     USING: true
//     WITH CHECK: true
// Table: expenses
//   Policy "public_all" (ALL, PERMISSIVE) roles={public}
//     USING: true
//     WITH CHECK: true
// Table: navigation_items
//   Policy "public_all_navigation_items" (ALL, PERMISSIVE) roles={public}
//     USING: true
//     WITH CHECK: true
// Table: order_items
//   Policy "public_all" (ALL, PERMISSIVE) roles={public}
//     USING: true
//     WITH CHECK: true
// Table: orders
//   Policy "public_all" (ALL, PERMISSIVE) roles={public}
//     USING: true
//     WITH CHECK: true
// Table: products
//   Policy "public_all" (ALL, PERMISSIVE) roles={public}
//     USING: true
//     WITH CHECK: true
// Table: profiles
//   Policy "public_all" (ALL, PERMISSIVE) roles={public}
//     USING: true
//     WITH CHECK: true
// Table: sellers
//   Policy "public_all" (ALL, PERMISSIVE) roles={public}
//     USING: true
//     WITH CHECK: true
// Table: site_content
//   Policy "public_all_site_content" (ALL, PERMISSIVE) roles={public}
//     USING: true
//     WITH CHECK: true

// --- DATABASE FUNCTIONS ---
// FUNCTION append_order_history()
//   CREATE OR REPLACE FUNCTION public.append_order_history()
//    RETURNS trigger
//    LANGUAGE plpgsql
//   AS $function$
//   BEGIN
//     IF OLD.status IS DISTINCT FROM NEW.status THEN
//       NEW.history = COALESCE(OLD.history, '[]'::jsonb) || jsonb_build_object(
//         'status', NEW.status,
//         'date', NOW()
//       );
//     END IF;
//     RETURN NEW;
//   END;
//   $function$
//   
// FUNCTION handle_new_user()
//   CREATE OR REPLACE FUNCTION public.handle_new_user()
//    RETURNS trigger
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//   AS $function$
//   BEGIN
//     INSERT INTO public.profiles (id, email, name, role)
//     VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'name', 'admin')
//     ON CONFLICT (id) DO NOTHING;
//     RETURN NEW;
//   END;
//   $function$
//   

// --- TRIGGERS ---
// Table: orders
//   order_status_history_trigger: CREATE TRIGGER order_status_history_trigger BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION append_order_history()

// --- INDEXES ---
// Table: site_content
//   CREATE UNIQUE INDEX site_content_section_key_key ON public.site_content USING btree (section_key)

