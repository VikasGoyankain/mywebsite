'use client';

import { ReadingItem } from '@/types/expertise';
import { motion } from 'framer-motion';
import { BookOpen, GraduationCap, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';

interface ReadingsSectionProps {
  readings: ReadingItem[];
}

export function ReadingsSection({ readings }: ReadingsSectionProps) {
  if (readings.length === 0) return null;

  const sorted = [...readings].sort((a, b) => a.order - b.order);

  return (
    <section className="py-12 border-t border-border">
      <h2 className="font-display text-2xl font-medium mb-2">Readings & Courses</h2>
      <p className="text-sm text-muted-foreground mb-8">
        Not a reading list—a thinking list. Click to see my detailed notes.
      </p>
      <div className="grid gap-6 md:grid-cols-2">
        {sorted.map((reading, index) => (
          <motion.div
            key={reading.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Link href={`/expertise/readings/${reading.slug}`}>
              <article className="group relative h-full p-5 border border-border rounded-lg bg-card/50 hover:bg-card hover:shadow-lg transition-all duration-300 cursor-pointer">
                <div className="flex gap-4">
                  {/* Text content */}
                  <div className="flex-1 min-w-0">
                    {/* Type badge */}
                    <Badge 
                      variant={reading.type === 'book' ? 'default' : 'secondary'} 
                      className="mb-2"
                    >
                      {reading.type === 'book' ? (
                        <><BookOpen className="h-3 w-3 mr-1" /> Book</>
                      ) : (
                        <><GraduationCap className="h-3 w-3 mr-1" /> Course</>
                      )}
                    </Badge>

                    {/* Title */}
                    <h3 className="font-display text-lg font-medium mb-1 group-hover:text-primary transition-colors">
                      <span className="italic">{reading.title}</span>
                    </h3>
                    
                    {/* Author */}
                    <p className="text-sm text-muted-foreground mb-3">
                      by {reading.author}
                      {reading.type === 'course' && reading.platform && (
                        <span> • {reading.platform}</span>
                      )}
                    </p>
                    
                    {/* Impact - only this, no summary */}
                    <p className="text-sm text-foreground/80 line-clamp-3">
                      {reading.impactOnThinking}
                    </p>

                    {/* Read more indicator */}
                    <div className="flex items-center gap-1 mt-3 text-sm text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                      <span>View notes</span>
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  </div>

                  {/* Cover image - only if provided */}
                  {reading.imageUrl && (
                    <div className="flex-shrink-0">
                      <div className="relative w-20 h-28 md:w-24 md:h-32 rounded-md overflow-hidden shadow-md">
                        <Image
                          src={reading.imageUrl}
                          alt={reading.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </article>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

// Keep old export for backward compatibility during migration
export { ReadingsSection as BooksSection };
