import { NextApiRequest, NextApiResponse } from 'next';
import { SkillsDataService, SkillData, CertificateData } from '../../../Skills/expertise-nexus-reveal/src/lib/redis';

// Example skills data
const exampleSkills: SkillData[] = [
  {
    id: 'contract-law',
    name: 'Contract Law',
    category: 'Legal',
    proficiency: 95,
    experience: '8+ years',
    icon: '📋',
    subSkills: ['Commercial Contracts', 'Employment Law', 'IP Licensing', 'M&A Agreements'],
    books: ['Contract Law by Ewan McKendrick', 'The Law of Contract by John Cartwright'],
    achievements: ['Successfully negotiated 200+ contracts', 'Zero contract disputes in 3 years'],
    tools: ['LegalZoom', 'DocuSign', 'ContractWorks', 'Ironclad']
  },
  {
    id: 'corporate-law',
    name: 'Corporate Law',
    category: 'Legal',
    proficiency: 90,
    experience: '6+ years',
    icon: '🏢',
    subSkills: ['Corporate Governance', 'Securities Law', 'Compliance', 'Risk Management'],
    books: ['Principles of Corporate Finance', 'Corporate Law by Stephen Bainbridge'],
    achievements: ['Led 15 IPO processes', 'Advised Fortune 500 companies'],
    tools: ['CapTable.io', 'Carta', 'Workiva', 'Thomson Reuters']
  },
  {
    id: 'web-development',
    name: 'Web Development',
    category: 'Technical',
    proficiency: 92,
    experience: '5+ years',
    icon: '🌐',
    subSkills: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'AWS'],
    books: ['Clean Code', 'System Design Interview', 'You Don\'t Know JS'],
    achievements: ['Built 50+ web applications', 'Led development team of 8'],
    tools: ['VS Code', 'Docker', 'Kubernetes', 'Jenkins', 'Figma']
  },
  {
    id: 'data-analysis',
    name: 'Data Analysis',
    category: 'Technical',
    proficiency: 88,
    experience: '4+ years',
    icon: '📊',
    subSkills: ['Python', 'SQL', 'Tableau', 'Machine Learning', 'Statistics'],
    books: ['Python for Data Analysis', 'The Elements of Statistical Learning'],
    achievements: ['Increased efficiency by 40%', 'Built predictive models'],
    tools: ['Jupyter', 'Pandas', 'Scikit-learn', 'TensorFlow', 'PowerBI']
  },
  {
    id: 'leadership',
    name: 'Leadership',
    category: 'Social',
    proficiency: 94,
    experience: '7+ years',
    icon: '👑',
    subSkills: ['Team Management', 'Strategic Planning', 'Conflict Resolution', 'Mentoring'],
    books: ['Good to Great', 'The 7 Habits of Highly Effective People'],
    achievements: ['Managed teams of 20+', 'Improved retention by 30%'],
    tools: ['Slack', 'Asana', 'Monday.com', 'Zoom', 'Microsoft Teams']
  },
  {
    id: 'communication',
    name: 'Communication',
    category: 'Social',
    proficiency: 91,
    experience: '10+ years',
    icon: '🗣️',
    subSkills: ['Public Speaking', 'Technical Writing', 'Presentation Design', 'Cross-cultural'],
    books: ['Made to Stick', 'The Pyramid Principle', 'Crucial Conversations'],
    achievements: ['Delivered 100+ presentations', 'Published 25 articles'],
    tools: ['PowerPoint', 'Canva', 'Grammarly', 'Loom', 'Notion']
  },
  {
    id: 'policy-analysis',
    name: 'Policy Analysis',
    category: 'Policy',
    proficiency: 89,
    experience: '6+ years',
    icon: '📜',
    subSkills: ['Legislative Review', 'Impact Assessment', 'Public Consultation', 'Research'],
    books: ['Policy Paradox', 'A Practical Guide for Policy Analysis'],
    achievements: ['Contributed to 15+ major policy reforms', 'Published policy papers'],
    tools: ['SPSS', 'Stata', 'NVivo', 'Survey Tools']
  },
  {
    id: 'academic-research',
    name: 'Academic Research',
    category: 'Research',
    proficiency: 93,
    experience: '8+ years',
    icon: '🎓',
    subSkills: ['Quantitative Methods', 'Qualitative Research', 'Literature Review', 'Research Design'],
    books: ['Research Design', 'The Craft of Research'],
    achievements: ['Published in top journals', 'Research cited 200+ times'],
    tools: ['Scopus', 'Web of Science', 'MAXQDA', 'EndNote']
  }
];

// Example certificates
const exampleCertificates: CertificateData[] = [
  {
    id: '1',
    title: 'AWS Solutions Architect',
    issuer: 'Amazon Web Services',
    date: '2024-03-15',
    tags: ['AWS', 'Cloud', 'Architecture'],
    imageUrl: '/placeholder.svg'
  },
  {
    id: '2',
    title: 'Legal Tech Certification',
    issuer: 'Stanford Law School',
    date: '2024-01-20',
    tags: ['Legal', 'Technology', 'Innovation'],
    imageUrl: '/placeholder.svg'
  },
  {
    id: '3',
    title: 'Project Management Professional',
    issuer: 'PMI',
    date: '2023-11-10',
    tags: ['Management', 'Leadership', 'Agile'],
    imageUrl: '/placeholder.svg'
  },
  {
    id: '4',
    title: 'Data Science Certification',
    issuer: 'MIT',
    date: '2023-09-05',
    tags: ['Data Science', 'Python', 'ML'],
    imageUrl: '/placeholder.svg'
  }
];

// Validate API key for admin operations
const validateApiKey = (req: NextApiRequest): boolean => {
  const apiKey = req.query.apiKey || req.body?.apiKey;
  return apiKey === process.env.NEXT_PUBLIC_ADMIN_API_KEY || apiKey === 'admin-secret-key-12345';
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Basic authorization for admin operations
  if (!validateApiKey(req)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    // Check if data already exists
    const existingSkills = await SkillsDataService.getSkills();
    const existingCertificates = await SkillsDataService.getCertificates();
    
    if (existingSkills && existingSkills.length > 0) {
      return res.status(200).json({ 
        success: true, 
        message: 'Skills data already exists. Use admin panel to manage skills.', 
        count: existingSkills.length 
      });
    }
    
    // Initialize Redis with example skills and certificates
    await SkillsDataService.updateSkills(exampleSkills);
    await SkillsDataService.updateCertificates(exampleCertificates);
    
    // Set top skills to be the highest proficiency skills
    const sortedSkills = [...exampleSkills].sort((a, b) => b.proficiency - a.proficiency);
    await SkillsDataService.updateTopSkills(sortedSkills.slice(0, 8));
    
    return res.status(200).json({ 
      success: true, 
      message: 'Successfully initialized Redis with example skills and certificates',
      skillsCount: exampleSkills.length,
      certificatesCount: exampleCertificates.length
    });
  } catch (error) {
    console.error('Error initializing Redis with example data:', error);
    return res.status(500).json({ error: 'Failed to initialize Redis with example data' });
  }
} 