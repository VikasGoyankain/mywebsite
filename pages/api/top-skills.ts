import { NextApiRequest, NextApiResponse } from 'next';
import { SkillsDataService, SkillData } from '../../Skills/expertise-nexus-reveal/src/lib/redis';
import { unstable_noStore } from 'next/cache';

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
      const topSkills = await SkillsDataService.getTopSkills();
      return res.status(200).json(topSkills);
    }
    
    // PUT request - update the top skills list
    else if (req.method === 'PUT') {
      const { skillIds } = req.body;
      
      if (!skillIds || !Array.isArray(skillIds)) {
        return res.status(400).json({ error: 'Valid skillIds array is required' });
      }
      
      // Get all skills to filter out valid IDs
      const allSkills = await SkillsDataService.getSkills();
      const validSkills: SkillData[] = allSkills.filter(skill => skillIds.includes(skill.id));
      
      // Update the top skills
      await SkillsDataService.updateTopSkills(validSkills);
      
      return res.status(200).json({ 
        success: true, 
        message: `${validSkills.length} top skills updated successfully`,
        topSkills: validSkills
      });
    }
    
    // Handle unsupported methods
    else {
      res.setHeader('Allow', ['GET', 'PUT']);
      return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }
  } catch (error) {
    console.error('Error in top-skills API:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
} 