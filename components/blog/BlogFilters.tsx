"use client";

import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, X, SlidersHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BlogFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  sortBy: string;
  onSortChange: (value: string) => void;
  selectedTag: string | null;
  onTagChange: (tag: string | null) => void;
  availableTags: string[];
  totalPosts: number;
  filteredCount: number;
}

export function BlogFilters({
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  selectedTag,
  onTagChange,
  availableTags,
  totalPosts,
  filteredCount,
}: BlogFiltersProps) {
  const hasActiveFilters = searchQuery || selectedTag;

  return (
    <div className="space-y-4">
      {/* Search and Sort Row */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
          <Input
            type="text"
            placeholder="Search posts…"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 pr-10 h-11 bg-white border-gray-200 focus:border-gray-300 focus:ring-0 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-muted-foreground transition-colors"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Sort Dropdown */}
        <Select value={sortBy} onValueChange={onSortChange}>
          <SelectTrigger className="w-full sm:w-40 h-11 bg-white border-gray-200">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest first</SelectItem>
            <SelectItem value="oldest">Oldest first</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tags Filter */}
      {availableTags.length > 0 && (
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-sm text-muted-foreground/60 mr-1">
            <SlidersHorizontal className="inline-block w-3.5 h-3.5 mr-1" />
            Filter:
          </span>
          <button
            onClick={() => onTagChange(null)}
            className={cn(
              "text-sm px-3 py-1 rounded-full transition-all duration-200",
              !selectedTag
                ? "bg-foreground text-background"
                : "bg-gray-100 text-muted-foreground hover:bg-gray-200"
            )}
          >
            All
          </button>
          {availableTags.slice(0, 8).map((tag) => (
            <button
              key={tag}
              onClick={() => onTagChange(selectedTag === tag ? null : tag)}
              className={cn(
                "text-sm px-3 py-1 rounded-full transition-all duration-200",
                selectedTag === tag
                  ? "bg-foreground text-background"
                  : "bg-gray-100 text-muted-foreground hover:bg-gray-200"
              )}
            >
              {tag}
            </button>
          ))}
          {availableTags.length > 8 && (
            <span className="text-xs text-muted-foreground/50">
              +{availableTags.length - 8} more
            </span>
          )}
        </div>
      )}

      {/* Results Count & Clear Filters */}
      {hasActiveFilters && (
        <div className="flex items-center justify-between text-sm text-muted-foreground/70 pt-2 border-t border-gray-100">
          <span>
            Showing {filteredCount} of {totalPosts} posts
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              onSearchChange('');
              onTagChange(null);
            }}
            className="text-muted-foreground/70 hover:text-foreground h-auto py-1 px-2"
          >
            Clear filters
          </Button>
        </div>
      )}
    </div>
  );
}
