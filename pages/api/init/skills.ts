import { NextApiRequest, NextApiResponse } from 'next';
import { setSkills, setCertificates } from '../../../lib/expertise-nexus/redis';

interface SkillData {
  id: string;
  name: string;
  level: number;
  category: string;
  description?: string;
}

interface CertificateData {
  id: string;
  name: string;
  issuer: string;
  date: string;
  url?: string;
  description?: string;
}

const initialSkills: SkillData[] = [
  {
    id: '1',
    name: 'React',
    level: 90,
    category: 'Frontend',
    description: 'Advanced React development with hooks, context, and state management'
  },
  {
    id: '2',
    name: 'TypeScript',
    level: 85,
    category: 'Language',
    description: 'Strong typing and modern JavaScript features'
  },
  {
    id: '3',
    name: 'Node.js',
    level: 80,
    category: 'Backend',
    description: 'Server-side JavaScript development'
  }
];

const initialCertificates: CertificateData[] = [
  {
    id: '1',
    name: 'AWS Certified Developer - Associate',
    issuer: 'Amazon Web Services',
    date: '2023-12-01',
    url: 'https://www.credly.com/badges/example',
    description: 'Cloud development and deployment on AWS'
  },
  {
    id: '2',
    name: 'Professional Scrum Master I',
    issuer: 'Scrum.org',
    date: '2023-06-15',
    description: 'Agile project management and Scrum methodology'
  }
];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    // Initialize skills
    await setSkills(initialSkills);
    
    // Initialize certificates
    await setCertificates(initialCertificates);
    
    return res.status(200).json({
      message: 'Skills and certificates initialized successfully',
      skills: initialSkills,
      certificates: initialCertificates
    });
  } catch (error) {
    console.error('Error initializing data:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 