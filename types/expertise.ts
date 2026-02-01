export interface ExpertiseArea {
  id: string;
  name: string;
  descriptor: string;
  competencyNote: string;
  linkedCertifications: string[];
  linkedCompetitions: string[];
  linkedBooks: string[];
  order: number;
  createdAt: string;
}

export interface Certification {
  id: string;
  name: string;
  issuingBody: string;
  dateEarned: string;
  verificationLink?: string;
  relevanceNote: string;
  order: number;
  createdAt: string;
}

export interface Competition {
  id: string;
  name: string;
  year: string;
  role: string;
  teamContext?: string;
  outcome: string;
  keyLearning: string;
  order: number;
  createdAt: string;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  commentary: string;
  impactOnThinking: string;
  order: number;
  createdAt: string;
}

// New ReadingItem type for books and courses with rich notes
export type ReadingType = 'book' | 'course';

export interface ReadingItem {
  id: string;
  slug: string;
  title: string;
  author: string;
  type: ReadingType;
  imageUrl?: string; // Optional cover image URL (stored on ImageKit CDN)
  impactOnThinking: string; // Displayed on cards - how it changed your life
  notes: string; // Rich HTML content from editor - full notes/learnings
  // Course-specific fields (optional)
  platform?: string; // e.g., Coursera, Udemy, etc.
  duration?: string; // e.g., "8 weeks", "40 hours"
  completionDate?: string; // ISO date string
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateReadingInput {
  title: string;
  author: string;
  type: ReadingType;
  imageUrl?: string;
  impactOnThinking: string;
  notes?: string;
  platform?: string;
  duration?: string;
  completionDate?: string;
  order?: number;
  slug?: string;
}

export interface UpdateReadingInput {
  title?: string;
  author?: string;
  type?: ReadingType;
  imageUrl?: string;
  impactOnThinking?: string;
  notes?: string;
  platform?: string;
  duration?: string;
  completionDate?: string;
  order?: number;
  slug?: string;
}

export interface ExpertiseData {
  expertiseAreas: ExpertiseArea[];
  certifications: Certification[];
  competitions: Competition[];
  books: Book[];
}
