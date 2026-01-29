import { NextApiRequest, NextApiResponse } from 'next';
import { getSkills, setSkills } from '../../lib/expertise-nexus/redis';
import { unstable_noStore } from 'next/cache';

interface SkillData {
  id: string;
  name: string;
  level: number;
  category: string;
  description?: string;
}

// Validate API key for admin operations
const validateApiKey = (req: NextApiRequest): boolean => {
  const apiKey = req.query.apiKey || req.body?.apiKey;
  // In production, use a secure comparison
  return apiKey === process.env.NEXT_PUBLIC_ADMIN_API_KEY || apiKey === 'admin-secret-key-12345';
};

// Generate unique ID for new skills
const generateId = (): string => {
  return Math.random().toString(36).substring(2, 9);
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  unstable_noStore();
  
  // Basic authorization for admin operations
  if (!validateApiKey(req)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    // GET request - fetch all skills
    if (req.method === 'GET') {
      const skills = await getSkills();
      return res.status(200).json(skills);
    }
    
    // POST request - add a new skill
    if (req.method === 'POST') {
      const skillData = req.body as SkillData;
      
      if (!skillData.name || !skillData.level || !skillData.category) {
        return res.status(400).json({ error: 'Missing required fields' });
      }
      
      const skills = await getSkills() as SkillData[];
      const newSkill = {
        ...skillData,
        id: crypto.randomUUID()
      };
      
      await setSkills([...skills, newSkill]);
      return res.status(201).json(newSkill);
    }
    
    // PUT request - update a skill
    if (req.method === 'PUT') {
      const { id, ...updateData } = req.body as SkillData & { id: string };
      
      if (!id) {
        return res.status(400).json({ error: 'Skill ID is required' });
      }
      
      const skills = await getSkills() as SkillData[];
      const skillIndex = skills.findIndex(s => s.id === id);
      
      if (skillIndex === -1) {
        return res.status(404).json({ error: 'Skill not found' });
      }
      
      skills[skillIndex] = { ...skills[skillIndex], ...updateData };
      await setSkills(skills);
      
      return res.status(200).json(skills[skillIndex]);
    }
    
    // DELETE request - remove a skill
    if (req.method === 'DELETE') {
      const { id } = req.query;
      
      if (!id || typeof id !== 'string') {
        return res.status(400).json({ error: 'Valid skill ID is required' });
      }
      
      const skills = await getSkills() as SkillData[];
      const filteredSkills = skills.filter(s => s.id !== id);
      
      if (filteredSkills.length === skills.length) {
        return res.status(404).json({ error: 'Skill not found' });
      }
      
      await setSkills(filteredSkills);
      return res.status(200).json({ message: 'Skill deleted successfully' });
    }
    
    // Method not allowed
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Error in skills API:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 