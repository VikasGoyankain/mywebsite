"use client";

import Link from "next/link";
import { Library, Clock, BarChart3, ArrowRight, BookOpen } from "lucide-react";
import JournalHeader from "@/components/ccc/JournalHeader";
import JournalFooter from "@/components/ccc/JournalFooter";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { getVolume, getVolumeChapters } from "@/lib/ccc/journal";

interface Props {
  slug: string;
}

const VolumePage = ({ slug }: Props) => {
  const volume = getVolume(slug);

  if (!volume) return null;

  const chapters = getVolumeChapters(volume.slug);

  return (
    <div className="min-h-screen bg-background">
      <JournalHeader />

      <main className="container max-w-4xl mx-auto px-4">
        {/* Breadcrumb */}
        <nav aria-label="breadcrumb" className="pt-6 pb-2">
          <ol className="flex items-center gap-1.5 text-xs font-sans text-muted-foreground">
            <li>
              <Link href="/" className="hover:text-foreground transition-colors">
                Home
              </Link>
            </li>
            <li>/</li>
            <li>
              <Link href="/ccc" className="hover:text-foreground transition-colors">
                Journal
              </Link>
            </li>
            <li>/</li>
            <li className="text-foreground font-medium">
              {volume.title.split(":")[0]}
            </li>
          </ol>
        </nav>

        {/* Volume Header */}
        <section className="py-12 md:py-16">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-md bg-primary flex items-center justify-center">
              <Library className="w-6 h-6 text-primary-foreground" />
            </div>
            <Badge
              variant="outline"
              className="text-[10px] px-2 py-0 h-5 font-sans uppercase tracking-wider"
            >
              {chapters.length} Chapters
            </Badge>
          </div>

          <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold leading-tight mb-3">
            {volume.title}
          </h1>
          <p className="font-serif text-lg text-muted-foreground italic mb-4">
            {volume.subtitle}
          </p>
          <p className="font-sans text-base text-muted-foreground leading-relaxed max-w-2xl">
            {volume.description}
          </p>
        </section>

        <Separator />

        {/* Table of Contents */}
        <section className="py-12 md:py-16">
          <div className="flex items-center gap-2 mb-8">
            <BookOpen className="w-5 h-5 text-accent" />
            <h2 className="font-serif text-2xl font-semibold">
              Table of Contents
            </h2>
          </div>

          <div className="space-y-0">
            {chapters.map((chapter, i) => (
              <div key={chapter.slug}>
                <Link href={`/ccc/${chapter.slug}`} className="group block py-8">
                  <div className="flex items-start gap-5">
                    <span className="font-serif text-3xl font-bold text-muted-foreground/30 leading-none pt-1 shrink-0 w-10">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {chapter.tags.map((t) => (
                          <span
                            key={t.label}
                            className={`${t.className} text-[10px] px-2 py-0.5 rounded-sm font-sans font-medium uppercase tracking-wider`}
                          >
                            {t.label}
                          </span>
                        ))}
                      </div>
                      <h3 className="font-serif text-xl md:text-2xl font-semibold mb-2 group-hover:text-accent transition-colors leading-snug">
                        {chapter.title}
                      </h3>
                      <p className="text-sm font-sans text-muted-foreground leading-relaxed mb-3 max-w-xl">
                        {chapter.excerpt}
                      </p>
                      <div className="flex items-center gap-3 text-xs font-sans text-muted-foreground">
                        <span>{chapter.date}</span>
                        <span>·</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {chapter.readTime}
                        </span>
                        <span>·</span>
                        <span className="flex items-center gap-1">
                          <BarChart3 className="w-3 h-3" />
                          {chapter.complexity}
                        </span>
                        <ArrowRight className="w-3.5 h-3.5 ml-auto opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all text-accent" />
                      </div>
                    </div>
                  </div>
                </Link>
                {i < chapters.length - 1 && <Separator />}
              </div>
            ))}
          </div>
        </section>
      </main>

      <JournalFooter />
    </div>
  );
};

export default VolumePage;
