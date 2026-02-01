'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, MapPin, Phone, Mail, Heart } from 'lucide-react';
import type { Hospital } from '@/types';
import { useState } from 'react';

interface HospitalCardProps {
  hospital: Hospital;
  isSelected?: boolean;
  onSelect?: (id: string) => void;
}

export function HospitalCard({
  hospital,
  isSelected,
  onSelect,
}: HospitalCardProps) {
  const [isFavorited, setIsFavorited] = useState(false);

  return (
    <Card
      className={`cursor-pointer overflow-hidden transition-all hover:shadow-lg ${
        isSelected ? 'ring-2 ring-primary' : ''
      }`}
      onClick={() => onSelect?.(hospital.id)}
    >
      {/* Image placeholder */}
      <div className="h-32 bg-gradient-to-r from-blue-200 to-green-200"></div>

      <div className="p-6">
        {/* Header with favorite button */}
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-bold text-foreground">{hospital.name}</h3>
            <div className="mt-2 flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-semibold text-foreground">
                {hospital.rating}
              </span>
            </div>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsFavorited(!isFavorited);
            }}
            className={`rounded-full p-2 transition-colors ${
              isFavorited
                ? 'bg-red-100 text-red-600'
                : 'bg-gray-100 text-gray-600 hover:bg-red-100 hover:text-red-600'
            }`}
          >
            <Heart className="h-5 w-5" />
          </button>
        </div>

        {/* Location */}
        <div className="mt-4 flex items-start gap-2">
          <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
          <div>
            <p className="text-sm text-foreground">{hospital.address}</p>
            <p className="text-xs text-muted-foreground">{hospital.city}</p>
          </div>
        </div>

        {/* Contact Info */}
        <div className="mt-4 space-y-2 border-t border-border pt-4">
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <a href={`tel:${hospital.phone}`} className="text-sm text-primary hover:underline">
              {hospital.phone}
            </a>
          </div>
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <a href={`mailto:${hospital.email}`} className="text-sm text-primary hover:underline">
              {hospital.email}
            </a>
          </div>
        </div>

        {/* Departments */}
        <div className="mt-4">
          <p className="text-xs font-semibold text-muted-foreground">DEPARTMENTS</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {hospital.departments.slice(0, 3).map((dept) => (
              <span
                key={dept}
                className="rounded-full bg-blue-100 px-3 py-1 text-xs text-blue-700"
              >
                {dept}
              </span>
            ))}
            {hospital.departments.length > 3 && (
              <span className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600">
                +{hospital.departments.length - 3} more
              </span>
            )}
          </div>
        </div>

        {/* Emergency Service Badge */}
        {hospital.emergencyService && (
          <div className="mt-4 flex items-center gap-2 rounded-lg bg-red-50 p-2">
            <div className="h-2 w-2 rounded-full bg-red-600"></div>
            <span className="text-xs font-semibold text-red-700">
              24/7 Emergency Service Available
            </span>
          </div>
        )}

        {/* Button */}
        <Button
          variant={isSelected ? 'default' : 'outline'}
          className="mt-4 w-full rounded-lg"
        >
          {isSelected ? 'Selected' : 'Get Directions'}
        </Button>
      </div>
    </Card>
  );
}
