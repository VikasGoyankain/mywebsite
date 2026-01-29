import { NextApiRequest, NextApiResponse } from 'next';
import { getCertificates, setCertificates } from '../../lib/expertise-nexus/redis';
import { unstable_noStore } from 'next/cache';

interface CertificateData {
  id: string;
  name: string;
  issuer: string;
  date: string;
  url?: string;
  description?: string;
}

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
    // GET request - fetch all certificates
    if (req.method === 'GET') {
      const certificates = await getCertificates();
      return res.status(200).json(certificates);
    }
    
    // POST request - add a new certificate
    if (req.method === 'POST') {
      const certData = req.body as CertificateData;
      
      if (!certData.name || !certData.issuer || !certData.date) {
        return res.status(400).json({ error: 'Missing required fields' });
      }
      
      const certificates = await getCertificates() as CertificateData[];
      const newCert = {
        ...certData,
        id: crypto.randomUUID()
      };
      
      await setCertificates([...certificates, newCert]);
      return res.status(201).json(newCert);
    }
    
    // PUT request - update a certificate
    if (req.method === 'PUT') {
      const { id, ...updateData } = req.body as CertificateData & { id: string };
      
      if (!id) {
        return res.status(400).json({ error: 'Certificate ID is required' });
      }
      
      const certificates = await getCertificates() as CertificateData[];
      const certIndex = certificates.findIndex(c => c.id === id);
      
      if (certIndex === -1) {
        return res.status(404).json({ error: 'Certificate not found' });
      }
      
      certificates[certIndex] = { ...certificates[certIndex], ...updateData };
      await setCertificates(certificates);
      
      return res.status(200).json(certificates[certIndex]);
    }
    
    // DELETE request - remove a certificate
    if (req.method === 'DELETE') {
      const { id } = req.query;
      
      if (!id || typeof id !== 'string') {
        return res.status(400).json({ error: 'Valid certificate ID is required' });
      }
      
      const certificates = await getCertificates() as CertificateData[];
      const filteredCerts = certificates.filter(c => c.id !== id);
      
      if (filteredCerts.length === certificates.length) {
        return res.status(404).json({ error: 'Certificate not found' });
      }
      
      await setCertificates(filteredCerts);
      return res.status(200).json({ message: 'Certificate deleted successfully' });
    }
    
    // Method not allowed
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Error in certificates API:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 