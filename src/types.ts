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

export interface ProfileData {
  username: string;
  horse: string;
  ridingDays: string;
  initials: string;
} 