import type { Book } from '@/types/expertise';

interface BooksSectionProps {
  books: Book[];
}

export function BooksSection({ books }: BooksSectionProps) {
  if (books.length === 0) return null;

  const sorted = [...books].sort((a, b) => a.order - b.order);

  return (
    <section className="py-12 border-t border-border">
      <h2 className="font-display text-2xl font-medium mb-2">Books & Reading</h2>
      <p className="text-sm text-muted-foreground mb-8">
        Not a reading list—a thinking list.
      </p>
      <div className="space-y-6">
        {sorted.map((book) => (
          <article
            key={book.id}
            className="p-5 border-l-2 border-foreground/20 bg-card/50"
          >
            <h3 className="font-display text-lg font-medium mb-1">
              <span className="italic">{book.title}</span>
            </h3>
            <p className="text-sm text-muted-foreground mb-3">by {book.author}</p>
            <p className="text-sm text-foreground/90 mb-2">{book.commentary}</p>
            <p className="text-sm text-muted-foreground italic">
              {book.impactOnThinking}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
