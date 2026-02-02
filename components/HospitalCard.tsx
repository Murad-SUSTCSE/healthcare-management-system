'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, MapPin, Phone, Mail, Heart, Building2 } from 'lucide-react';
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
      className={`group cursor-pointer overflow-hidden border-border/50 bg-card/80 backdrop-blur-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
        isSelected ? 'ring-2 ring-primary shadow-lg shadow-primary/20' : ''
      }`}
      onClick={() => onSelect?.(hospital.id)}
    >
      {/* Image placeholder */}
      <div className="relative h-32 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute bottom-0 right-0 w-24 h-24 bg-white/10 rounded-full translate-x-8 translate-y-8 blur-xl"></div>
        <div className="absolute top-4 left-4 bg-white/20 backdrop-blur-sm rounded-xl p-2">
          <Building2 className="h-5 w-5 text-white" />
        </div>
      </div>

      <div className="p-6">
        {/* Header with favorite button */}
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">{hospital.name}</h3>
            <div className="mt-2 flex items-center gap-1">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              <span className="text-sm font-bold text-foreground">
                {hospital.rating}
              </span>
            </div>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsFavorited(!isFavorited);
            }}
            className={`rounded-full p-2.5 transition-all ${
              isFavorited
                ? 'bg-rose-100 text-rose-600 shadow-lg shadow-rose-500/20'
                : 'bg-gray-100 text-gray-500 hover:bg-rose-100 hover:text-rose-600'
            }`}
          >
            <Heart className={`h-5 w-5 ${isFavorited ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Location */}
        <div className="mt-4 flex items-start gap-2">
          <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-600" />
          <div>
            <p className="text-sm text-foreground">{hospital.address}</p>
            <p className="text-xs text-muted-foreground">{hospital.city}</p>
          </div>
        </div>

        {/* Contact Info */}
        <div className="mt-4 space-y-2 border-t border-border/50 pt-4">
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
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">DEPARTMENTS</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {hospital.departments.slice(0, 3).map((dept) => (
              <span
                key={dept}
                className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 text-xs font-medium text-emerald-700"
              >
                {dept}
              </span>
            ))}
            {hospital.departments.length > 3 && (
              <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                +{hospital.departments.length - 3} more
              </span>
            )}
          </div>
        </div>

        {/* Emergency Service Badge */}
        {hospital.emergencyService && (
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-rose-500/10 border border-rose-500/20 p-2.5">
            <div className="h-2 w-2 rounded-full bg-rose-600 animate-pulse"></div>
            <span className="text-xs font-semibold text-rose-700">
              24/7 Emergency Service Available
            </span>
          </div>
        )}

        {/* Button */}
        <Button
          variant={isSelected ? 'default' : 'outline'}
          className={`mt-4 w-full rounded-xl transition-all ${
            isSelected 
              ? 'bg-gradient-to-r from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/25' 
              : 'hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-700'
          }`}
        >
          {isSelected ? 'Selected' : 'Get Directions'}
        </Button>
      </div>
    </Card>
  );
}
