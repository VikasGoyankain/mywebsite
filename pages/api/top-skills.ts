import { NextApiRequest, NextApiResponse } from 'next';
import { getTopSkills, setTopSkills, getSkills } from '../../lib/expertise-nexus/redis';
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
  return apiKey === process.env.NEXT_PUBLIC_ADMIN_API_KEY || apiKey === 'admin-secret-key-12345';
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  unstable_noStore();
  
  // Basic authorization
  if (!validateApiKey(req)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    // GET request - fetch all top skills
    if (req.method === 'GET') {
      const topSkills = await getTopSkills();
      return res.status(200).json(topSkills);
    }
    
    // PUT request - update top skills
    if (req.method === 'PUT') {
      const { skillIds } = req.body;
      
      if (!Array.isArray(skillIds)) {
        return res.status(400).json({ error: 'Invalid request body. Expected an array of skill IDs.' });
      }
      
      // Get all skills to filter out valid IDs
      const allSkills = await getSkills() as SkillData[];
      const validSkills = allSkills.filter((skill: SkillData) => skillIds.includes(skill.id));
      
      // Update the top skills
      await setTopSkills(validSkills);
      
      return res.status(200).json({ 
        message: 'Top skills updated successfully',
        updatedSkills: validSkills 
      });
    }
    
    // Method not allowed
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Error in top-skills API:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 