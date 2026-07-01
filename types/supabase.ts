export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string
          name: string
          twilio_phone: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          name: string
          twilio_phone?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          twilio_phone?: string | null
          created_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          id: string
          org_id: string | null
          role: string | null
          created_at: string | null
        }
        Insert: {
          id: string
          org_id?: string | null
          role?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          org_id?: string | null
          role?: string | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_org_id_fkey"
            columns: ["org_id"]
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          }
        ]
      }
      properties: {
        Row: {
          id: string
          org_id: string | null
          address: string
          created_at: string | null
        }
        Insert: {
          id?: string
          org_id?: string | null
          address: string
          created_at?: string | null
        }
        Update: {
          id?: string
          org_id?: string | null
          address?: string
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "properties_org_id_fkey"
            columns: ["org_id"]
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          }
        ]
      }
      tenants: {
        Row: {
          id: string
          org_id: string | null
          property_id: string | null
          name: string
          phone: string
          created_at: string | null
        }
        Insert: {
          id?: string
          org_id?: string | null
          property_id?: string | null
          name: string
          phone: string
          created_at?: string | null
        }
        Update: {
          id?: string
          org_id?: string | null
          property_id?: string | null
          name?: string
          phone?: string
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tenants_org_id_fkey"
            columns: ["org_id"]
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tenants_property_id_fkey"
            columns: ["property_id"]
            referencedRelation: "properties"
            referencedColumns: ["id"]
          }
        ]
      }
      tickets: {
        Row: {
          id: string
          org_id: string | null
          tenant_id: string | null
          title: string | null
          status: 'open' | 'resolved' | 'dispatch_needed' | null
          truck_roll_prevented: boolean | null
          created_at: string | null
        }
        Insert: {
          id?: string
          org_id?: string | null
          tenant_id?: string | null
          title?: string | null
          status?: 'open' | 'resolved' | 'dispatch_needed' | null
          truck_roll_prevented?: boolean | null
          created_at?: string | null
        }
        Update: {
          id?: string
          org_id?: string | null
          tenant_id?: string | null
          title?: string | null
          status?: 'open' | 'resolved' | 'dispatch_needed' | null
          truck_roll_prevented?: boolean | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tickets_org_id_fkey"
            columns: ["org_id"]
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tickets_tenant_id_fkey"
            columns: ["tenant_id"]
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          }
        ]
      }
      messages: {
        Row: {
          id: string
          ticket_id: string | null
          sender: 'tenant' | 'ai'
          content: string
          image_url: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          ticket_id?: string | null
          sender: 'tenant' | 'ai'
          content: string
          image_url?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          ticket_id?: string | null
          sender?: 'tenant' | 'ai'
          content?: string
          image_url?: string | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_ticket_id_fkey"
            columns: ["ticket_id"]
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_current_org_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
