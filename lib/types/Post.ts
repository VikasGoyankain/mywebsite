export interface Comment {
  id: string;
  author: string;
  content: string;
  timestamp: Date;
}

export interface Media {
  id: string;
  type: 'image' | 'video';
  url: string;
  caption?: string;
  fileId?: string; // ImageKit file ID for cleanup
  post_id?: string; // Associated post ID (optional for drafts)
}

export interface Post {
  id: string;
  title?: string;
  description?: string;
  content: string;
  author: string;
  timestamp: Date; // Legacy support
  created_at?: string | Date;
  updated_at?: string | Date;
  readTime?: string;
  tags: string[];
  media: Media[];
}