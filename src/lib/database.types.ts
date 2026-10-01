export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  public: {
    Tables: {
      artworks: {
        Row: {
          app: string;
          created_at: string;
          description: string;
          height: number | null;
          id: string;
          image_url: string;
          layer_name: string;
          slug: string;
          sort_order: number;
          title: string;
          visible: boolean;
          width: number | null;
        };
        Insert: {
          app: string;
          created_at?: string;
          description: string;
          height?: number | null;
          id?: string;
          image_url: string;
          layer_name: string;
          slug: string;
          sort_order?: number;
          title: string;
          visible?: boolean;
          width?: number | null;
        };
        Update: {
          app?: string;
          created_at?: string;
          description?: string;
          height?: number | null;
          id?: string;
          image_url?: string;
          layer_name?: string;
          slug?: string;
          sort_order?: number;
          title?: string;
          visible?: boolean;
          width?: number | null;
        };
        Relationships: [];
      };
      cv_education: {
        Row: {
          city: string | null;
          created_at: string;
          degree: string;
          details: string | null;
          end_year: number;
          id: string;
          logo_url: string | null;
          school: string;
          sort_order: number;
          start_year: number | null;
          visible: boolean;
        };
        Insert: {
          city?: string | null;
          created_at?: string;
          degree: string;
          details?: string | null;
          end_year: number;
          id?: string;
          logo_url?: string | null;
          school: string;
          sort_order?: number;
          start_year?: number | null;
          visible?: boolean;
        };
        Update: {
          city?: string | null;
          created_at?: string;
          degree?: string;
          details?: string | null;
          end_year?: number;
          id?: string;
          logo_url?: string | null;
          school?: string;
          sort_order?: number;
          start_year?: number | null;
          visible?: boolean;
        };
        Relationships: [];
      };
      cv_experiences: {
        Row: {
          company: string;
          created_at: string;
          description: string | null;
          end_date: string | null;
          id: string;
          location: string | null;
          logo_url: string | null;
          role: string;
          sort_order: number;
          start_date: string;
          visible: boolean;
        };
        Insert: {
          company: string;
          created_at?: string;
          description?: string | null;
          end_date?: string | null;
          id?: string;
          location?: string | null;
          logo_url?: string | null;
          role: string;
          sort_order?: number;
          start_date: string;
          visible?: boolean;
        };
        Update: {
          company?: string;
          created_at?: string;
          description?: string | null;
          end_date?: string | null;
          id?: string;
          location?: string | null;
          logo_url?: string | null;
          role?: string;
          sort_order?: number;
          start_date?: string;
          visible?: boolean;
        };
        Relationships: [];
      };
      cv_languages: {
        Row: {
          created_at: string;
          flag_code: string;
          id: string;
          level: string;
          name: string;
          sort_order: number;
          visible: boolean;
        };
        Insert: {
          created_at?: string;
          flag_code: string;
          id?: string;
          level: string;
          name: string;
          sort_order?: number;
          visible?: boolean;
        };
        Update: {
          created_at?: string;
          flag_code?: string;
          id?: string;
          level?: string;
          name?: string;
          sort_order?: number;
          visible?: boolean;
        };
        Relationships: [];
      };
      cv_links: {
        Row: {
          created_at: string;
          id: string;
          label: string;
          platform: Database["public"]["Enums"]["cv_link_platform"];
          sort_order: number;
          url: string;
          visible: boolean;
        };
        Insert: {
          created_at?: string;
          id?: string;
          label: string;
          platform: Database["public"]["Enums"]["cv_link_platform"];
          sort_order?: number;
          url: string;
          visible?: boolean;
        };
        Update: {
          created_at?: string;
          id?: string;
          label?: string;
          platform?: Database["public"]["Enums"]["cv_link_platform"];
          sort_order?: number;
          url?: string;
          visible?: boolean;
        };
        Relationships: [];
      };
      cv_mobility: {
        Row: {
          created_at: string;
          detail: string | null;
          icon_key: string;
          id: string;
          label: string;
          sort_order: number;
          visible: boolean;
        };
        Insert: {
          created_at?: string;
          detail?: string | null;
          icon_key: string;
          id?: string;
          label: string;
          sort_order?: number;
          visible?: boolean;
        };
        Update: {
          created_at?: string;
          detail?: string | null;
          icon_key?: string;
          id?: string;
          label?: string;
          sort_order?: number;
          visible?: boolean;
        };
        Relationships: [];
      };
      cv_profile: {
        Row: {
          about: string;
          availability_detail: string | null;
          availability_title: string | null;
          avatar_url: string | null;
          email: string;
          full_name: string;
          headline: string;
          id: number;
          is_available: boolean;
          location: string | null;
          phone: string | null;
          quote: string | null;
          quote_author: string | null;
          updated_at: string;
        };
        Insert: {
          about: string;
          availability_detail?: string | null;
          availability_title?: string | null;
          avatar_url?: string | null;
          email: string;
          full_name: string;
          headline: string;
          id?: number;
          is_available?: boolean;
          location?: string | null;
          phone?: string | null;
          quote?: string | null;
          quote_author?: string | null;
          updated_at?: string;
        };
        Update: {
          about?: string;
          availability_detail?: string | null;
          availability_title?: string | null;
          avatar_url?: string | null;
          email?: string;
          full_name?: string;
          headline?: string;
          id?: number;
          is_available?: boolean;
          location?: string | null;
          phone?: string | null;
          quote?: string | null;
          quote_author?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      cv_skills: {
        Row: {
          category: Database["public"]["Enums"]["cv_skill_category"];
          created_at: string;
          details: string[];
          id: string;
          label: string;
          sort_order: number;
          visible: boolean;
        };
        Insert: {
          category: Database["public"]["Enums"]["cv_skill_category"];
          created_at?: string;
          details?: string[];
          id?: string;
          label: string;
          sort_order?: number;
          visible?: boolean;
        };
        Update: {
          category?: Database["public"]["Enums"]["cv_skill_category"];
          created_at?: string;
          details?: string[];
          id?: string;
          label?: string;
          sort_order?: number;
          visible?: boolean;
        };
        Relationships: [];
      };
      cv_tools: {
        Row: {
          created_at: string;
          icon_key: string;
          id: string;
          name: string;
          purpose: string | null;
          sort_order: number;
          visible: boolean;
        };
        Insert: {
          created_at?: string;
          icon_key: string;
          id?: string;
          name: string;
          purpose?: string | null;
          sort_order?: number;
          visible?: boolean;
        };
        Update: {
          created_at?: string;
          icon_key?: string;
          id?: string;
          name?: string;
          purpose?: string | null;
          sort_order?: number;
          visible?: boolean;
        };
        Relationships: [];
      };
      projects: {
        Row: {
          created_at: string;
          default_height: number | null;
          default_width: number | null;
          description: string | null;
          display_mode: string;
          id: string;
          logo_url: string;
          name: string;
          show_on_desktop: boolean;
          show_on_mobile: boolean;
          slug: string;
          sort_order: number;
          tech: string[];
          url: string;
          visible: boolean;
        };
        Insert: {
          created_at?: string;
          default_height?: number | null;
          default_width?: number | null;
          description?: string | null;
          display_mode: string;
          id?: string;
          logo_url: string;
          name: string;
          show_on_desktop?: boolean;
          show_on_mobile?: boolean;
          slug: string;
          sort_order?: number;
          tech?: string[];
          url: string;
          visible?: boolean;
        };
        Update: {
          created_at?: string;
          default_height?: number | null;
          default_width?: number | null;
          description?: string | null;
          display_mode?: string;
          id?: string;
          logo_url?: string;
          name?: string;
          show_on_desktop?: boolean;
          show_on_mobile?: boolean;
          slug?: string;
          sort_order?: number;
          tech?: string[];
          url?: string;
          visible?: boolean;
        };
        Relationships: [];
      };
      videos: {
        Row: {
          created_at: string;
          description: string | null;
          duration: string | null;
          id: string;
          slug: string;
          sort_order: number;
          title: string;
          visible: boolean;
          youtube_id: string;
        };
        Insert: {
          created_at?: string;
          description?: string | null;
          duration?: string | null;
          id?: string;
          slug: string;
          sort_order?: number;
          title: string;
          visible?: boolean;
          youtube_id: string;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          duration?: string | null;
          id?: string;
          slug?: string;
          sort_order?: number;
          title?: string;
          visible?: boolean;
          youtube_id?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      cv_link_platform: "linkedin" | "github" | "freecodecamp" | "website" | "other";
      cv_skill_category: "design" | "development";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    keyof DefaultSchema["CompositeTypes"] | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      cv_link_platform: ["linkedin", "github", "freecodecamp", "website", "other"],
      cv_skill_category: ["design", "development"],
    },
  },
} as const;
