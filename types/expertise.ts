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

export interface ExpertiseData {
  expertiseAreas: ExpertiseArea[];
  certifications: Certification[];
  competitions: Competition[];
  books: Book[];
}
