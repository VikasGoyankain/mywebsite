"use client";

import { useState } from 'react';
import { ChevronDown, GraduationCap, Award, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export interface EducationItem {
  id: string;
  degree: string;
  institution: string;
  year: string;
  grade: string;
  specialization: string;
  achievements: string[];
  image?: string;
  order?: number;
}

interface EducationCardProps {
  education: EducationItem;
  defaultExpanded?: boolean;
}

export function EducationCard({ education, defaultExpanded = false }: EducationCardProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const hasImage = !!education.image;
  const hasExpandableContent = education.specialization || education.achievements?.length > 0;

  return (
    <article
      className={cn(
        'bg-gradient-to-r from-purple-50 to-pink-50 hover:from-pink-50 hover:to-purple-50 transition-all duration-300 ease-out rounded-xl border border-purple-100',
        isExpanded && 'shadow-md'
      )}
    >
      <button
        onClick={() => hasExpandableContent && setIsExpanded(!isExpanded)}
        className={cn(
          "w-full px-5 py-4 text-left flex items-start gap-4",
          hasExpandableContent ? "cursor-pointer" : "cursor-default"
        )}
      >
        {/* Institution Logo/Avatar - Only show if image exists */}
        {hasImage && (
          <Avatar className="w-14 h-14 rounded-lg flex-shrink-0 ring-2 ring-white shadow-md">
            <AvatarImage 
              src={education.image} 
              alt={education.institution}
              className="object-cover"
            />
            <AvatarFallback className="rounded-lg bg-purple-600 text-white text-sm font-bold">
              {education.institution.split(' ').map((word) => word[0]).join('').slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        )}

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="text-base font-bold text-gray-900 leading-tight">
                {education.degree}
              </h3>
              <p className="text-sm text-purple-600 font-semibold mt-0.5">
                {education.institution}
              </p>
            </div>
            {hasExpandableContent && (
              <ChevronDown
                className={cn(
                  'h-4 w-4 text-gray-400 flex-shrink-0 transition-transform duration-200 mt-1',
                  isExpanded && 'rotate-180'
                )}
              />
            )}
          </div>
          
          {/* Meta Info - Always Visible */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-xs text-gray-600">
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {education.year}
            </span>
            {education.grade && (
              <span className="flex items-center gap-1 text-green-600 font-semibold">
                <GraduationCap className="h-3 w-3" />
                {education.grade}
              </span>
            )}
          </div>
        </div>
      </button>

      {/* Expandable Content */}
      {hasExpandableContent && (
        <div
          className={cn(
            'overflow-hidden transition-all duration-300 ease-out',
            isExpanded ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
          )}
        >
          <div className={cn("px-5 pb-4 pt-0", hasImage && "ml-[4.5rem]")}>
            <div className="border-t border-purple-200 pt-3 space-y-3">
              {/* Specialization */}
              {education.specialization && (
                <p className="text-sm text-gray-700 leading-relaxed">
                  {education.specialization}
                </p>
              )}

              {/* Achievements */}
              {education.achievements?.length > 0 && (
                <div className="space-y-1.5">
                  <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Award className="h-3 w-3 text-yellow-500" />
                    Achievements
                  </h4>
                  <ul className="space-y-1">
                    {education.achievements.map((achievement, index) => (
                      <li 
                        key={index} 
                        className="text-sm text-gray-700 flex items-start gap-2"
                      >
                        <Award className="w-3 h-3 text-yellow-500 mt-0.5 flex-shrink-0" />
                        {achievement}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </article>
  );
}
