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
}

export interface Post {
  id: string;
  title?: string;
  content: string;
  author: string;
  timestamp: Date;
  tags: string[];
  media: Media[];
}