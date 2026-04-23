import redis from '@/lib/redis';
import type { Certification } from '@/types/expertise';

const REDIS_KEY = 'expertise:certifications:all';
const REDIS_IDS_KEY = 'expertise:certifications:ids';

export async function getAllCertifications(): Promise<Certification[]> {
  try {
    const data = await redis.hgetall(REDIS_KEY);
    if (!data || Object.keys(data).length === 0) return [];
    
    const certifications = Object.values(data).map(item => {
      // Upstash may return already-parsed objects or strings
      if (typeof item === 'string') {
        return JSON.parse(item) as Certification;
      }
      return item as Certification;
    });
    return certifications.sort((a, b) => a.order - b.order);
  } catch (error) {
    console.error('Error fetching certifications:', error);
    return [];
  }
}

export async function getCertificationById(id: string): Promise<Certification | null> {
  try {
    const data = await redis.hget(REDIS_KEY, id);
    if (!data) return null;
    // Upstash may return already-parsed object or string
    if (typeof data === 'string') {
      return JSON.parse(data) as Certification;
    }
    return data as Certification;
  } catch (error) {
    console.error('Error fetching certification:', error);
    return null;
  }
}

export async function createCertification(
  certification: Omit<Certification, 'id' | 'createdAt'>,
  preserveId?: string
): Promise<Certification> {
  try {
    const id = preserveId || `cert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newCertification: Certification = {
      ...certification,
      id,
      createdAt: new Date().toISOString(),
    };

    await redis.hset(REDIS_KEY, { [id]: JSON.stringify(newCertification) });
    await redis.sadd(REDIS_IDS_KEY, id);

    return newCertification;
  } catch (error) {
    console.error('Error creating certification:', error);
    throw new Error('Failed to create certification');
  }
}

export async function updateCertification(
  id: string,
  updates: Partial<Omit<Certification, 'id' | 'createdAt'>>
): Promise<Certification | null> {
  try {
    const existing = await getCertificationById(id);
    if (!existing) return null;

    const updated: Certification = {
      ...existing,
      ...updates,
    };

    await redis.hset(REDIS_KEY, { [id]: JSON.stringify(updated) });
    return updated;
  } catch (error) {
    console.error('Error updating certification:', error);
    throw new Error('Failed to update certification');
  }
}

export async function deleteCertification(id: string): Promise<boolean> {
  try {
    await redis.hdel(REDIS_KEY, id);
    await redis.srem(REDIS_IDS_KEY, id);
    return true;
  } catch (error) {
    console.error('Error deleting certification:', error);
    throw new Error('Failed to delete certification');
  }
}

export async function reorderCertifications(orderedIds: string[]): Promise<void> {
  try {
    const certifications = await getAllCertifications();
    const updates: Record<string, string> = {};

    for (let i = 0; i < orderedIds.length; i++) {
      const cert = certifications.find(c => c.id === orderedIds[i]);
      if (cert) {
        cert.order = i;
        updates[cert.id] = JSON.stringify(cert);
      }
    }

    if (Object.keys(updates).length > 0) {
      await redis.hset(REDIS_KEY, updates);
    }
  } catch (error) {
    console.error('Error reordering certifications:', error);
    throw new Error('Failed to reorder certifications');
  }
}
