import { NextResponse } from 'next/server';
import redis from '@/lib/redis';

// Clear all expertise data from Redis - use for debugging
export async function DELETE() {
  try {
    // Delete all keys related to expertise data
    await Promise.all([
      redis.del('expertise:areas:all'),
      redis.del('expertise:areas:ids'),
      redis.del('expertise:certifications:all'),
      redis.del('expertise:certifications:ids'),
      redis.del('expertise:competitions:all'),
      redis.del('expertise:competitions:ids'),
    ]);

    return NextResponse.json({
      success: true,
      message: 'All expertise data cleared from Redis',
    });
  } catch (error) {
    console.error('Error clearing expertise data:', error);
    return NextResponse.json(
      { error: 'Failed to clear expertise data' },
      { status: 500 }
    );
  }
}
