// AVOID UPDATING THIS FILE DIRECTLY. It is automatically generated.
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: '14.1'
  }
  public: {
    Tables: {
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
            foreignKeyName: 'navigation_items_parent_id_fkey'
            columns: ['parent_id']
            isOneToOne: false
            referencedRelation: 'navigation_items'
            referencedColumns: ['id']
          },
        ]
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

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] & DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema['Enums']
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
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
// Table: site_content
//   id: uuid (not null, default: gen_random_uuid())
//   section_key: text (not null)
//   content: jsonb (nullable, default: '[]'::jsonb)
//   settings: jsonb (nullable, default: '{}'::jsonb)
//   updated_at: timestamp with time zone (nullable, default: now())

// --- CONSTRAINTS ---
// Table: clinic_settings
//   PRIMARY KEY clinic_settings_pkey: PRIMARY KEY (id)
// Table: navigation_items
//   FOREIGN KEY navigation_items_parent_id_fkey: FOREIGN KEY (parent_id) REFERENCES navigation_items(id) ON DELETE CASCADE
//   PRIMARY KEY navigation_items_pkey: PRIMARY KEY (id)
//   CHECK navigation_items_type_check: CHECK ((type = ANY (ARRAY['part'::text, 'theme'::text, 'subtheme'::text])))
// Table: site_content
//   PRIMARY KEY site_content_pkey: PRIMARY KEY (id)
//   UNIQUE site_content_section_key_key: UNIQUE (section_key)

// --- ROW LEVEL SECURITY POLICIES ---
// Table: clinic_settings
//   Policy "Authenticated insert for clinic_settings" (INSERT, PERMISSIVE) roles={public}
//     WITH CHECK: (auth.role() = 'authenticated'::text)
//   Policy "Authenticated update for clinic_settings" (UPDATE, PERMISSIVE) roles={public}
//     USING: (auth.role() = 'authenticated'::text)
//   Policy "Public read access for clinic_settings" (SELECT, PERMISSIVE) roles={public}
//     USING: true
// Table: navigation_items
//   Policy "Authenticated full access for navigation_items" (ALL, PERMISSIVE) roles={public}
//     USING: (auth.role() = 'authenticated'::text)
//     WITH CHECK: (auth.role() = 'authenticated'::text)
//   Policy "Public read access for navigation_items" (SELECT, PERMISSIVE) roles={public}
//     USING: true
// Table: site_content
//   Policy "Authenticated upsert for site_content" (ALL, PERMISSIVE) roles={public}
//     USING: (auth.role() = 'authenticated'::text)
//     WITH CHECK: (auth.role() = 'authenticated'::text)
//   Policy "Public read access for site_content" (SELECT, PERMISSIVE) roles={public}
//     USING: true

// --- INDEXES ---
// Table: site_content
//   CREATE UNIQUE INDEX site_content_section_key_key ON public.site_content USING btree (section_key)
