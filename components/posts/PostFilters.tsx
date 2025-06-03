"use client"

import React from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface PostFiltersProps {
  activeFilter: string;
  onFilterChange: (filter: string) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
}

export const PostFilters: React.FC<PostFiltersProps> = ({
  activeFilter,
  onFilterChange,
  sortBy,
  onSortChange,
}) => {
  const filters = [
    { id: 'all', label: 'All Content' },
    { id: 'text', label: 'Articles' },
    { id: 'image', label: 'Images' },
    { id: 'video', label: 'Videos' },
  ];

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {filters.map((filter) => (
          <Button
            key={filter.id}
            variant={activeFilter === filter.id ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onFilterChange(filter.id)}
            className={`transition-all duration-200 font-medium ${
              activeFilter === filter.id
                ? 'bg-gray-900 text-white shadow-md hover:bg-gray-800'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 border border-gray-300'
            }`}
          >
            {filter.label}
          </Button>
        ))}
      </div>

      {/* Sort Options */}
      <div className="flex items-center space-x-3">
        <span className="text-sm font-medium text-gray-700">Sort by:</span>
        <Select value={sortBy} onValueChange={onSortChange}>
          <SelectTrigger className="w-36 bg-white border-gray-300">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-white border-gray-200">
            <SelectItem value="recent">Most Recent</SelectItem>
            <SelectItem value="popular">Most Popular</SelectItem>
            <SelectItem value="category">By Category</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};