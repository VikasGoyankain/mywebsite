export interface Comment {
  id: string;
  author: string;
  content: string;
  timestamp: Date;
}

export interface Post {
  id: string;
  type: 'text' | 'image' | 'video';
  title?: string;
  content: string;
  author: string;
  timestamp: Date;
  tags: string[];
  comments: Comment[];
  imageUrl?: string;
  videoUrl?: string;
}