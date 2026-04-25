export type PostType = 'text' | 'image' | 'confession' | 'story' | 'meme' | 'event' | 'admin';

export type Post = {
  id: string;
  created_at: string;
  type: PostType;
  content: string;
  image_url?: string;
  visitor_id: string;
  upvotes: number;
  downvotes: number;
  comment_count: number;
  is_pinned: boolean;
  is_admin_post: boolean;
  score: number;
};

export type Comment = {
  id: string;
  post_id: string;
  parent_id?: string;
  created_at: string;
  content: string;
  visitor_id: string;
};

export type Event = {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  poster_url?: string;
  is_pinned: boolean;
  created_at: string;
};
