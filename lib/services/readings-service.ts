import redis from '../redis';
import { generateSlug } from '../slug';
import {
  ReadingItem,
  ReadingType,
  CreateReadingInput,
  UpdateReadingInput,
} from '../../types/expertise';

// Redis keys for readings
const REDIS_KEYS = {
  READINGS: 'readings:all',
  READING_SLUGS: 'readings:slugs',
  READING_TYPES: 'readings:types', // readings:types:book, readings:types:course
};

// Generate unique ID
function generateId(): string {
  return `reading_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Generate slug from title
function generateReadingSlug(title: string): string {
  // Create a URL-friendly slug from title + random suffix for uniqueness
  const baseSlug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 50);
  const randomSuffix = generateSlug(6);
  return `${baseSlug}-${randomSuffix}`;
}

// Get all readings
export async function getAllReadings(): Promise<ReadingItem[]> {
  try {
    const readings = await redis.hgetall(REDIS_KEYS.READINGS);
    if (!readings) return [];

    return Object.values(readings)
      .map((reading) => (typeof reading === 'string' ? JSON.parse(reading) : reading))
      .sort((a, b) => a.order - b.order);
  } catch (error) {
    console.error('Error fetching readings:', error);
    return [];
  }
}

// Get readings by type (book or course)
export async function getReadingsByType(type: ReadingType): Promise<ReadingItem[]> {
  try {
    const readings = await getAllReadings();
    return readings.filter((reading) => reading.type === type);
  } catch (error) {
    console.error('Error fetching readings by type:', error);
    return [];
  }
}

// Get single reading by ID
export async function getReadingById(id: string): Promise<ReadingItem | null> {
  try {
    const reading = await redis.hget(REDIS_KEYS.READINGS, id);
    if (!reading) return null;

    const parsed = typeof reading === 'string' ? JSON.parse(reading) : reading;
    return parsed as ReadingItem;
  } catch (error) {
    console.error('Error fetching reading by ID:', error);
    return null;
  }
}

// Get single reading by slug
export async function getReadingBySlug(slug: string): Promise<ReadingItem | null> {
  try {
    // First try direct slug lookup
    const readingId = await redis.hget(REDIS_KEYS.READING_SLUGS, slug);
    if (readingId) {
      return getReadingById(readingId as string);
    }

    // Fallback: search through all readings
    const readings = await getAllReadings();
    return readings.find((reading) => reading.slug === slug) || null;
  } catch (error) {
    console.error('Error fetching reading by slug:', error);
    return null;
  }
}

// Create new reading
export async function createReading(input: CreateReadingInput): Promise<ReadingItem> {
  try {
    const id = generateId();
    const now = new Date().toISOString();
    const slug = input.slug || generateReadingSlug(input.title);

    // Check for duplicate slug
    const existingReading = await getReadingBySlug(slug);
    if (existingReading) {
      throw new Error(`Reading with slug "${slug}" already exists`);
    }

    // Get max order for new reading
    const allReadings = await getAllReadings();
    const maxOrder = allReadings.length > 0 
      ? Math.max(...allReadings.map(r => r.order)) 
      : 0;

    const reading: ReadingItem = {
      id,
      slug,
      title: input.title,
      author: input.author,
      type: input.type,
      imageUrl: input.imageUrl || undefined,
      impactOnThinking: input.impactOnThinking,
      notes: input.notes || '',
      platform: input.platform || undefined,
      duration: input.duration || undefined,
      completionDate: input.completionDate || undefined,
      order: input.order !== undefined ? input.order : maxOrder + 1,
      createdAt: now,
      updatedAt: now,
    };

    // Save reading
    await redis.hset(REDIS_KEYS.READINGS, {
      [id]: JSON.stringify(reading),
    });

    // Save slug index
    await redis.hset(REDIS_KEYS.READING_SLUGS, {
      [slug]: id,
    });

    // Add to type index
    await redis.sadd(`${REDIS_KEYS.READING_TYPES}:${reading.type}`, id);

    return reading;
  } catch (error) {
    console.error('Error creating reading:', error);
    throw error;
  }
}

// Update reading
export async function updateReading(
  id: string,
  updates: UpdateReadingInput
): Promise<ReadingItem | null> {
  try {
    const existingReading = await getReadingById(id);
    if (!existingReading) return null;

    const now = new Date().toISOString();
    const oldSlug = existingReading.slug;
    const oldType = existingReading.type;

    // Handle slug changes
    let newSlug = existingReading.slug;
    if (updates.slug && updates.slug !== existingReading.slug) {
      newSlug = updates.slug;
      const slugReading = await getReadingBySlug(newSlug);
      if (slugReading && slugReading.id !== id) {
        throw new Error(`Reading with slug "${newSlug}" already exists`);
      }
    } else if (updates.title && updates.title !== existingReading.title && !updates.slug) {
      // If title changed but no explicit slug, generate new slug
      newSlug = generateReadingSlug(updates.title);
      const slugReading = await getReadingBySlug(newSlug);
      if (slugReading && slugReading.id !== id) {
        // If generated slug exists, keep old slug
        newSlug = existingReading.slug;
      }
    }

    const updatedReading: ReadingItem = {
      ...existingReading,
      ...updates,
      slug: newSlug,
      updatedAt: now,
    };

    // Save updated reading
    await redis.hset(REDIS_KEYS.READINGS, {
      [id]: JSON.stringify(updatedReading),
    });

    // Update slug index if changed
    if (oldSlug !== newSlug) {
      await redis.hdel(REDIS_KEYS.READING_SLUGS, oldSlug);
      await redis.hset(REDIS_KEYS.READING_SLUGS, {
        [newSlug]: id,
      });
    }

    // Update type index if type changed
    if (updates.type && updates.type !== oldType) {
      await redis.srem(`${REDIS_KEYS.READING_TYPES}:${oldType}`, id);
      await redis.sadd(`${REDIS_KEYS.READING_TYPES}:${updates.type}`, id);
    }

    return updatedReading;
  } catch (error) {
    console.error('Error updating reading:', error);
    throw error;
  }
}

// Delete reading
export async function deleteReading(id: string): Promise<boolean> {
  try {
    const reading = await getReadingById(id);
    if (!reading) return false;

    // Delete reading
    await redis.hdel(REDIS_KEYS.READINGS, id);

    // Delete slug index
    await redis.hdel(REDIS_KEYS.READING_SLUGS, reading.slug);

    // Remove from type index
    await redis.srem(`${REDIS_KEYS.READING_TYPES}:${reading.type}`, id);

    return true;
  } catch (error) {
    console.error('Error deleting reading:', error);
    return false;
  }
}

// Reorder readings
export async function reorderReadings(orderedIds: string[]): Promise<boolean> {
  try {
    for (let i = 0; i < orderedIds.length; i++) {
      const reading = await getReadingById(orderedIds[i]);
      if (reading) {
        reading.order = i + 1;
        reading.updatedAt = new Date().toISOString();
        await redis.hset(REDIS_KEYS.READINGS, {
          [reading.id]: JSON.stringify(reading),
        });
      }
    }
    return true;
  } catch (error) {
    console.error('Error reordering readings:', error);
    return false;
  }
}

// Get readings count
export async function getReadingsCount(): Promise<{ total: number; books: number; courses: number }> {
  try {
    const readings = await getAllReadings();
    const books = readings.filter(r => r.type === 'book').length;
    const courses = readings.filter(r => r.type === 'course').length;
    return { total: readings.length, books, courses };
  } catch (error) {
    console.error('Error getting readings count:', error);
    return { total: 0, books: 0, courses: 0 };
  }
}
