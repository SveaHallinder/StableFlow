import { User as SupabaseUser } from '@supabase/supabase-js';

interface User extends SupabaseUser {
  avatar_url?: string;
  username?: string;
}

declare module '@supabase/supabase-js' {
  interface User extends SupabaseUser {
    avatar_url?: string;
    username?: string;
  }
}

export interface Post {
  id: string;
  likes?: Like[];
  my_likes?: Like[];
}

export interface Like {
  id: string;
  user_id: string;
  post_id: string;
  created_at: string;
} 