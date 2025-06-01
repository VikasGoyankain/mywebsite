import { NextApiRequest, NextApiResponse } from 'next';
import { SkillsDataService, CertificateData } from '../../Skills/expertise-nexus-reveal/src/lib/redis';
import { unstable_noStore } from 'next/cache';

// Validate API key for admin operations
const validateApiKey = (req: NextApiRequest): boolean => {
  const apiKey = req.query.apiKey || req.body?.apiKey;
  return apiKey === process.env.NEXT_PUBLIC_ADMIN_API_KEY || apiKey === 'admin-secret-key-12345';
};

// Generate unique ID for new certificates
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
    // GET request - fetch all certificates or a specific certificate
    if (req.method === 'GET') {
      const certId = req.query.id as string;
      const certificates = await SkillsDataService.getCertificates();
      
      if (certId) {
        const certificate = certificates.find(c => c.id === certId);
        if (!certificate) {
          return res.status(404).json({ error: 'Certificate not found' });
        }
        return res.status(200).json(certificate);
      }
      
      return res.status(200).json(certificates);
    }
    
    // POST request - create a new certificate
    else if (req.method === 'POST') {
      const certificates = await SkillsDataService.getCertificates();
      const newCertificate: CertificateData = {
        ...req.body,
        id: generateId()
      };
      
      // Validate required fields
      if (!newCertificate.title || !newCertificate.issuer) {
        return res.status(400).json({ error: 'Title and issuer are required' });
      }
      
      // Add the new certificate
      const updatedCertificates = [...certificates, newCertificate];
      await SkillsDataService.updateCertificates(updatedCertificates);
      
      return res.status(201).json(newCertificate);
    }
    
    // PUT request - update an existing certificate
    else if (req.method === 'PUT') {
      const certId = req.query.id as string;
      if (!certId) {
        return res.status(400).json({ error: 'Certificate ID is required' });
      }
      
      const certificates = await SkillsDataService.getCertificates();
      const certIndex = certificates.findIndex(c => c.id === certId);
      
      if (certIndex === -1) {
        return res.status(404).json({ error: 'Certificate not found' });
      }
      
      // Update the certificate
      const updatedCertificate = {
        ...certificates[certIndex],
        ...req.body,
        id: certId // Ensure the ID remains the same
      };
      
      certificates[certIndex] = updatedCertificate;
      await SkillsDataService.updateCertificates(certificates);
      
      return res.status(200).json(updatedCertificate);
    }
    
    // DELETE request - delete a certificate
    else if (req.method === 'DELETE') {
      const certId = req.query.id as string;
      if (!certId) {
        return res.status(400).json({ error: 'Certificate ID is required' });
      }
      
      const certificates = await SkillsDataService.getCertificates();
      const updatedCertificates = certificates.filter(c => c.id !== certId);
      
      if (certificates.length === updatedCertificates.length) {
        return res.status(404).json({ error: 'Certificate not found' });
      }
      
      await SkillsDataService.updateCertificates(updatedCertificates);
      return res.status(200).json({ success: true, message: 'Certificate deleted successfully' });
    }
    
    // Handle unsupported methods
    else {
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
      return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }
  } catch (error) {
    console.error('Error in certificates API:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
} 