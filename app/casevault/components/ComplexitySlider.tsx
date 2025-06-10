'use client'

import React from 'react';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Star } from 'lucide-react';

interface ComplexitySliderProps {
  value: number[];
  onValueChange: (value: number[]) => void;
}

const ComplexitySlider: React.FC<ComplexitySliderProps> = ({ value, onValueChange }) => {
  const getComplexityLabel = (rating: number) => {
    switch (rating) {
      case 1: return 'Simple';
      case 2: return 'Easy';
      case 3: return 'Moderate';
      case 4: return 'Complex';
      case 5: return 'Very Complex';
      default: return 'Any';
    }
  };

  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium">Complexity Rating</Label>
      <div className="space-y-4">
        <Slider
          value={value}
          onValueChange={onValueChange}
          max={5}
          min={1}
          step={1}
          className="w-full"
        />
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>1</span>
          <div className="flex items-center gap-1">
            {Array.from({ length: value[0] }, (_, i) => (
              <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />
            ))}
            <span className="ml-2 font-medium text-foreground">
              {getComplexityLabel(value[0])}
            </span>
          </div>
          <span>5</span>
        </div>
      </div>
    </div>
  );
};

export default ComplexitySlider; 