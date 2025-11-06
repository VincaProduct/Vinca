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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      authors: {
        Row: {
          bio: string | null
          created_at: string
          id: string
          image: string | null
          name: string
          title: string | null
          updated_at: string
        }
        Insert: {
          bio?: string | null
          created_at?: string
          id?: string
          image?: string | null
          name: string
          title?: string | null
          updated_at?: string
        }
        Update: {
          bio?: string | null
          created_at?: string
          id?: string
          image?: string | null
          name?: string
          title?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      blog_posts: {
        Row: {
          author_bio: string | null
          author_id: string | null
          author_image: string | null
          author_name: string | null
          author_title: string | null
          category: string
          content: string
          created_at: string
          excerpt: string | null
          featured_image: string | null
          id: string
          published_at: string | null
          read_time: string | null
          slug: string
          status: string | null
          subtitle: string | null
          table_of_contents: Json | null
          title: string
          updated_at: string
        }
        Insert: {
          author_bio?: string | null
          author_id?: string | null
          author_image?: string | null
          author_name?: string | null
          author_title?: string | null
          category: string
          content: string
          created_at?: string
          excerpt?: string | null
          featured_image?: string | null
          id?: string
          published_at?: string | null
          read_time?: string | null
          slug: string
          status?: string | null
          subtitle?: string | null
          table_of_contents?: Json | null
          title: string
          updated_at?: string
        }
        Update: {
          author_bio?: string | null
          author_id?: string | null
          author_image?: string | null
          author_name?: string | null
          author_title?: string | null
          category?: string
          content?: string
          created_at?: string
          excerpt?: string | null
          featured_image?: string | null
          id?: string
          published_at?: string | null
          read_time?: string | null
          slug?: string
          status?: string | null
          subtitle?: string | null
          table_of_contents?: Json | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "blog_posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "authors"
            referencedColumns: ["id"]
          },
        ]
      }
      consultation_bookings: {
        Row: {
          additional_info: string | null
          admin_notes: string | null
          consultation_type: string
          created_at: string
          email: string
          full_name: string
          id: string
          phone: string
          preferred_date: string
          preferred_time_slot: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          additional_info?: string | null
          admin_notes?: string | null
          consultation_type: string
          created_at?: string
          email: string
          full_name: string
          id?: string
          phone: string
          preferred_date: string
          preferred_time_slot: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          additional_info?: string | null
          admin_notes?: string | null
          consultation_type?: string
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          phone?: string
          preferred_date?: string
          preferred_time_slot?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      cta_analytics: {
        Row: {
          blog_post_id: string | null
          created_at: string
          cta_id: string
          device_type: string | null
          event_type: string
          id: string
          metadata: Json | null
          referrer: string | null
          session_id: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          blog_post_id?: string | null
          created_at?: string
          cta_id: string
          device_type?: string | null
          event_type: string
          id?: string
          metadata?: Json | null
          referrer?: string | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          blog_post_id?: string | null
          created_at?: string
          cta_id?: string
          device_type?: string | null
          event_type?: string
          id?: string
          metadata?: Json | null
          referrer?: string | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cta_analytics_blog_post_id_fkey"
            columns: ["blog_post_id"]
            isOneToOne: false
            referencedRelation: "blog_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cta_analytics_cta_id_fkey"
            columns: ["cta_id"]
            isOneToOne: false
            referencedRelation: "ctas"
            referencedColumns: ["id"]
          },
        ]
      }
      cta_placements: {
        Row: {
          active: boolean | null
          author_filter: string[] | null
          blog_post_id: string | null
          category_filter: string[] | null
          created_at: string
          cta_id: string
          date_filter: Json | null
          id: string
          placement_position: Database["public"]["Enums"]["cta_placement_position"]
          position_config: Json | null
          priority: number | null
          tag_filter: string[] | null
          updated_at: string
        }
        Insert: {
          active?: boolean | null
          author_filter?: string[] | null
          blog_post_id?: string | null
          category_filter?: string[] | null
          created_at?: string
          cta_id: string
          date_filter?: Json | null
          id?: string
          placement_position?: Database["public"]["Enums"]["cta_placement_position"]
          position_config?: Json | null
          priority?: number | null
          tag_filter?: string[] | null
          updated_at?: string
        }
        Update: {
          active?: boolean | null
          author_filter?: string[] | null
          blog_post_id?: string | null
          category_filter?: string[] | null
          created_at?: string
          cta_id?: string
          date_filter?: Json | null
          id?: string
          placement_position?: Database["public"]["Enums"]["cta_placement_position"]
          position_config?: Json | null
          priority?: number | null
          tag_filter?: string[] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cta_placements_blog_post_id_fkey"
            columns: ["blog_post_id"]
            isOneToOne: false
            referencedRelation: "blog_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cta_placements_cta_id_fkey"
            columns: ["cta_id"]
            isOneToOne: false
            referencedRelation: "ctas"
            referencedColumns: ["id"]
          },
        ]
      }
      cta_templates: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          name: string
          template_config: Json
          template_type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          name: string
          template_config: Json
          template_type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          name?: string
          template_config?: Json
          template_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      ctas: {
        Row: {
          action_type: Database["public"]["Enums"]["cta_action_type"]
          action_url: string | null
          background_color: string | null
          background_image: string | null
          border_radius: string | null
          button_color: string | null
          button_hover_color: string | null
          button_text: string
          created_at: string
          created_by: string | null
          custom_css: string | null
          description: string | null
          display_condition:
            | Database["public"]["Enums"]["cta_display_condition"]
            | null
          display_config: Json | null
          headline: string
          icon_name: string | null
          id: string
          name: string
          open_in_new_tab: boolean | null
          size: string | null
          status: string | null
          text_color: string | null
          type: Database["public"]["Enums"]["cta_type"]
          updated_at: string
        }
        Insert: {
          action_type?: Database["public"]["Enums"]["cta_action_type"]
          action_url?: string | null
          background_color?: string | null
          background_image?: string | null
          border_radius?: string | null
          button_color?: string | null
          button_hover_color?: string | null
          button_text: string
          created_at?: string
          created_by?: string | null
          custom_css?: string | null
          description?: string | null
          display_condition?:
            | Database["public"]["Enums"]["cta_display_condition"]
            | null
          display_config?: Json | null
          headline: string
          icon_name?: string | null
          id?: string
          name: string
          open_in_new_tab?: boolean | null
          size?: string | null
          status?: string | null
          text_color?: string | null
          type?: Database["public"]["Enums"]["cta_type"]
          updated_at?: string
        }
        Update: {
          action_type?: Database["public"]["Enums"]["cta_action_type"]
          action_url?: string | null
          background_color?: string | null
          background_image?: string | null
          border_radius?: string | null
          button_color?: string | null
          button_hover_color?: string | null
          button_text?: string
          created_at?: string
          created_by?: string | null
          custom_css?: string | null
          description?: string | null
          display_condition?:
            | Database["public"]["Enums"]["cta_display_condition"]
            | null
          display_config?: Json | null
          headline?: string
          icon_name?: string | null
          id?: string
          name?: string
          open_in_new_tab?: boolean | null
          size?: string | null
          status?: string | null
          text_color?: string | null
          type?: Database["public"]["Enums"]["cta_type"]
          updated_at?: string
        }
        Relationships: []
      }
      ffr_educational_content: {
        Row: {
          category: string
          content_type: string
          content_url: string | null
          created_at: string
          description: string | null
          difficulty_level: string | null
          duration_seconds: number | null
          id: string
          is_active: boolean | null
          points_value: number | null
          title: string
          updated_at: string
        }
        Insert: {
          category: string
          content_type: string
          content_url?: string | null
          created_at?: string
          description?: string | null
          difficulty_level?: string | null
          duration_seconds?: number | null
          id?: string
          is_active?: boolean | null
          points_value?: number | null
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          content_type?: string
          content_url?: string | null
          created_at?: string
          description?: string | null
          difficulty_level?: string | null
          duration_seconds?: number | null
          id?: string
          is_active?: boolean | null
          points_value?: number | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      ffr_foundations_checklist: {
        Row: {
          created_at: string
          document_vault_setup: boolean | null
          emergency_fund_baseline: boolean | null
          freedom_gain_points: number | null
          id: string
          insurance_evidence: boolean | null
          kyc_refresh: boolean | null
          last_updated: string | null
          nomination_updated: boolean | null
          sip_mandate_active: boolean | null
          user_id: string
        }
        Insert: {
          created_at?: string
          document_vault_setup?: boolean | null
          emergency_fund_baseline?: boolean | null
          freedom_gain_points?: number | null
          id?: string
          insurance_evidence?: boolean | null
          kyc_refresh?: boolean | null
          last_updated?: string | null
          nomination_updated?: boolean | null
          sip_mandate_active?: boolean | null
          user_id: string
        }
        Update: {
          created_at?: string
          document_vault_setup?: boolean | null
          emergency_fund_baseline?: boolean | null
          freedom_gain_points?: number | null
          id?: string
          insurance_evidence?: boolean | null
          kyc_refresh?: boolean | null
          last_updated?: string | null
          nomination_updated?: boolean | null
          sip_mandate_active?: boolean | null
          user_id?: string
        }
        Relationships: []
      }
      ffr_opportunities: {
        Row: {
          created_at: string
          educational_content: string | null
          eligibility_criteria: Json | null
          id: string
          is_active: boolean | null
          lane: string
          opportunity_name: string
          partner_handoff_url: string | null
          seasonal_window: Json | null
          trigger_conditions: Json | null
          updated_at: string
          why_matters: string | null
        }
        Insert: {
          created_at?: string
          educational_content?: string | null
          eligibility_criteria?: Json | null
          id?: string
          is_active?: boolean | null
          lane: string
          opportunity_name: string
          partner_handoff_url?: string | null
          seasonal_window?: Json | null
          trigger_conditions?: Json | null
          updated_at?: string
          why_matters?: string | null
        }
        Update: {
          created_at?: string
          educational_content?: string | null
          eligibility_criteria?: Json | null
          id?: string
          is_active?: boolean | null
          lane?: string
          opportunity_name?: string
          partner_handoff_url?: string | null
          seasonal_window?: Json | null
          trigger_conditions?: Json | null
          updated_at?: string
          why_matters?: string | null
        }
        Relationships: []
      }
      ffr_user_actions: {
        Row: {
          action_type: string
          content_id: string | null
          created_at: string
          id: string
          metadata: Json | null
          points_earned: number | null
          user_id: string
        }
        Insert: {
          action_type: string
          content_id?: string | null
          created_at?: string
          id?: string
          metadata?: Json | null
          points_earned?: number | null
          user_id: string
        }
        Update: {
          action_type?: string
          content_id?: string | null
          created_at?: string
          id?: string
          metadata?: Json | null
          points_earned?: number | null
          user_id?: string
        }
        Relationships: []
      }
      ffr_user_progress: {
        Row: {
          created_at: string
          decumulation_score: number | null
          foundation_score: number | null
          habit_score: number | null
          id: string
          last_assessment_date: string | null
          literacy_score: number | null
          opportunity_score: number | null
          total_score_base: number | null
          total_score_conservative: number | null
          total_score_optimistic: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          decumulation_score?: number | null
          foundation_score?: number | null
          habit_score?: number | null
          id?: string
          last_assessment_date?: string | null
          literacy_score?: number | null
          opportunity_score?: number | null
          total_score_base?: number | null
          total_score_conservative?: number | null
          total_score_optimistic?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          decumulation_score?: number | null
          foundation_score?: number | null
          habit_score?: number | null
          id?: string
          last_assessment_date?: string | null
          literacy_score?: number | null
          opportunity_score?: number | null
          total_score_base?: number | null
          total_score_conservative?: number | null
          total_score_optimistic?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      payment_transactions: {
        Row: {
          created_at: string
          event_data: Json
          event_type: string
          id: string
          order_id: string | null
          payment_id: string | null
          user_id: string
          webhook_event_id: string | null
        }
        Insert: {
          created_at?: string
          event_data: Json
          event_type: string
          id?: string
          order_id?: string | null
          payment_id?: string | null
          user_id: string
          webhook_event_id?: string | null
        }
        Update: {
          created_at?: string
          event_data?: Json
          event_type?: string
          id?: string
          order_id?: string | null
          payment_id?: string | null
          user_id?: string
          webhook_event_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_transactions_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "razorpay_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_transactions_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "razorpay_payments"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          company: string | null
          created_at: string
          email: string | null
          first_name: string | null
          full_name: string | null
          id: string
          last_name: string | null
          pending_referral_code: string | null
          phone: string | null
          referral_code: string | null
          referred_by_user_id: string | null
          updated_at: string
          zoho_account_id: string | null
          zoho_contact_id: string | null
          zoho_deal_id: string | null
          zoho_lead_id: string | null
          zoho_referrer_contact_id: string | null
          zoho_sync_error: string | null
          zoho_sync_status: string | null
        }
        Insert: {
          avatar_url?: string | null
          company?: string | null
          created_at?: string
          email?: string | null
          first_name?: string | null
          full_name?: string | null
          id: string
          last_name?: string | null
          pending_referral_code?: string | null
          phone?: string | null
          referral_code?: string | null
          referred_by_user_id?: string | null
          updated_at?: string
          zoho_account_id?: string | null
          zoho_contact_id?: string | null
          zoho_deal_id?: string | null
          zoho_lead_id?: string | null
          zoho_referrer_contact_id?: string | null
          zoho_sync_error?: string | null
          zoho_sync_status?: string | null
        }
        Update: {
          avatar_url?: string | null
          company?: string | null
          created_at?: string
          email?: string | null
          first_name?: string | null
          full_name?: string | null
          id?: string
          last_name?: string | null
          pending_referral_code?: string | null
          phone?: string | null
          referral_code?: string | null
          referred_by_user_id?: string | null
          updated_at?: string
          zoho_account_id?: string | null
          zoho_contact_id?: string | null
          zoho_deal_id?: string | null
          zoho_lead_id?: string | null
          zoho_referrer_contact_id?: string | null
          zoho_sync_error?: string | null
          zoho_sync_status?: string | null
        }
        Relationships: []
      }
      razorpay_orders: {
        Row: {
          amount: number
          created_at: string
          currency: string
          id: string
          notes: Json | null
          plan_type: string
          razorpay_order_id: string
          receipt: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          id?: string
          notes?: Json | null
          plan_type: string
          razorpay_order_id: string
          receipt: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          id?: string
          notes?: Json | null
          plan_type?: string
          razorpay_order_id?: string
          receipt?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      razorpay_payments: {
        Row: {
          amount: number
          captured_at: string | null
          contact: string | null
          created_at: string
          currency: string
          email: string | null
          id: string
          method: string | null
          order_id: string
          razorpay_order_id: string
          razorpay_payment_id: string
          razorpay_signature: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          captured_at?: string | null
          contact?: string | null
          created_at?: string
          currency?: string
          email?: string | null
          id?: string
          method?: string | null
          order_id: string
          razorpay_order_id: string
          razorpay_payment_id: string
          razorpay_signature: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          captured_at?: string | null
          contact?: string | null
          created_at?: string
          currency?: string
          email?: string | null
          id?: string
          method?: string | null
          order_id?: string
          razorpay_order_id?: string
          razorpay_payment_id?: string
          razorpay_signature?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "razorpay_payments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "razorpay_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      user_achievements: {
        Row: {
          achievement_data: Json | null
          achievement_type: string
          created_at: string
          id: string
          points: number | null
          unlocked_at: string
          user_id: string
        }
        Insert: {
          achievement_data?: Json | null
          achievement_type: string
          created_at?: string
          id?: string
          points?: number | null
          unlocked_at?: string
          user_id: string
        }
        Update: {
          achievement_data?: Json | null
          achievement_type?: string
          created_at?: string
          id?: string
          points?: number | null
          unlocked_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_calculations: {
        Row: {
          calculation_type: string
          created_at: string
          id: string
          inputs: Json
          results: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          calculation_type?: string
          created_at?: string
          id?: string
          inputs: Json
          results?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          calculation_type?: string
          created_at?: string
          id?: string
          inputs?: Json
          results?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_memberships: {
        Row: {
          aum_verified: boolean | null
          created_at: string
          id: string
          payment_date: string | null
          payment_id: string | null
          razorpay_order_id: string | null
          subscription_status: string | null
          tier: Database["public"]["Enums"]["membership_tier"]
          updated_at: string
          upgraded_at: string | null
          user_id: string
        }
        Insert: {
          aum_verified?: boolean | null
          created_at?: string
          id?: string
          payment_date?: string | null
          payment_id?: string | null
          razorpay_order_id?: string | null
          subscription_status?: string | null
          tier?: Database["public"]["Enums"]["membership_tier"]
          updated_at?: string
          upgraded_at?: string | null
          user_id: string
        }
        Update: {
          aum_verified?: boolean | null
          created_at?: string
          id?: string
          payment_date?: string | null
          payment_id?: string | null
          razorpay_order_id?: string | null
          subscription_status?: string | null
          tier?: Database["public"]["Enums"]["membership_tier"]
          updated_at?: string
          upgraded_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_memberships_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "razorpay_payments"
            referencedColumns: ["id"]
          },
        ]
      }
      user_referrals: {
        Row: {
          created_at: string | null
          id: string
          referral_code_used: string | null
          referral_date: string | null
          referred_by_user_id: string | null
          status: string | null
          updated_at: string | null
          user_id: string
          zoho_contact_id: string | null
          zoho_lead_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          referral_code_used?: string | null
          referral_date?: string | null
          referred_by_user_id?: string | null
          status?: string | null
          updated_at?: string | null
          user_id: string
          zoho_contact_id?: string | null
          zoho_lead_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          referral_code_used?: string | null
          referral_date?: string | null
          referred_by_user_id?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
          zoho_contact_id?: string | null
          zoho_lead_id?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      zoho_conversion_failures: {
        Row: {
          created_at: string | null
          error_details: Json | null
          error_message: string
          id: string
          plan_amount: number
          plan_type: string
          resolved: boolean | null
          retry_count: number | null
          updated_at: string | null
          user_id: string
          zoho_lead_id: string
        }
        Insert: {
          created_at?: string | null
          error_details?: Json | null
          error_message: string
          id?: string
          plan_amount: number
          plan_type: string
          resolved?: boolean | null
          retry_count?: number | null
          updated_at?: string | null
          user_id: string
          zoho_lead_id: string
        }
        Update: {
          created_at?: string | null
          error_details?: Json | null
          error_message?: string
          id?: string
          plan_amount?: number
          plan_type?: string
          resolved?: boolean | null
          retry_count?: number | null
          updated_at?: string | null
          user_id?: string
          zoho_lead_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "zoho_conversion_failures_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_blog_post_ctas: {
        Args: { post_category?: string; post_id: string; post_tags?: string[] }
        Returns: {
          action_type: Database["public"]["Enums"]["cta_action_type"]
          action_url: string
          background_color: string
          background_image: string
          border_radius: string
          button_color: string
          button_hover_color: string
          button_text: string
          cta_id: string
          cta_name: string
          cta_type: Database["public"]["Enums"]["cta_type"]
          custom_css: string
          description: string
          display_condition: Database["public"]["Enums"]["cta_display_condition"]
          display_config: Json
          headline: string
          icon_name: string
          open_in_new_tab: boolean
          placement_position: Database["public"]["Enums"]["cta_placement_position"]
          position_config: Json
          priority: number
          size: string
          text_color: string
        }[]
      }
      get_current_user_role: {
        Args: never
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "super_admin" | "admin" | "user"
      cta_action_type:
        | "navigate_url"
        | "download_file"
        | "open_modal"
        | "submit_form"
        | "email_signup"
      cta_display_condition:
        | "always"
        | "time_based"
        | "scroll_percentage"
        | "exit_intent"
        | "mobile_only"
        | "desktop_only"
      cta_placement_position:
        | "top"
        | "mid_article"
        | "bottom"
        | "sidebar"
        | "between_paragraphs"
        | "custom"
        | "below_toc"
        | "inline_marker"
        | "middle_article"
      cta_type:
        | "button"
        | "banner"
        | "inline_text"
        | "card"
        | "popup"
        | "sidebar_widget"
      membership_tier: "free" | "premium" | "client"
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
      app_role: ["super_admin", "admin", "user"],
      cta_action_type: [
        "navigate_url",
        "download_file",
        "open_modal",
        "submit_form",
        "email_signup",
      ],
      cta_display_condition: [
        "always",
        "time_based",
        "scroll_percentage",
        "exit_intent",
        "mobile_only",
        "desktop_only",
      ],
      cta_placement_position: [
        "top",
        "mid_article",
        "bottom",
        "sidebar",
        "between_paragraphs",
        "custom",
        "below_toc",
        "inline_marker",
        "middle_article",
      ],
      cta_type: [
        "button",
        "banner",
        "inline_text",
        "card",
        "popup",
        "sidebar_widget",
      ],
      membership_tier: ["free", "premium", "client"],
    },
  },
} as const
