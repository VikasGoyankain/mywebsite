'use client';

import { ReadingItem } from '@/types/expertise';
import { motion } from 'framer-motion';
import { ArrowLeft, BookOpen, GraduationCap, Calendar, Clock, ExternalLink, User } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

interface ReadingDetailContentProps {
  reading: ReadingItem;
}

export default function ReadingDetailContent({ reading }: ReadingDetailContentProps) {
  const isBook = reading.type === 'book';
  const TypeIcon = isBook ? BookOpen : GraduationCap;

  return (
    <div className="min-h-screen bg-background">
      {/* Header with back button */}
      <div className="border-b bg-muted/30">
        <div className="container max-w-4xl mx-auto px-4 py-4">
          <Link href="/expertise">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Expertise
            </Button>
          </Link>
        </div>
      </div>

      {/* Main content */}
      <article className="container max-w-4xl mx-auto px-4 py-8 md:py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header section */}
          <header className="mb-8">
            <div className="flex flex-col md:flex-row gap-8">
              {/* Cover Image */}
              {reading.imageUrl && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="flex-shrink-0"
                >
                  <div className="relative w-48 h-64 md:w-56 md:h-80 rounded-lg overflow-hidden shadow-xl mx-auto md:mx-0">
                    <Image
                      src={reading.imageUrl}
                      alt={reading.title}
                      fill
                      className="object-cover"
                      priority
                    />
                  </div>
                </motion.div>
              )}

              {/* Title and meta info */}
              <div className="flex-1">
                <Badge variant={isBook ? 'default' : 'secondary'} className="mb-3">
                  <TypeIcon className="h-3 w-3 mr-1" />
                  {isBook ? 'Book' : 'Course'}
                </Badge>

                <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">
                  {reading.title}
                </h1>

                <div className="flex items-center text-muted-foreground mb-4">
                  <User className="h-4 w-4 mr-2" />
                  <span className="text-lg">{reading.author}</span>
                </div>

                {/* Course-specific details */}
                {!isBook && (reading.platform || reading.duration || reading.completionDate) && (
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
                    {reading.platform && (
                      <div className="flex items-center gap-1">
                        <ExternalLink className="h-4 w-4" />
                        <span>{reading.platform}</span>
                      </div>
                    )}
                    {reading.duration && (
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{reading.duration}</span>
                      </div>
                    )}
                    {reading.completionDate && (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>Completed: {new Date(reading.completionDate).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Impact statement */}
                <Card className="bg-primary/5 border-primary/20">
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-sm text-primary mb-2">
                      How it changed my life
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {reading.impactOnThinking}
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </header>

          <Separator className="my-8" />

          {/* Notes section */}
          <section>
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-primary" />
              My Notes & Learnings
            </h2>

            {reading.notes ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="prose prose-lg dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: reading.notes }}
              />
            ) : (
              <Card className="bg-muted/50">
                <CardContent className="p-8 text-center">
                  <BookOpen className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground">
                    Notes for this {isBook ? 'book' : 'course'} are being prepared...
                  </p>
                </CardContent>
              </Card>
            )}
          </section>

          {/* Footer with dates */}
          <footer className="mt-12 pt-6 border-t">
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              <span>
                Added: {new Date(reading.createdAt).toLocaleDateString()}
              </span>
              {reading.updatedAt !== reading.createdAt && (
                <span>
                  Last updated: {new Date(reading.updatedAt).toLocaleDateString()}
                </span>
              )}
            </div>
          </footer>
        </motion.div>
      </article>
    </div>
  );
}
