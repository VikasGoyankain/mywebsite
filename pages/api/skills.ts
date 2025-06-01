import { NextApiRequest, NextApiResponse } from 'next';
import { SkillsDataService, SkillData } from '../../Skills/expertise-nexus-reveal/src/lib/redis';
import { unstable_noStore } from 'next/cache';

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
    // GET request - fetch all skills or a specific skill
    if (req.method === 'GET') {
      const skillId = req.query.id as string;
      const skills = await SkillsDataService.getSkills();
      
      if (skillId) {
        const skill = skills.find(s => s.id === skillId);
        if (!skill) {
          return res.status(404).json({ error: 'Skill not found' });
        }
        return res.status(200).json(skill);
      }
      
      return res.status(200).json(skills);
    }
    
    // POST request - create a new skill
    else if (req.method === 'POST') {
      const skills = await SkillsDataService.getSkills();
      const newSkill: SkillData = {
        ...req.body,
        id: generateId()
      };
      
      // Validate required fields
      if (!newSkill.name || !newSkill.category) {
        return res.status(400).json({ error: 'Name and category are required' });
      }
      
      // Add the new skill
      const updatedSkills = [...skills, newSkill];
      await SkillsDataService.updateSkills(updatedSkills);
      
      return res.status(201).json(newSkill);
    }
    
    // PUT request - update an existing skill
    else if (req.method === 'PUT') {
      const skillId = req.query.id as string;
      if (!skillId) {
        return res.status(400).json({ error: 'Skill ID is required' });
      }
      
      const skills = await SkillsDataService.getSkills();
      const skillIndex = skills.findIndex(s => s.id === skillId);
      
      if (skillIndex === -1) {
        return res.status(404).json({ error: 'Skill not found' });
      }
      
      // Update the skill
      const updatedSkill = {
        ...skills[skillIndex],
        ...req.body,
        id: skillId // Ensure the ID remains the same
      };
      
      skills[skillIndex] = updatedSkill;
      await SkillsDataService.updateSkills(skills);
      
      return res.status(200).json(updatedSkill);
    }
    
    // DELETE request - delete a skill
    else if (req.method === 'DELETE') {
      const skillId = req.query.id as string;
      if (!skillId) {
        return res.status(400).json({ error: 'Skill ID is required' });
      }
      
      const skills = await SkillsDataService.getSkills();
      const updatedSkills = skills.filter(s => s.id !== skillId);
      
      if (skills.length === updatedSkills.length) {
        return res.status(404).json({ error: 'Skill not found' });
      }
      
      await SkillsDataService.updateSkills(updatedSkills);
      return res.status(200).json({ success: true, message: 'Skill deleted successfully' });
    }
    
    // Handle unsupported methods
    else {
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
      return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }
  } catch (error) {
    console.error('Error in skills API:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
} 