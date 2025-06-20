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
  description?: string;
  content: string;
  author: string;
  timestamp: Date; // Assuming this is the creation date, if not, we'll add createdAt
  createdAt?: string | Date; // Added createdAt to match usage
  updatedAt?: string | Date;
  readTime?: string;
  tags: string[];
  media: Media[];
}