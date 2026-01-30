"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Search,
  X,
  ArrowDown,
  ArrowUp,
  Tag,
  SlidersHorizontal,
  Sparkles,
  Clock,
  TrendingUp,
  Calendar,
  Command,
  Filter,
  ChevronDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export type SortOption = 'newest' | 'oldest' | 'popular' | 'trending';

interface SmartSearchProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedTag: string | null;
  onTagSelect: (tag: string | null) => void;
  availableTags: string[];
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  totalResults: number;
  className?: string;
}

const SORT_OPTIONS: { value: SortOption; label: string; icon: React.ElementType }[] = [
  { value: 'newest', label: 'Newest First', icon: Clock },
  { value: 'oldest', label: 'Oldest First', icon: Calendar },
  { value: 'popular', label: 'Most Popular', icon: TrendingUp },
  { value: 'trending', label: 'Trending', icon: Sparkles },
];

export function SmartSearch({
  searchQuery,
  onSearchChange,
  selectedTag,
  onTagSelect,
  availableTags,
  sortBy,
  onSortChange,
  totalResults,
  className,
}: SmartSearchProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [showTagsDropdown, setShowTagsDropdown] = useState(false);
  const [focusedTagIndex, setFocusedTagIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const sortDropdownRef = useRef<HTMLDivElement>(null);
  const tagsDropdownRef = useRef<HTMLDivElement>(null);

  // Keyboard shortcut: Cmd/Ctrl + K to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        setIsExpanded(true);
      }
      // Escape to close
      if (e.key === 'Escape') {
        setIsExpanded(false);
        setShowSortDropdown(false);
        setShowTagsDropdown(false);
        inputRef.current?.blur();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(e.target as Node)) {
        setShowSortDropdown(false);
      }
      if (tagsDropdownRef.current && !tagsDropdownRef.current.contains(e.target as Node)) {
        setShowTagsDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const clearAll = useCallback(() => {
    onSearchChange('');
    onTagSelect(null);
    onSortChange('newest');
    setIsExpanded(false);
  }, [onSearchChange, onTagSelect, onSortChange]);

  const hasActiveFilters = searchQuery || selectedTag || sortBy !== 'newest';
  const currentSort = SORT_OPTIONS.find((s) => s.value === sortBy) || SORT_OPTIONS[0];

  return (
    <div className={cn('relative', className)} ref={containerRef}>
      {/* Main Search Container */}
      <motion.div
        layout
        className={cn(
          'relative bg-card/80 backdrop-blur-xl border border-border/60 rounded-xl sm:rounded-2xl transition-all duration-300',
          'shadow-sm hover:shadow-md',
          isExpanded && 'shadow-lg ring-2 ring-primary/20',
          // Allow dropdowns to overflow
          'overflow-visible'
        )}
        style={{ zIndex: 40 }}
      >
        {/* Search Input Row */}
        <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3">
          {/* Search Icon */}
          <Search
            className={cn(
              'w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 transition-colors duration-200',
              isExpanded ? 'text-primary' : 'text-muted-foreground'
            )}
          />

          {/* Input */}
          <input
            ref={inputRef}
            type="text"
            placeholder="Search articles..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            onFocus={() => setIsExpanded(true)}
            className={cn(
              'flex-1 bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground/70',
              'text-sm sm:text-base'
            )}
          />

          {/* Keyboard Shortcut Hint */}
          <AnimatePresence>
            {!isExpanded && !searchQuery && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="hidden sm:flex items-center gap-1 px-2 py-1 bg-muted/60 rounded-lg text-xs text-muted-foreground"
              >
                <Command className="w-3 h-3" />
                <span>K</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Clear Button */}
          <AnimatePresence>
            {searchQuery && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={() => onSearchChange('')}
                className="p-1.5 rounded-full hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-4 h-4" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {/* Expanded Controls */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="px-3 sm:px-4 pb-3 sm:pb-4 pt-1 border-t border-border/40">
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                  {/* Sort Dropdown */}
                  <div className="relative" ref={sortDropdownRef}>
                    <button
                      onClick={() => {
                        setShowSortDropdown(!showSortDropdown);
                        setShowTagsDropdown(false);
                      }}
                      className={cn(
                        'flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium transition-all duration-200',
                        'bg-muted/50 hover:bg-muted text-foreground',
                        showSortDropdown && 'bg-primary/10 text-primary'
                      )}
                    >
                      <currentSort.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      <span className="hidden sm:inline">{currentSort.label}</span>
                      <ChevronDown
                        className={cn(
                          'w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform duration-200',
                          showSortDropdown && 'rotate-180'
                        )}
                      />
                    </button>

                    {/* Sort Options */}
                    <AnimatePresence>
                      {showSortDropdown && (
                        <motion.div
                          initial={{ opacity: 0, y: -10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -10, scale: 0.95 }}
                          transition={{ duration: 0.15 }}
                          className="absolute top-full left-0 mt-2 w-40 sm:w-48 bg-card border border-border/60 rounded-lg sm:rounded-xl shadow-lg overflow-hidden z-50"
                        >
                          {SORT_OPTIONS.map((option) => (
                            <button
                              key={option.value}
                              onClick={() => {
                                onSortChange(option.value);
                                setShowSortDropdown(false);
                              }}
                              className={cn(
                                'flex items-center gap-2 sm:gap-3 w-full px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-left transition-colors',
                                'hover:bg-muted/60',
                                sortBy === option.value && 'bg-primary/10 text-primary'
                              )}
                            >
                              <option.icon className="w-4 h-4" />
                              <span>{option.label}</span>
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Tags Dropdown */}
                  <div className="relative" ref={tagsDropdownRef}>
                    <button
                      onClick={() => {
                        setShowTagsDropdown(!showTagsDropdown);
                        setShowSortDropdown(false);
                      }}
                      className={cn(
                        'flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium transition-all duration-200',
                        'bg-muted/50 hover:bg-muted text-foreground',
                        (showTagsDropdown || selectedTag) && 'bg-primary/10 text-primary'
                      )}
                    >
                      <Tag className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      <span className="hidden sm:inline">
                        {selectedTag || 'All Topics'}
                      </span>
                      <ChevronDown
                        className={cn(
                          'w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform duration-200',
                          showTagsDropdown && 'rotate-180'
                        )}
                      />
                    </button>

                    {/* Tags Options */}
                    <AnimatePresence>
                      {showTagsDropdown && (
                        <motion.div
                          initial={{ opacity: 0, y: -10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -10, scale: 0.95 }}
                          transition={{ duration: 0.15 }}
                          className="absolute top-full left-0 mt-2 w-48 sm:w-56 max-h-56 sm:max-h-64 overflow-y-auto bg-card border border-border/60 rounded-lg sm:rounded-xl shadow-lg z-50"
                        >
                          <button
                            onClick={() => {
                              onTagSelect(null);
                              setShowTagsDropdown(false);
                            }}
                            className={cn(
                              'flex items-center gap-2 sm:gap-3 w-full px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-left transition-colors',
                              'hover:bg-muted/60',
                              !selectedTag && 'bg-primary/10 text-primary'
                            )}
                          >
                            <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            <span>All Topics</span>
                          </button>
                          <div className="h-px bg-border/60" />
                          {availableTags.map((tag) => (
                            <button
                              key={tag}
                              onClick={() => {
                                onTagSelect(tag);
                                setShowTagsDropdown(false);
                              }}
                              className={cn(
                                'flex items-center gap-2 sm:gap-3 w-full px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-left transition-colors',
                                'hover:bg-muted/60',
                                selectedTag === tag && 'bg-primary/10 text-primary'
                              )}
                            >
                              <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-primary/60" />
                              <span className="capitalize">{tag}</span>
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Clear All Filters */}
                  <AnimatePresence>
                    {hasActiveFilters && (
                      <motion.button
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        onClick={clearAll}
                        className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium text-red-500 hover:bg-red-500/10 transition-colors"
                      >
                        <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        <span className="hidden sm:inline">Clear</span>
                      </motion.button>
                    )}
                  </AnimatePresence>

                  {/* Results Count */}
                  <div className="ml-auto text-xs sm:text-sm text-muted-foreground">
                    {totalResults} {totalResults === 1 ? 'result' : 'results'}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Quick Tags (visible when not expanded) */}
      <AnimatePresence>
        {!isExpanded && availableTags.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex flex-wrap gap-1.5 sm:gap-2 mt-3 sm:mt-4"
          >
            <button
              onClick={() => onTagSelect(null)}
              className={cn(
                'px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all duration-200',
                'border',
                !selectedTag
                  ? 'bg-primary/10 border-primary/30 text-primary'
                  : 'bg-transparent border-border/60 text-muted-foreground hover:border-primary/30 hover:text-primary'
              )}
            >
              All
            </button>
            {availableTags.slice(0, 4).map((tag) => (
              <button
                key={tag}
                onClick={() => onTagSelect(selectedTag === tag ? null : tag)}
                className={cn(
                  'px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all duration-200',
                  'border',
                  selectedTag === tag
                    ? 'bg-primary/10 border-primary/30 text-primary'
                    : 'bg-transparent border-border/60 text-muted-foreground hover:border-primary/30 hover:text-primary'
                )}
              >
                {tag}
              </button>
            ))}
            {availableTags.length > 4 && (
              <button
                onClick={() => {
                  inputRef.current?.focus();
                  setIsExpanded(true);
                  setShowTagsDropdown(true);
                }}
                className="px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
              >
                +{availableTags.length - 4} more
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active Filter Pills (visible when collapsed with filters) */}
      <AnimatePresence>
        {!isExpanded && hasActiveFilters && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="flex flex-wrap items-center gap-1.5 sm:gap-2 mt-2 sm:mt-3"
          >
            {searchQuery && (
              <span className="inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                <Search className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                &quot;{searchQuery}&quot;
                <button onClick={() => onSearchChange('')} className="ml-0.5 sm:ml-1 hover:text-primary/80">
                  <X className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                </button>
              </span>
            )}
            {sortBy !== 'newest' && (
              <span className="inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium bg-muted text-foreground border border-border/60">
                <currentSort.icon className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                {currentSort.label}
                <button onClick={() => onSortChange('newest')} className="ml-0.5 sm:ml-1 hover:text-muted-foreground">
                  <X className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                </button>
              </span>
            )}
            <span className="text-[10px] sm:text-xs text-muted-foreground ml-1 sm:ml-2">
              {totalResults} found
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
