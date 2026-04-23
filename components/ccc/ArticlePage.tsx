"use client";

import Link from "next/link";
import {
  FileText,
  Library,
  Clock,
  BarChart3,
  ArrowLeft,
  ArrowRight,
  BookOpen,
} from "lucide-react";
import JournalHeader from "@/components/ccc/JournalHeader";
import JournalFooter from "@/components/ccc/JournalFooter";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  getPost,
  getVolume,
  getVolumeChapters,
  getRelatedPosts,
} from "@/lib/ccc/journal";

interface Props {
  slug: string;
}

const ArticlePage = ({ slug }: Props) => {
  const post = getPost(slug);

  if (!post) return null;

  const volume = post.volumeSlug ? getVolume(post.volumeSlug) : undefined;
  const chapters = volume ? getVolumeChapters(post.volumeSlug!) : [];
  const relatedPosts = getRelatedPosts(post);
  const currentChapterIndex = chapters.findIndex((c) => c.slug === post.slug);

  return (
    <div className="min-h-screen bg-background">
      <JournalHeader />

      <main className="container max-w-6xl mx-auto px-4">
        {/* Breadcrumb */}
        <nav aria-label="breadcrumb" className="pt-6 pb-2">
          <ol className="flex flex-wrap items-center gap-1.5 text-xs font-sans text-muted-foreground">
            <li>
              <Link href="/" className="hover:text-foreground transition-colors">
                Home
              </Link>
            </li>
            <li>/</li>
            <li>
              <Link
                href="/ccc"
                className="hover:text-foreground transition-colors"
              >
                Journal
              </Link>
            </li>
            {volume && (
              <>
                <li>/</li>
                <li>
                  <Link
                    href={`/ccc/${volume.slug}`}
                    className="hover:text-foreground transition-colors"
                  >
                    {volume.title
                      .replace("Volume I: ", "")
                      .replace("Volume II: ", "")}
                  </Link>
                </li>
              </>
            )}
            <li>/</li>
            <li className="text-foreground font-medium truncate max-w-[200px]">
              {post.title.split(":")[0]}
            </li>
          </ol>
        </nav>

        <div className="grid lg:grid-cols-[1fr_300px] gap-12 lg:gap-16 py-8 md:py-12">
          {/* Main Content */}
          <article>
            {/* Header */}
            <div className="mb-8">
              <div className="flex flex-wrap items-center gap-2 mb-4">
                {post.type === "volume-chapter" ? (
                  <Library className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <FileText className="w-4 h-4 text-muted-foreground" />
                )}
                {post.tags.map((t) => (
                  <span
                    key={t.label}
                    className={`${t.className} text-[10px] px-2.5 py-0.5 rounded-sm font-sans font-medium uppercase tracking-wider`}
                  >
                    {t.label}
                  </span>
                ))}
              </div>

              <h1 className="font-serif text-3xl md:text-4xl lg:text-[2.75rem] font-bold leading-tight mb-4">
                {post.title}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-xs font-sans text-muted-foreground uppercase tracking-wider mb-6">
                <span>By Vikas Goyanka</span>
                <span>·</span>
                <span>{post.date}</span>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {post.readTime}
                </span>
                <span>·</span>
                <Badge
                  variant="outline"
                  className="text-[10px] px-2 py-0 h-5 font-sans uppercase"
                >
                  {post.complexity}
                </Badge>
              </div>
            </div>

            {/* Abstract Box */}
            <div className="bg-card/80 backdrop-blur-sm border border-border rounded-lg p-6 mb-10">
              <div className="flex items-center gap-2 mb-3">
                <BookOpen className="w-4 h-4 text-accent" />
                <h2 className="font-sans text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  Abstract
                </h2>
              </div>
              <p className="font-sans text-sm leading-relaxed text-foreground/90">
                {post.abstract}
              </p>
            </div>

            <Separator className="mb-10" />

            {/* Article Body */}
            <div className="prose-journal font-sans text-base leading-[1.8] space-y-6">
              {post.content.split("\n\n").map((block, i) => {
                if (block.startsWith("## ")) {
                  return (
                    <h2
                      key={i}
                      className="font-serif text-2xl font-semibold mt-10 mb-4"
                    >
                      {block.replace("## ", "")}
                    </h2>
                  );
                }
                if (block.startsWith("> ")) {
                  return (
                    <blockquote
                      key={i}
                      className="border-l-4 border-accent/40 pl-5 py-2 italic text-muted-foreground text-sm"
                    >
                      {block.replace("> ", "")}
                    </blockquote>
                  );
                }
                if (block.startsWith("| ")) {
                  const rows = block
                    .split("\n")
                    .filter((r) => !r.startsWith("|---"));
                  const headers = rows[0]
                    ?.split("|")
                    .filter(Boolean)
                    .map((h) => h.trim());
                  const dataRows = rows
                    .slice(1)
                    .map((r) =>
                      r
                        .split("|")
                        .filter(Boolean)
                        .map((c) => c.trim())
                    );
                  return (
                    <div key={i} className="overflow-x-auto my-6">
                      <table className="w-full border-collapse text-sm">
                        <thead>
                          <tr className="border-b-2 border-border">
                            {headers?.map((h, j) => (
                              <th
                                key={j}
                                className="text-left py-2 px-3 font-sans font-semibold text-xs uppercase tracking-wider text-muted-foreground"
                              >
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {dataRows.map((row, ri) => (
                            <tr key={ri} className="border-b border-border">
                              {row.map((cell, ci) => (
                                <td
                                  key={ci}
                                  className="py-2 px-3 font-sans text-sm"
                                  dangerouslySetInnerHTML={{
                                    __html: cell.replace(
                                      /\*\*(.*?)\*\*/g,
                                      "<strong>$1</strong>"
                                    ),
                                  }}
                                />
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  );
                }
                if (block.startsWith("[^")) return null; // footnotes rendered separately
                return (
                  <p key={i} className="text-foreground/85">
                    {block}
                  </p>
                );
              })}
            </div>

            {/* Reasoned Verdict */}
            {post.verdict && (
              <>
                <Separator className="my-10" />
                <div className="bg-primary text-primary-foreground rounded-lg p-6 md:p-8">
                  <h2 className="font-serif text-xl font-semibold mb-4 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Reasoned Verdict — Legal &amp; Ethical Conclusions
                  </h2>
                  <p className="font-sans text-sm leading-[1.8] opacity-90">
                    {post.verdict}
                  </p>
                </div>
              </>
            )}

            {/* Footnotes */}
            {post.footnotes && post.footnotes.length > 0 && (
              <>
                <Separator className="my-10" />
                <div className="mb-10">
                  <h3 className="font-sans text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-4">
                    References
                  </h3>
                  <ol className="list-decimal list-inside space-y-1.5 text-xs font-sans text-muted-foreground">
                    {post.footnotes.map((fn, i) => (
                      <li key={i}>{fn}</li>
                    ))}
                  </ol>
                </div>
              </>
            )}

            {/* Chapter Navigation */}
            {volume && chapters.length > 1 && (
              <div className="flex justify-between gap-4 mt-10">
                {currentChapterIndex > 0 ? (
                  <Link
                    href={`/ccc/${chapters[currentChapterIndex - 1].slug}`}
                    className="flex items-center gap-2 text-sm font-sans text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" /> Previous Chapter
                  </Link>
                ) : (
                  <div />
                )}
                {currentChapterIndex < chapters.length - 1 ? (
                  <Link
                    href={`/ccc/${chapters[currentChapterIndex + 1].slug}`}
                    className="flex items-center gap-2 text-sm font-sans text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Next Chapter <ArrowRight className="w-4 h-4" />
                  </Link>
                ) : (
                  <div />
                )}
              </div>
            )}
          </article>

          {/* Sidebar */}
          <aside className="space-y-8">
            {/* Volume Progress */}
            {volume && (
              <div className="border border-border rounded-lg p-5 bg-card">
                <div className="flex items-center gap-2 mb-3">
                  <Library className="w-4 h-4 text-accent" />
                  <h3 className="font-sans text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                    Volume Progress
                  </h3>
                </div>
                <Link
                  href={`/ccc/${volume.slug}`}
                  className="font-serif text-sm font-semibold hover:text-accent transition-colors block mb-4"
                >
                  {volume.title}
                </Link>
                <div className="space-y-1">
                  {chapters.map((ch, i) => (
                    <Link
                      key={ch.slug}
                      href={`/ccc/${ch.slug}`}
                      className={`block px-3 py-2 rounded-sm text-xs font-sans transition-colors ${
                        ch.slug === post.slug
                          ? "bg-primary text-primary-foreground font-medium"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted"
                      }`}
                    >
                      {i + 1}. {ch.title.split(":")[0]}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Related Research */}
            {relatedPosts.length > 0 && (
              <div className="border border-border rounded-lg p-5 bg-card">
                <h3 className="font-sans text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-4">
                  {volume
                    ? "Related in This Volume"
                    : "Related Independent Research"}
                </h3>
                <div className="space-y-3">
                  {relatedPosts.map((rp) => (
                    <Link
                      key={rp.slug}
                      href={`/ccc/${rp.slug}`}
                      className="block group"
                    >
                      <p className="font-serif text-sm font-medium group-hover:text-accent transition-colors leading-snug">
                        {rp.title}
                      </p>
                      <p className="text-[10px] font-sans text-muted-foreground mt-1">
                        {rp.readTime} · {rp.complexity}
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>
      </main>

      <JournalFooter />
    </div>
  );
};

export default ArticlePage;
