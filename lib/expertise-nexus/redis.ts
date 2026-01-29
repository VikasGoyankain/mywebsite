import { Redis } from '@upstash/redis';

// Initialize Redis client
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || '',
  token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
});

// Helper functions for Redis operations
export const getRedisClient = () => redis;

export const getSkills = async () => {
  try {
    const skills = await redis.get('skills');
    return skills || [];
  } catch (error) {
    console.error('Error fetching skills:', error);
    return [];
  }
};

export const setSkills = async (skills: any[]) => {
  try {
    await redis.set('skills', skills);
    return true;
  } catch (error) {
    console.error('Error setting skills:', error);
    return false;
  }
};

export const getTopSkills = async () => {
  try {
    const topSkills = await redis.get('top-skills');
    return topSkills || [];
  } catch (error) {
    console.error('Error fetching top skills:', error);
    return [];
  }
};

export const setTopSkills = async (skills: any[]) => {
  try {
    await redis.set('top-skills', skills);
    return true;
  } catch (error) {
    console.error('Error setting top skills:', error);
    return false;
  }
};

export const getCertificates = async () => {
  try {
    const certificates = await redis.get('certificates');
    return certificates || [];
  } catch (error) {
    console.error('Error fetching certificates:', error);
    return [];
  }
};

export const setCertificates = async (certificates: any[]) => {
  try {
    await redis.set('certificates', certificates);
    return true;
  } catch (error) {
    console.error('Error setting certificates:', error);
    return false;
  }
};

export default redis; 