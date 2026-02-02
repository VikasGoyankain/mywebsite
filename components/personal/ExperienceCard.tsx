"use client";

import { useState } from 'react';
import { ChevronDown, MapPin, Calendar, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export interface ExperienceItem {
  id: string;
  title: string;
  company: string;
  duration: string;
  location: string;
  description: string;
  type: string;
  image?: string;
  order?: number;
}

interface ExperienceCardProps {
  experience: ExperienceItem;
  defaultExpanded?: boolean;
}

export function ExperienceCard({ experience, defaultExpanded = false }: ExperienceCardProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const hasImage = !!experience.image;

  return (
    <article
      className={cn(
        'bg-gradient-to-r from-gray-50 to-blue-50 hover:from-blue-50 hover:to-purple-50 transition-all duration-300 ease-out rounded-xl border border-gray-100',
        isExpanded && 'shadow-md'
      )}
    >
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-5 py-4 text-left flex items-start gap-4"
      >
        {/* Company Logo/Avatar - Only show if image exists */}
        {hasImage && (
          <Avatar className="w-14 h-14 rounded-lg flex-shrink-0 ring-2 ring-white shadow-md">
            <AvatarImage 
              src={experience.image} 
              alt={experience.company}
              className="object-cover"
            />
            <AvatarFallback className="rounded-lg bg-blue-600 text-white text-sm font-bold">
              {experience.company.split(' ').map((word) => word[0]).join('').slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        )}

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="text-base font-bold text-gray-900 leading-tight">
                {experience.title}
              </h3>
              <p className="text-sm text-blue-600 font-semibold mt-0.5">
                {experience.company}
              </p>
            </div>
            <ChevronDown
              className={cn(
                'h-4 w-4 text-gray-400 flex-shrink-0 transition-transform duration-200 mt-1',
                isExpanded && 'rotate-180'
              )}
            />
          </div>
          
          {/* Meta Info - Always Visible */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-xs text-gray-600">
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {experience.duration}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {experience.location}
            </span>
            {experience.type && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                {experience.type}
              </span>
            )}
          </div>
        </div>
      </button>

      {/* Expandable Content */}
      <div
        className={cn(
          'overflow-hidden transition-all duration-300 ease-out',
          isExpanded ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
        )}
      >
        <div className={cn("px-5 pb-4 pt-0", hasImage && "ml-[4.5rem]")}>
          <div className="border-t border-gray-200 pt-3">
            <p className="text-sm text-gray-700 leading-relaxed">
              {experience.description}
            </p>
          </div>
        </div>
      </div>
    </article>
  );
}
