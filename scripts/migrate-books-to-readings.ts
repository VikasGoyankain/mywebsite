/**
 * Migration Script: Books from localStorage to Redis
 * 
 * This script migrates books from the legacy localStorage-based storage
 * to the new Redis-based ReadingItem storage.
 * 
 * Usage:
 * 1. Run in browser console on the expertise admin page
 * 2. Or create an API endpoint to trigger this migration
 * 
 * The script will:
 * - Read books from localStorage
 * - Convert them to ReadingItem format
 * - Upload any image URLs to ImageKit CDN (if provided)
 * - Save to Redis via the API
 */

// Type definitions
interface LegacyBook {
  id: string;
  title: string;
  author: string;
  commentary: string;
  impactOnThinking: string;
  order: number;
  createdAt: string;
}

interface MigrationResult {
  success: boolean;
  migrated: number;
  failed: number;
  errors: string[];
  details: {
    title: string;
    status: 'success' | 'failed';
    error?: string;
    newSlug?: string;
  }[];
}

// Migration function to be run in browser or API
export async function migrateBooksToReadings(): Promise<MigrationResult> {
  const result: MigrationResult = {
    success: false,
    migrated: 0,
    failed: 0,
    errors: [],
    details: [],
  };

  try {
    // Get legacy data from localStorage
    const storageKey = 'expertise_data';
    const storedData = localStorage.getItem(storageKey);
    
    if (!storedData) {
      result.errors.push('No expertise data found in localStorage');
      return result;
    }

    const data = JSON.parse(storedData);
    const books: LegacyBook[] = data.books || [];

    if (books.length === 0) {
      result.errors.push('No books found in localStorage');
      return result;
    }

    console.log(`Found ${books.length} books to migrate`);

    // Migrate each book
    for (const book of books) {
      try {
        console.log(`Migrating: ${book.title}`);

        // Convert to new ReadingItem format
        const readingData = {
          title: book.title,
          author: book.author,
          type: 'book' as const,
          impactOnThinking: book.impactOnThinking || book.commentary || '',
          notes: book.commentary ? `<p>${book.commentary}</p>` : '', // Convert commentary to HTML notes
          order: book.order,
        };

        // Create via API
        const response = await fetch('/api/readings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(readingData),
        });

        if (response.ok) {
          const newReading = await response.json();
          result.migrated++;
          result.details.push({
            title: book.title,
            status: 'success',
            newSlug: newReading.slug,
          });
          console.log(`✓ Migrated: ${book.title} -> ${newReading.slug}`);
        } else {
          const error = await response.json();
          throw new Error(error.error || 'API error');
        }
      } catch (error) {
        result.failed++;
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        result.details.push({
          title: book.title,
          status: 'failed',
          error: errorMessage,
        });
        result.errors.push(`Failed to migrate "${book.title}": ${errorMessage}`);
        console.error(`✗ Failed: ${book.title}`, error);
      }
    }

    result.success = result.failed === 0;
    
    console.log('\n=== Migration Summary ===');
    console.log(`Total: ${books.length}`);
    console.log(`Migrated: ${result.migrated}`);
    console.log(`Failed: ${result.failed}`);
    
    return result;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    result.errors.push(`Migration failed: ${errorMessage}`);
    console.error('Migration failed:', error);
    return result;
  }
}

// API-side migration function (for use in API routes)
export async function migrateBooksFromData(books: LegacyBook[]): Promise<MigrationResult> {
  // Import the service dynamically to avoid client-side issues
  const { createReading } = await import('@/lib/services/readings-service');
  
  const result: MigrationResult = {
    success: false,
    migrated: 0,
    failed: 0,
    errors: [],
    details: [],
  };

  for (const book of books) {
    try {
      const readingData = {
        title: book.title,
        author: book.author,
        type: 'book' as const,
        impactOnThinking: book.impactOnThinking || book.commentary || '',
        notes: book.commentary ? `<p>${book.commentary}</p>` : '',
        order: book.order,
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
  return result;
}

// Browser console helper
if (typeof window !== 'undefined') {
  (window as any).migrateBooksToReadings = migrateBooksToReadings;
  console.log('Migration script loaded. Run migrateBooksToReadings() to start migration.');
}
