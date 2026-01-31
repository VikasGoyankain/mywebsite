import type { ExpertiseData, ExpertiseArea, Certification, Competition, Book } from '@/types/expertise';

const STORAGE_KEY = 'expertise_data';
const ADMIN_KEY = 'admin_authenticated';

const getDefaultData = (): ExpertiseData => ({
  expertiseAreas: [
    {
      id: '1',
      name: 'Legal Research',
      descriptor: 'Systematic analysis of case law, statutes, and regulatory frameworks',
      competencyNote: 'Years of practice navigating complex legal databases and synthesizing findings into actionable insights.',
      linkedCertifications: ['1'],
      linkedCompetitions: ['1'],
      linkedBooks: ['1'],
      order: 0,
      createdAt: new Date().toISOString(),
    },
    {
      id: '2',
      name: 'Technical Writing',
      descriptor: 'Clear communication of complex technical concepts',
      competencyNote: 'Translating specialized knowledge into accessible documentation for diverse audiences.',
      linkedCertifications: [],
      linkedCompetitions: [],
      linkedBooks: ['2'],
      order: 1,
      createdAt: new Date().toISOString(),
    },
  ],
  certifications: [
    {
      id: '1',
      name: 'Westlaw Certification',
      issuingBody: 'Thomson Reuters',
      dateEarned: '2023-06',
      verificationLink: '',
      relevanceNote: 'Advanced legal research methodology and database navigation.',
      order: 0,
      createdAt: new Date().toISOString(),
    },
  ],
  competitions: [
    {
      id: '1',
      name: 'National Moot Court',
      year: '2023',
      role: 'Lead Researcher',
      teamContext: 'Four-person team representing the university',
      outcome: 'Quarter-finalist',
      keyLearning: 'Learned to synthesize complex arguments under extreme time pressure.',
      order: 0,
      createdAt: new Date().toISOString(),
    },
  ],
  books: [
    {
      id: '1',
      title: 'Thinking, Fast and Slow',
      author: 'Daniel Kahneman',
      commentary: 'A foundational text on cognitive biases and decision-making frameworks.',
      impactOnThinking: 'Changed how I approach evidence evaluation and argument construction.',
      order: 0,
      createdAt: new Date().toISOString(),
    },
    {
      id: '2',
      title: 'The Elements of Style',
      author: 'Strunk & White',
      commentary: 'The essential guide to clear, economical prose.',
      impactOnThinking: 'Reinforced the discipline of saying more with less.',
      order: 1,
      createdAt: new Date().toISOString(),
    },
  ],
});

export const getData = (): ExpertiseData => {
  if (typeof window === 'undefined') return getDefaultData();
  
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    const defaultData = getDefaultData();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultData));
    return defaultData;
  }
  return JSON.parse(stored);
};

export const saveData = (data: ExpertiseData): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }
};

// Generic CRUD helpers
const generateId = () => Math.random().toString(36).substring(2, 15);

export const addItem = <T extends { id: string; order: number; createdAt: string }>(
  key: keyof ExpertiseData,
  item: Omit<T, 'id' | 'order' | 'createdAt'>
): T => {
  const data = getData();
  const items = data[key] as unknown as T[];
  const newItem = {
    ...item,
    id: generateId(),
    order: items.length,
    createdAt: new Date().toISOString(),
  } as T;
  (data[key] as unknown as T[]) = [...items, newItem];
  saveData(data);
  return newItem;
};

export const updateItem = <T extends { id: string }>(
  key: keyof ExpertiseData,
  id: string,
  updates: Partial<T>
): void => {
  const data = getData();
  const items = data[key] as unknown as T[];
  const index = items.findIndex((item) => item.id === id);
  if (index !== -1) {
    items[index] = { ...items[index], ...updates };
    saveData(data);
  }
};

export const deleteItem = <T extends { id: string }>(
  key: keyof ExpertiseData,
  id: string
): void => {
  const data = getData();
  const items = data[key] as unknown as T[];
  (data[key] as unknown as T[]) = items.filter((item) => item.id !== id);
  saveData(data);
};

export const reorderItems = <T extends { id: string; order: number }>(
  key: keyof ExpertiseData,
  orderedIds: string[]
): void => {
  const data = getData();
  const items = data[key] as unknown as T[];
  const reordered = orderedIds
    .map((id, index) => {
      const item = items.find((i) => i.id === id);
      return item ? { ...item, order: index } : null;
    })
    .filter(Boolean) as T[];
  (data[key] as unknown as T[]) = reordered;
  saveData(data);
};

// Simple admin auth (client-side only - for casual protection)
export const isAdminAuthenticated = (): boolean => {
  if (typeof window === 'undefined') return false;
  return sessionStorage.getItem(ADMIN_KEY) === 'true';
};

export const authenticateAdmin = (password: string): boolean => {
  if (typeof window === 'undefined') return false;
  // Default password - user should change this
  const storedPassword = localStorage.getItem('admin_password') || 'expertise2024';
  if (password === storedPassword) {
    sessionStorage.setItem(ADMIN_KEY, 'true');
    return true;
  }
  return false;
};

export const logoutAdmin = (): void => {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem(ADMIN_KEY);
  }
};

export const setAdminPassword = (newPassword: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('admin_password', newPassword);
  }
};
