export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      cars: {
        Row: {
          id: string
          created_at?: string
          name?: string
          brand?: string
          make?: string
          model?: string
          year?: number
          price_per_day?: number
          daily_rate?: number
          images?: string[]
          image_url?: string
          specs?: Json
          description?: string
          available?: boolean
          category_id?: string
        }
        Insert: {
          id?: string
          created_at?: string
          name?: string
          brand?: string
          make?: string
          model?: string
          year?: number
          price_per_day?: number
          daily_rate?: number
          images?: string[]
          image_url?: string
          specs?: Json
          description?: string
          available?: boolean
          category_id?: string
        }
        Update: {
          id?: string
          created_at?: string
          name?: string
          brand?: string
          make?: string
          model?: string
          year?: number
          price_per_day?: number
          daily_rate?: number
          images?: string[]
          image_url?: string
          specs?: Json
          description?: string
          available?: boolean
          category_id?: string
        }
      }
      categories: {
        Row: {
          id: string
          created_at?: string
          name: string
          slug: string
          description?: string
          image_url?: string
        }
        Insert: {
          id?: string
          created_at?: string
          name: string
          slug: string
          description?: string
          image_url?: string
        }
        Update: {
          id?: string
          created_at?: string
          name?: string
          slug?: string
          description?: string
          image_url?: string
        }
      }
      reviews: {
        Row: {
          id: string
          created_at?: string
          user_id: string
          car_id: string
          rating: number
          comment?: string
        }
        Insert: {
          id?: string
          created_at?: string
          user_id: string
          car_id: string
          rating: number
          comment?: string
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string
          car_id?: string
          rating?: number
          comment?: string
        }
      }
      users: {
        Row: {
          id: string
          created_at?: string
          email: string
          full_name?: string
          avatar_url?: string
        }
        Insert: {
          id?: string
          created_at?: string
          email: string
          full_name?: string
          avatar_url?: string
        }
        Update: {
          id?: string
          created_at?: string
          email?: string
          full_name?: string
          avatar_url?: string
        }
      }
    }
  }
}
