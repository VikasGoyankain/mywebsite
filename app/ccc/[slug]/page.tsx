"use client";

import { use } from "react";
import { notFound } from "next/navigation";
import { getVolume, getPost } from "@/lib/ccc/journal";
import VolumePage from "@/components/ccc/VolumePage";
import ArticlePage from "@/components/ccc/ArticlePage";

interface Props {
  params: Promise<{ slug: string }>;
}

export default function JournalSlugPage({ params }: Props) {
  const { slug } = use(params);

  if (!slug) return notFound();

  // Check if it's a volume first
  if (getVolume(slug)) return <VolumePage slug={slug} />;

  // Then check articles
  if (getPost(slug)) return <ArticlePage slug={slug} />;

  return notFound();
}
