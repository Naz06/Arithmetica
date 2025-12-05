export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = 'tutor' | 'student' | 'parent';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          name: string;
          role: UserRole;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          name: string;
          role: UserRole;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          role?: UserRole;
          avatar_url?: string | null;
          updated_at?: string;
        };
      };
      students: {
        Row: {
          id: string;
          user_id: string;
          tutor_id: string;
          year_group: string;
          subjects: string[];
          overall_progress: number;
          total_points: number;
          current_streak: number;
          avatar_items: Json;
          achievements: string[];
          strengths: string[];
          weaknesses: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          tutor_id: string;
          year_group: string;
          subjects: string[];
          overall_progress?: number;
          total_points?: number;
          current_streak?: number;
          avatar_items?: Json;
          achievements?: string[];
          strengths?: string[];
          weaknesses?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          year_group?: string;
          subjects?: string[];
          overall_progress?: number;
          total_points?: number;
          current_streak?: number;
          avatar_items?: Json;
          achievements?: string[];
          strengths?: string[];
          weaknesses?: string[];
          updated_at?: string;
        };
      };
      parents: {
        Row: {
          id: string;
          user_id: string;
          student_ids: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          student_ids: string[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          student_ids?: string[];
          updated_at?: string;
        };
      };
      lessons: {
        Row: {
          id: string;
          tutor_id: string;
          student_id: string;
          subject: string;
          topic: string;
          date: string;
          start_time: string;
          end_time: string;
          status: 'scheduled' | 'completed' | 'cancelled';
          notes: string | null;
          score: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tutor_id: string;
          student_id: string;
          subject: string;
          topic: string;
          date: string;
          start_time: string;
          end_time: string;
          status?: 'scheduled' | 'completed' | 'cancelled';
          notes?: string | null;
          score?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          subject?: string;
          topic?: string;
          date?: string;
          start_time?: string;
          end_time?: string;
          status?: 'scheduled' | 'completed' | 'cancelled';
          notes?: string | null;
          score?: number | null;
          updated_at?: string;
        };
      };
      messages: {
        Row: {
          id: string;
          sender_id: string;
          recipient_id: string;
          content: string;
          read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          sender_id: string;
          recipient_id: string;
          content: string;
          read?: boolean;
          created_at?: string;
        };
        Update: {
          read?: boolean;
        };
      };
      resources: {
        Row: {
          id: string;
          tutor_id: string;
          title: string;
          description: string;
          type: 'pdf' | 'video' | 'link' | 'document';
          url: string;
          subject: string;
          year_group: string;
          assigned_to: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tutor_id: string;
          title: string;
          description: string;
          type: 'pdf' | 'video' | 'link' | 'document';
          url: string;
          subject: string;
          year_group: string;
          assigned_to?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          title?: string;
          description?: string;
          type?: 'pdf' | 'video' | 'link' | 'document';
          url?: string;
          subject?: string;
          year_group?: string;
          assigned_to?: string[];
          updated_at?: string;
        };
      };
      assessments: {
        Row: {
          id: string;
          tutor_id: string;
          student_id: string;
          subject: string;
          title: string;
          score: number;
          max_score: number;
          date: string;
          feedback: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          tutor_id: string;
          student_id: string;
          subject: string;
          title: string;
          score: number;
          max_score: number;
          date: string;
          feedback?: string | null;
          created_at?: string;
        };
        Update: {
          subject?: string;
          title?: string;
          score?: number;
          max_score?: number;
          date?: string;
          feedback?: string | null;
        };
      };
      shop_items: {
        Row: {
          id: string;
          name: string;
          description: string;
          category: 'hair' | 'outfit' | 'accessory' | 'background' | 'special';
          price: number;
          image_url: string;
          rarity: 'common' | 'rare' | 'epic' | 'legendary';
          available: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description: string;
          category: 'hair' | 'outfit' | 'accessory' | 'background' | 'special';
          price: number;
          image_url: string;
          rarity?: 'common' | 'rare' | 'epic' | 'legendary';
          available?: boolean;
          created_at?: string;
        };
        Update: {
          name?: string;
          description?: string;
          category?: 'hair' | 'outfit' | 'accessory' | 'background' | 'special';
          price?: number;
          image_url?: string;
          rarity?: 'common' | 'rare' | 'epic' | 'legendary';
          available?: boolean;
        };
      };
      student_purchases: {
        Row: {
          id: string;
          student_id: string;
          item_id: string;
          purchased_at: string;
        };
        Insert: {
          id?: string;
          student_id: string;
          item_id: string;
          purchased_at?: string;
        };
        Update: never;
      };
      achievements: {
        Row: {
          id: string;
          name: string;
          description: string;
          icon: string;
          requirement_type: string;
          requirement_value: number;
          points_reward: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description: string;
          icon: string;
          requirement_type: string;
          requirement_value: number;
          points_reward: number;
          created_at?: string;
        };
        Update: {
          name?: string;
          description?: string;
          icon?: string;
          requirement_type?: string;
          requirement_value?: number;
          points_reward?: number;
        };
      };
      feature_settings: {
        Row: {
          id: string;
          tutor_id: string;
          feature_name: string;
          enabled: boolean;
          settings: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tutor_id: string;
          feature_name: string;
          enabled?: boolean;
          settings?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          enabled?: boolean;
          settings?: Json;
          updated_at?: string;
        };
      };
      student_feature_overrides: {
        Row: {
          id: string;
          student_id: string;
          feature_name: string;
          enabled: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          student_id: string;
          feature_name: string;
          enabled: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          enabled?: boolean;
          updated_at?: string;
        };
      };
      progress_history: {
        Row: {
          id: string;
          student_id: string;
          subject: string;
          score: number;
          date: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          student_id: string;
          subject: string;
          score: number;
          date: string;
          created_at?: string;
        };
        Update: never;
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      user_role: UserRole;
    };
  };
}

// Helper types for easier usage
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Student = Database['public']['Tables']['students']['Row'];
export type Parent = Database['public']['Tables']['parents']['Row'];
export type Lesson = Database['public']['Tables']['lessons']['Row'];
export type Message = Database['public']['Tables']['messages']['Row'];
export type Resource = Database['public']['Tables']['resources']['Row'];
export type Assessment = Database['public']['Tables']['assessments']['Row'];
export type ShopItem = Database['public']['Tables']['shop_items']['Row'];
export type Achievement = Database['public']['Tables']['achievements']['Row'];
export type FeatureSetting = Database['public']['Tables']['feature_settings']['Row'];
export type ProgressHistory = Database['public']['Tables']['progress_history']['Row'];
