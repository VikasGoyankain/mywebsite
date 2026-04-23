"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Library,
  FileText,
  LayoutGrid,
  List,
  ArrowRight,
  Clock,
  BarChart3,
} from "lucide-react";
import JournalHeader from "@/components/ccc/JournalHeader";
import JournalFooter from "@/components/ccc/JournalFooter";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { volumes, posts, type Post, type Category } from "@/lib/ccc/journal";

type FilterMode = "all" | "volumes" | "independent" | Category;

const filterOptions: { value: FilterMode; label: string }[] = [
  { value: "all", label: "All" },
  { value: "volumes", label: "Volumes" },
  { value: "independent", label: "Independent" },
  { value: "banking", label: "Banking" },
  { value: "tech", label: "Tech" },
  { value: "policy", label: "Policy" },
];

const JournalHub = () => {
  const [filter, setFilter] = useState<FilterMode>("all");
  const [isListView, setIsListView] = useState(false);

  const showVolumes = filter === "all" || filter === "volumes";
  const showIndependent = filter !== "volumes";

  const filteredPosts = useMemo(() => {
    let result: Post[];
    if (filter === "volumes") return [];
    if (filter === "independent") {
      result = posts.filter((p) => p.type === "independent");
    } else if (["banking", "tech", "policy"].includes(filter)) {
      result = posts.filter((p) => p.categories.includes(filter as Category));
    } else {
      result = posts;
    }
    return result;
  }, [filter]);

  return (
    <div className="min-h-screen bg-background">
      <JournalHeader />

      <main className="container max-w-6xl mx-auto px-4">
        {/* Breadcrumb */}
        <nav aria-label="breadcrumb" className="pt-6 pb-2">
          <ol className="flex items-center gap-1.5 text-xs font-sans text-muted-foreground">
            <li>
              <Link href="/" className="hover:text-foreground transition-colors">
                Home
              </Link>
            </li>
            <li>/</li>
            <li className="text-foreground font-medium">Journal</li>
          </ol>
        </nav>

        {/* Hero */}
        <section className="py-12 md:py-16">
          <p className="text-xs font-sans uppercase tracking-[0.25em] text-muted-foreground mb-3">
            Research Hub
          </p>
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-4">
            Code, Coin &amp; Constitution
          </h1>
          <p className="font-sans text-lg text-muted-foreground max-w-2xl leading-relaxed">
            Navigating the intersections of Technology, Banking, and the Law.
            Curated research volumes and independent insights for the discerning
            professional.
          </p>
        </section>

        <Separator />

        {/* Filter Bar + Toggle */}
        <div className="py-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            {filterOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setFilter(opt.value)}
                className={`px-3.5 py-1.5 rounded-sm text-xs font-sans font-medium uppercase tracking-wider transition-colors ${
                  filter === opt.value
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2.5">
            <LayoutGrid
              className={`w-4 h-4 ${!isListView ? "text-foreground" : "text-muted-foreground"}`}
            />
            <Switch
              checked={isListView}
              onCheckedChange={setIsListView}
              aria-label="Toggle list view"
            />
            <List
              className={`w-4 h-4 ${isListView ? "text-foreground" : "text-muted-foreground"}`}
            />
            <span className="text-[10px] font-sans uppercase tracking-wider text-muted-foreground ml-1">
              {isListView ? "List" : "Card"}
            </span>
          </div>
        </div>

        <Separator />

        {/* Curated Volumes */}
        {showVolumes && volumes.length > 0 && (
          <section className="py-12 md:py-16">
            <div className="flex items-center gap-2 mb-8">
              <Library className="w-5 h-5 text-accent" />
              <h2 className="font-serif text-2xl font-semibold">
                Curated Volumes
              </h2>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {volumes.map((vol) => (
                <Link
                  key={vol.slug}
                  href={`/ccc/${vol.slug}`}
                  className="group block border border-border rounded-lg p-6 hover:border-accent/40 hover:shadow-md transition-all bg-card"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-md bg-primary flex items-center justify-center shrink-0">
                      <Library className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-serif text-lg font-semibold mb-1 group-hover:text-accent transition-colors">
                        {vol.title}
                      </h3>
                      <p className="text-xs font-sans text-muted-foreground mb-2">
                        {vol.subtitle}
                      </p>
                      <p className="text-sm font-sans text-muted-foreground leading-relaxed line-clamp-2">
                        {vol.description}
                      </p>
                      <div className="mt-3 flex items-center gap-2 text-xs font-sans text-muted-foreground">
                        <span>{vol.chapters.length} chapters</span>
                        <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-accent" />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {showVolumes && showIndependent && <Separator />}

        {/* Posts Feed */}
        {filteredPosts.length > 0 && (
          <section className="py-12 md:py-16">
            <div className="flex items-center gap-2 mb-8">
              <FileText className="w-5 h-5 text-accent" />
              <h2 className="font-serif text-2xl font-semibold">
                {filter === "independent"
                  ? "Independent Insights"
                  : "All Research"}
              </h2>
            </div>

            {isListView ? (
              /* List View — Academic Index */
              <div className="border border-border rounded-lg overflow-hidden">
                <div className="hidden md:grid grid-cols-[1fr_120px_100px_120px] gap-4 px-5 py-3 bg-muted text-[10px] font-sans uppercase tracking-wider text-muted-foreground font-medium">
                  <span>Title</span>
                  <span>Date</span>
                  <span>Read Time</span>
                  <span>Complexity</span>
                </div>
                {filteredPosts.map((post, i) => (
                  <Link
                    key={post.slug}
                    href={`/ccc/${post.slug}`}
                    className={`group grid md:grid-cols-[1fr_120px_100px_120px] gap-2 md:gap-4 px-5 py-4 hover:bg-muted/50 transition-colors ${
                      i < filteredPosts.length - 1 ? "border-b border-border" : ""
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {post.type === "volume-chapter" ? (
                        <Library className="w-4 h-4 text-muted-foreground shrink-0" />
                      ) : (
                        <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
                      )}
                      <span className="font-serif text-sm font-medium truncate group-hover:text-accent transition-colors">
                        {post.title}
                      </span>
                      <div className="hidden lg:flex gap-1.5 shrink-0">
                        {post.tags.map((t) => (
                          <span
                            key={t.label}
                            className={`${t.className} text-[9px] px-1.5 py-0.5 rounded-sm font-sans font-medium uppercase tracking-wider`}
                          >
                            {t.label}
                          </span>
                        ))}
                      </div>
                    </div>
                    <span className="text-xs font-sans text-muted-foreground flex items-center">
                      {post.date}
                    </span>
                    <span className="text-xs font-sans text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {post.readTime}
                    </span>
                    <span className="text-xs font-sans text-muted-foreground flex items-center gap-1">
                      <BarChart3 className="w-3 h-3" />{" "}
                      {post.complexity.split(" ")[0]}
                    </span>
                  </Link>
                ))}
              </div>
            ) : (
              /* Card View */
              <div className="grid md:grid-cols-2 gap-6">
                {filteredPosts.map((post) => (
                  <Link
                    key={post.slug}
                    href={`/ccc/${post.slug}`}
                    className="group block border border-border rounded-lg p-6 hover:border-accent/40 hover:shadow-md transition-all bg-card"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      {post.type === "volume-chapter" ? (
                        <Library className="w-4 h-4 text-muted-foreground" />
                      ) : (
                        <FileText className="w-4 h-4 text-muted-foreground" />
                      )}
                      <div className="flex gap-1.5">
                        {post.tags.map((t) => (
                          <span
                            key={t.label}
                            className={`${t.className} text-[10px] px-2 py-0.5 rounded-sm font-sans font-medium uppercase tracking-wider`}
                          >
                            {t.label}
                          </span>
                        ))}
                      </div>
                    </div>
                    <h3 className="font-serif text-lg font-semibold mb-2 group-hover:text-accent transition-colors leading-snug">
                      {post.title}
                    </h3>
                    <p className="text-sm font-sans text-muted-foreground leading-relaxed mb-4 line-clamp-2">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center gap-3 text-xs font-sans text-muted-foreground">
                      <span>{post.date}</span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {post.readTime}
                      </span>
                      <span>·</span>
                      <Badge
                        variant="outline"
                        className="text-[10px] px-1.5 py-0 h-5 font-sans"
                      >
                        {post.complexity.split(" ")[0]}
                      </Badge>
                      <ArrowRight className="w-3.5 h-3.5 ml-auto opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all text-accent" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>
        )}
      </main>

      <JournalFooter />
    </div>
  );
};

export default JournalHub;
