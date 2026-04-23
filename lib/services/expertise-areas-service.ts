import redis from '@/lib/redis';
import type { ExpertiseArea } from '@/types/expertise';
import { generateSlug } from '@/lib/slug';

const REDIS_KEY = 'expertise:areas:all';
const REDIS_IDS_KEY = 'expertise:areas:ids';

export async function getAllExpertiseAreas(): Promise<ExpertiseArea[]> {
  try {
    const data = await redis.hgetall(REDIS_KEY);
    if (!data || Object.keys(data).length === 0) return [];
    
    const areas = Object.values(data).map(item => {
      // Upstash may return already-parsed objects or strings
      if (typeof item === 'string') {
        return JSON.parse(item) as ExpertiseArea;
      }
      return item as ExpertiseArea;
    });
    return areas.sort((a, b) => a.order - b.order);
  } catch (error) {
    console.error('Error fetching expertise areas:', error);
    return [];
  }
}

export async function getExpertiseAreaById(id: string): Promise<ExpertiseArea | null> {
  try {
    const data = await redis.hget(REDIS_KEY, id);
    if (!data) return null;
    // Upstash may return already-parsed object or string
    if (typeof data === 'string') {
      return JSON.parse(data) as ExpertiseArea;
    }
    return data as ExpertiseArea;
  } catch (error) {
    console.error('Error fetching expertise area:', error);
    return null;
  }
}

export async function createExpertiseArea(
  area: Omit<ExpertiseArea, 'id' | 'createdAt'>,
  preserveId?: string
): Promise<ExpertiseArea> {
  try {
    const id = preserveId || `area_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newArea: ExpertiseArea = {
      ...area,
      id,
      createdAt: new Date().toISOString(),
    };

    await redis.hset(REDIS_KEY, { [id]: JSON.stringify(newArea) });
    await redis.sadd(REDIS_IDS_KEY, id);

    return newArea;
  } catch (error) {
    console.error('Error creating expertise area:', error);
    throw new Error('Failed to create expertise area');
  }
}

export async function updateExpertiseArea(
  id: string,
  updates: Partial<Omit<ExpertiseArea, 'id' | 'createdAt'>>
): Promise<ExpertiseArea | null> {
  try {
    const existing = await getExpertiseAreaById(id);
    if (!existing) return null;

    const updated: ExpertiseArea = {
      ...existing,
      ...updates,
    };

    await redis.hset(REDIS_KEY, { [id]: JSON.stringify(updated) });
    return updated;
  } catch (error) {
    console.error('Error updating expertise area:', error);
    throw new Error('Failed to update expertise area');
  }
}

export async function deleteExpertiseArea(id: string): Promise<boolean> {
  try {
    await redis.hdel(REDIS_KEY, id);
    await redis.srem(REDIS_IDS_KEY, id);
    return true;
  } catch (error) {
    console.error('Error deleting expertise area:', error);
    throw new Error('Failed to delete expertise area');
  }
}

export async function reorderExpertiseAreas(orderedIds: string[]): Promise<void> {
  try {
    const areas = await getAllExpertiseAreas();
    const updates: Record<string, string> = {};

    for (let i = 0; i < orderedIds.length; i++) {
      const area = areas.find(a => a.id === orderedIds[i]);
      if (area) {
        area.order = i;
        updates[area.id] = JSON.stringify(area);
      }
    }

    if (Object.keys(updates).length > 0) {
      await redis.hset(REDIS_KEY, updates);
    }
  } catch (error) {
    console.error('Error reordering expertise areas:', error);
    throw new Error('Failed to reorder expertise areas');
  }
}
