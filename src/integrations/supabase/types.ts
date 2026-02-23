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
      audit_logi: {
        Row: {
          akcja: string
          created_at: string
          encja: string
          encja_id: string | null
          id: string
          szczegoly: Json | null
          user_id: string | null
        }
        Insert: {
          akcja: string
          created_at?: string
          encja: string
          encja_id?: string | null
          id?: string
          szczegoly?: Json | null
          user_id?: string | null
        }
        Update: {
          akcja?: string
          created_at?: string
          encja?: string
          encja_id?: string | null
          id?: string
          szczegoly?: Json | null
          user_id?: string | null
        }
        Relationships: []
      }
      budynki: {
        Row: {
          adres: string
          created_at: string
          id: string
          inwestycja_id: string
          kod_pocztowy: string | null
          liczba_lokali: number | null
          miasto: string | null
          nazwa: string
          updated_at: string
        }
        Insert: {
          adres: string
          created_at?: string
          id?: string
          inwestycja_id: string
          kod_pocztowy?: string | null
          liczba_lokali?: number | null
          miasto?: string | null
          nazwa: string
          updated_at?: string
        }
        Update: {
          adres?: string
          created_at?: string
          id?: string
          inwestycja_id?: string
          kod_pocztowy?: string | null
          liczba_lokali?: number | null
          miasto?: string | null
          nazwa?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "budynki_inwestycja_id_fkey"
            columns: ["inwestycja_id"]
            isOneToOne: false
            referencedRelation: "inwestycje"
            referencedColumns: ["id"]
          },
        ]
      }
      inwestorzy: {
        Row: {
          adres: string | null
          created_at: string
          id: string
          kontakt: string | null
          nazwa: string
          nip: string | null
          updated_at: string
        }
        Insert: {
          adres?: string | null
          created_at?: string
          id?: string
          kontakt?: string | null
          nazwa: string
          nip?: string | null
          updated_at?: string
        }
        Update: {
          adres?: string | null
          created_at?: string
          id?: string
          kontakt?: string | null
          nazwa?: string
          nip?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      inwestycje: {
        Row: {
          created_at: string
          id: string
          inwestor_id: string
          nazwa: string
          opis: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          inwestor_id: string
          nazwa: string
          opis?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          inwestor_id?: string
          nazwa?: string
          opis?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "inwestycje_inwestor_id_fkey"
            columns: ["inwestor_id"]
            isOneToOne: false
            referencedRelation: "inwestorzy"
            referencedColumns: ["id"]
          },
        ]
      }
      lokale: {
        Row: {
          budynek_id: string
          created_at: string
          id: string
          numer: string
          pietro: number | null
          powierzchnia: number | null
          typ: string | null
          updated_at: string
        }
        Insert: {
          budynek_id: string
          created_at?: string
          id?: string
          numer: string
          pietro?: number | null
          powierzchnia?: number | null
          typ?: string | null
          updated_at?: string
        }
        Update: {
          budynek_id?: string
          created_at?: string
          id?: string
          numer?: string
          pietro?: number | null
          powierzchnia?: number | null
          typ?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lokale_budynek_id_fkey"
            columns: ["budynek_id"]
            isOneToOne: false
            referencedRelation: "budynki"
            referencedColumns: ["id"]
          },
        ]
      }
      mierniki: {
        Row: {
          created_at: string
          data_instalacji: string | null
          device_id: string
          id: string
          last_sync_at: string | null
          lokal_id: string
          nazwa: string | null
          status: string | null
          typ: Database["public"]["Enums"]["media_type"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          data_instalacji?: string | null
          device_id: string
          id?: string
          last_sync_at?: string | null
          lokal_id: string
          nazwa?: string | null
          status?: string | null
          typ: Database["public"]["Enums"]["media_type"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          data_instalacji?: string | null
          device_id?: string
          id?: string
          last_sync_at?: string | null
          lokal_id?: string
          nazwa?: string | null
          status?: string | null
          typ?: Database["public"]["Enums"]["media_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "mierniki_lokal_id_fkey"
            columns: ["lokal_id"]
            isOneToOne: false
            referencedRelation: "lokale"
            referencedColumns: ["id"]
          },
        ]
      }
      odczyty: {
        Row: {
          created_at: string
          id: string
          jakosc_danych: Database["public"]["Enums"]["data_quality"]
          jednostka: string
          punkt_pomiarowy_id: string
          timestamp: string
          wartosc: number
        }
        Insert: {
          created_at?: string
          id?: string
          jakosc_danych?: Database["public"]["Enums"]["data_quality"]
          jednostka?: string
          punkt_pomiarowy_id: string
          timestamp?: string
          wartosc: number
        }
        Update: {
          created_at?: string
          id?: string
          jakosc_danych?: Database["public"]["Enums"]["data_quality"]
          jednostka?: string
          punkt_pomiarowy_id?: string
          timestamp?: string
          wartosc?: number
        }
        Relationships: [
          {
            foreignKeyName: "odczyty_punkt_pomiarowy_id_fkey"
            columns: ["punkt_pomiarowy_id"]
            isOneToOne: false
            referencedRelation: "punkty_pomiarowe"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      punkty_pomiarowe: {
        Row: {
          created_at: string
          id: string
          jednostka: string
          miernik_id: string
          nazwa: string
          typ: Database["public"]["Enums"]["media_type"]
        }
        Insert: {
          created_at?: string
          id?: string
          jednostka?: string
          miernik_id: string
          nazwa: string
          typ: Database["public"]["Enums"]["media_type"]
        }
        Update: {
          created_at?: string
          id?: string
          jednostka?: string
          miernik_id?: string
          nazwa?: string
          typ?: Database["public"]["Enums"]["media_type"]
        }
        Relationships: [
          {
            foreignKeyName: "punkty_pomiarowe_miernik_id_fkey"
            columns: ["miernik_id"]
            isOneToOne: false
            referencedRelation: "mierniki"
            referencedColumns: ["id"]
          },
        ]
      }
      sync_logi: {
        Row: {
          bledy_count: number | null
          budynki_count: number | null
          created_at: string
          id: string
          rekordy_count: number | null
          status: Database["public"]["Enums"]["sync_status"]
          szczegoly: Json | null
        }
        Insert: {
          bledy_count?: number | null
          budynki_count?: number | null
          created_at?: string
          id?: string
          rekordy_count?: number | null
          status: Database["public"]["Enums"]["sync_status"]
          szczegoly?: Json | null
        }
        Update: {
          bledy_count?: number | null
          budynki_count?: number | null
          created_at?: string
          id?: string
          rekordy_count?: number | null
          status?: Database["public"]["Enums"]["sync_status"]
          szczegoly?: Json | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      zarzadca_budynek: {
        Row: {
          budynek_id: string
          created_at: string
          data_do: string | null
          data_od: string
          id: string
          zarzadca_user_id: string
        }
        Insert: {
          budynek_id: string
          created_at?: string
          data_do?: string | null
          data_od?: string
          id?: string
          zarzadca_user_id: string
        }
        Update: {
          budynek_id?: string
          created_at?: string
          data_do?: string | null
          data_od?: string
          id?: string
          zarzadca_user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "zarzadca_budynek_budynek_id_fkey"
            columns: ["budynek_id"]
            isOneToOne: false
            referencedRelation: "budynki"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: never; Returns: boolean }
      is_zarzadca_assigned_to_budynek: {
        Args: { _budynek_id: string }
        Returns: boolean
      }
      is_zarzadca_assigned_to_inwestycja: {
        Args: { _inwestycja_id: string }
        Returns: boolean
      }
      is_zarzadca_assigned_to_lokal: {
        Args: { _lokal_id: string }
        Returns: boolean
      }
      is_zarzadca_assigned_to_miernik: {
        Args: { _miernik_id: string }
        Returns: boolean
      }
      is_zarzadca_assigned_to_odczyt: {
        Args: { _odczyt_punkt_id: string }
        Returns: boolean
      }
      is_zarzadca_assigned_to_punkt: {
        Args: { _punkt_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "zarzadca"
      data_quality: "validated" | "estimated" | "missing"
      media_type: "woda" | "cieplo" | "energia"
      sync_status: "success" | "partial" | "failed"
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
    Enums: {
      app_role: ["admin", "zarzadca"],
      data_quality: ["validated", "estimated", "missing"],
      media_type: ["woda", "cieplo", "energia"],
      sync_status: ["success", "partial", "failed"],
    },
  },
} as const
