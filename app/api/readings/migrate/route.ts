import { NextRequest, NextResponse } from 'next/server';
import { createReading, getAllReadings } from '@/lib/services/readings-service';
import { uploadUrlToImageKit } from '@/lib/imagekit';

// Legacy Book interface
interface LegacyBook {
  id: string;
  title: string;
  author: string;
  commentary: string;
  impactOnThinking: string;
  order: number;
  createdAt: string;
  imageUrl?: string; // Optional if added during migration
}

interface MigrationResult {
  success: boolean;
  migrated: number;
  failed: number;
  skipped: number;
  errors: string[];
  details: {
    title: string;
    status: 'success' | 'failed' | 'skipped';
    error?: string;
    newSlug?: string;
  }[];
}

// POST /api/readings/migrate - Migrate books from localStorage to Redis
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const books: LegacyBook[] = body.books || [];
    const uploadImages = body.uploadImages !== false; // Default true

    if (!Array.isArray(books) || books.length === 0) {
      return NextResponse.json(
        { error: 'No books provided for migration. Send { books: [...] }' },
        { status: 400 }
      );
    }

    const result: MigrationResult = {
      success: false,
      migrated: 0,
      failed: 0,
      skipped: 0,
      errors: [],
      details: [],
    };

    // Get existing readings to check for duplicates
    const existingReadings = await getAllReadings();
    const existingTitles = new Set(existingReadings.map(r => r.title.toLowerCase()));

    for (const book of books) {
      try {
        // Skip if already exists
        if (existingTitles.has(book.title.toLowerCase())) {
          result.skipped++;
          result.details.push({
            title: book.title,
            status: 'skipped',
            error: 'Already exists in Redis',
          });
          continue;
        }

        // Handle image upload to ImageKit if URL provided
        let cdnImageUrl: string | undefined;
        if (book.imageUrl && uploadImages) {
          try {
            const sanitizedTitle = book.title
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, '-')
              .substring(0, 30);
            cdnImageUrl = await uploadUrlToImageKit(
              book.imageUrl,
              `${sanitizedTitle}_${Date.now()}`,
              'readings'
            );
          } catch (imgError) {
            console.error(`Failed to upload image for ${book.title}:`, imgError);
            // Continue without image
          }
        }

        // Convert to new ReadingItem format
        const readingData = {
          title: book.title,
          author: book.author,
          type: 'book' as const,
          imageUrl: cdnImageUrl,
          impactOnThinking: book.impactOnThinking || book.commentary || 'No impact description provided.',
          notes: book.commentary ? `<p>${book.commentary}</p>` : '',
          order: book.order || result.migrated + 1,
        };

        const newReading = await createReading(readingData);
        
        result.migrated++;
        result.details.push({
          title: book.title,
          status: 'success',
          newSlug: newReading.slug,
        });
      } catch (error) {
        result.failed++;
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        result.details.push({
          title: book.title,
          status: 'failed',
          error: errorMessage,
        });
        result.errors.push(`Failed to migrate "${book.title}": ${errorMessage}`);
      }
    }

    result.success = result.failed === 0;

    return NextResponse.json({
      message: 'Migration completed',
      summary: {
        total: books.length,
        migrated: result.migrated,
        failed: result.failed,
        skipped: result.skipped,
      },
      ...result,
    });
  } catch (error) {
    console.error('Error in migration:', error);
    const message = error instanceof Error ? error.message : 'Migration failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// GET /api/readings/migrate - Get migration instructions
export async function GET() {
  return NextResponse.json({
    instructions: 'POST to this endpoint with your books data to migrate',
    example: {
      books: [
        {
          id: 'book_1',
          title: 'Book Title',
          author: 'Author Name',
          commentary: 'Your commentary about the book',
          impactOnThinking: 'How it changed your thinking',
          order: 1,
          createdAt: '2024-01-01T00:00:00.000Z',
          imageUrl: 'https://example.com/book-cover.jpg' // Optional
        }
      ],
      uploadImages: true // Set to false to skip ImageKit upload
    },
    browserInstructions: [
      '1. Open browser console on your expertise admin page',
      '2. Run: const data = JSON.parse(localStorage.getItem("expertise_data"))',
      '3. Copy the books array: data.books',
      '4. Send POST request to /api/readings/migrate with { books: data.books }',
    ],
  });
}
