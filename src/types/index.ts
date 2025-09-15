export interface User {
  id: number;
  email: string;
  password: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface Role {
  id: number;
  name: string;
  description?: string;
  created_at: string;
}

export interface UserRole {
  user_id: number;
  role_id: number;
  assigned_at: string;
}

export interface Photo {
  id: number;
  user_id: number;
  title: string;
  description?: string;
  filename: string;
  url: string;
  is_standalone: boolean;
  created_at: string;
}

export interface Post {
  id: number;
  user_id: number;
  title: string;
  content?: string;
  created_at: string;
  updated_at: string;
  user_name?: string;
  photos?: Photo[];
  comments?: Comment[];
}

export interface PostPhoto {
  post_id: number;
  photo_id: number;
  display_order: number;
  created_at: string;
}

export interface Comment {
  id: number;
  post_id: number;
  user_id: number;
  content: string;
  created_at: string;
  user_name?: string;
}

export interface Env {
  Bindings: {
    DB: D1Database;
    BUCKET: R2Bucket;
    JWT_SECRET: string;
  };
  Variables: {
    user: any;
  };
}