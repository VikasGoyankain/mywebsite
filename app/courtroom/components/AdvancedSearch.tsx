'use client'

import React, { useState, useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface AdvancedSearchProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  suggestions: string[];
  onSuggestionSelect: (suggestion: string) => void;
}

const AdvancedSearch: React.FC<AdvancedSearchProps> = ({
  searchQuery,
  onSearchChange,
  suggestions,
  onSuggestionSelect
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);

  // Filter suggestions based on search query
  useEffect(() => {
    if (searchQuery.length > 0) {
      const filtered = suggestions.filter(suggestion =>
        suggestion.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 5); // Limit to 5 suggestions
      setFilteredSuggestions(filtered);
    } else {
      setFilteredSuggestions([]);
    }
  }, [searchQuery, suggestions]);

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setIsFocused(false);
    }
  };

  const handleClear = () => {
    onSearchChange('');
  };

  return (
    <div className="relative w-full max-w-3xl mx-auto" ref={searchRef}>
      <div className="relative">
        <div className="relative flex items-center">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/70" />
          <Input
            type="text"
            placeholder="Search by case name, citation, legal area, court..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onKeyDown={handleKeyDown}
            className="pl-12 pr-10 py-6 bg-white/10 border-white/20 text-white placeholder:text-white/60 text-lg rounded-full shadow-lg focus:bg-white/15 focus:border-white/30"
          />
          {searchQuery && (
            <button
              onClick={handleClear}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/70 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        <Button
          type="submit"
          className="absolute right-1.5 top-1/2 transform -translate-y-1/2 rounded-full px-6 py-5"
        >
          Search
        </Button>
      </div>

      {/* Suggestions dropdown */}
      {isFocused && filteredSuggestions.length > 0 && (
        <Card className="absolute mt-2 w-full z-50 border border-border/50 shadow-lg overflow-hidden">
          <ul className="py-2 max-h-60 overflow-auto">
            {filteredSuggestions.map((suggestion, index) => (
              <li
                key={index}
                className="px-4 py-2 hover:bg-accent cursor-pointer flex items-center"
                onClick={() => {
                  onSuggestionSelect(suggestion);
                  setIsFocused(false);
                }}
              >
                <Search className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>{suggestion}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
};

export default AdvancedSearch; 