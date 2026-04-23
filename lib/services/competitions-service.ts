import redis from '@/lib/redis';
import type { Competition } from '@/types/expertise';

const REDIS_KEY = 'expertise:competitions:all';
const REDIS_IDS_KEY = 'expertise:competitions:ids';

export async function getAllCompetitions(): Promise<Competition[]> {
  try {
    const data = await redis.hgetall(REDIS_KEY);
    if (!data || Object.keys(data).length === 0) return [];
    
    const competitions = Object.values(data).map(item => {
      // Upstash may return already-parsed objects or strings
      if (typeof item === 'string') {
        return JSON.parse(item) as Competition;
      }
      return item as Competition;
    });
    return competitions.sort((a, b) => a.order - b.order);
  } catch (error) {
    console.error('Error fetching competitions:', error);
    return [];
  }
}

export async function getCompetitionById(id: string): Promise<Competition | null> {
  try {
    const data = await redis.hget(REDIS_KEY, id);
    if (!data) return null;
    // Upstash may return already-parsed object or string
    if (typeof data === 'string') {
      return JSON.parse(data) as Competition;
    }
    return data as Competition;
  } catch (error) {
    console.error('Error fetching competition:', error);
    return null;
  }
}

export async function createCompetition(
  competition: Omit<Competition, 'id' | 'createdAt'>,
  preserveId?: string
): Promise<Competition> {
  try {
    const id = preserveId || `comp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newCompetition: Competition = {
      ...competition,
      id,
      createdAt: new Date().toISOString(),
    };

    await redis.hset(REDIS_KEY, { [id]: JSON.stringify(newCompetition) });
    await redis.sadd(REDIS_IDS_KEY, id);

    return newCompetition;
  } catch (error) {
    console.error('Error creating competition:', error);
    throw new Error('Failed to create competition');
  }
}

export async function updateCompetition(
  id: string,
  updates: Partial<Omit<Competition, 'id' | 'createdAt'>>
): Promise<Competition | null> {
  try {
    const existing = await getCompetitionById(id);
    if (!existing) return null;

    const updated: Competition = {
      ...existing,
      ...updates,
    };

    await redis.hset(REDIS_KEY, { [id]: JSON.stringify(updated) });
    return updated;
  } catch (error) {
    console.error('Error updating competition:', error);
    throw new Error('Failed to update competition');
  }
}

export async function deleteCompetition(id: string): Promise<boolean> {
  try {
    await redis.hdel(REDIS_KEY, id);
    await redis.srem(REDIS_IDS_KEY, id);
    return true;
  } catch (error) {
    console.error('Error deleting competition:', error);
    throw new Error('Failed to delete competition');
  }
}

export async function reorderCompetitions(orderedIds: string[]): Promise<void> {
  try {
    const competitions = await getAllCompetitions();
    const updates: Record<string, string> = {};

    for (let i = 0; i < orderedIds.length; i++) {
      const comp = competitions.find(c => c.id === orderedIds[i]);
      if (comp) {
        comp.order = i;
        updates[comp.id] = JSON.stringify(comp);
      }
    }

    if (Object.keys(updates).length > 0) {
      await redis.hset(REDIS_KEY, updates);
    }
  } catch (error) {
    console.error('Error reordering competitions:', error);
    throw new Error('Failed to reorder competitions');
  }
}
