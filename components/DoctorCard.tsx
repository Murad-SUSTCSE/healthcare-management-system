'use client';

import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, MapPin, Calendar, Sparkles } from 'lucide-react';
import type { Doctor } from '@/types';

interface DoctorCardProps {
  doctor: Doctor;
}

export function DoctorCard({ doctor }: DoctorCardProps) {
  return (
    <Card className="group overflow-hidden border-border/50 bg-card/80 backdrop-blur-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
      {/* Doctor Avatar Background */}
      <div className="relative h-32 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute bottom-0 right-0 w-24 h-24 bg-white/10 rounded-full translate-x-8 translate-y-8 blur-xl"></div>
        <div className="absolute top-4 right-4 flex items-center gap-1 bg-white/20 backdrop-blur-sm rounded-full px-2.5 py-1">
          <Sparkles className="h-3 w-3 text-white" />
          <span className="text-xs font-medium text-white">Available</span>
        </div>
      </div>

      <div className="p-6">
        {/* Rating */}
        <div className="mb-3 flex items-center gap-2">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`h-4 w-4 ${
                i < Math.floor(doctor.rating)
                  ? 'fill-amber-400 text-amber-400'
                  : 'text-gray-200'
              }`}
            />
          ))}
          <span className="text-sm font-bold text-foreground">{doctor.rating}</span>
        </div>

        {/* Doctor Info */}
        <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">{doctor.name}</h3>
        <p className="mt-1 text-sm text-primary font-semibold">{doctor.specialization}</p>
        <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
          <MapPin className="h-3.5 w-3.5" />
          {doctor.hospital}
        </div>

        {/* Available Slots Info */}
        <div className="mt-4 flex items-center gap-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 p-2.5">
          <Calendar className="h-4 w-4 text-indigo-600" />
          <span className="text-xs text-indigo-700 font-semibold">
            {doctor.availableSlots?.length || 0} weekly time slots
          </span>
        </div>

        {/* Book Appointment Button */}
        <Link href={`/appointments/book/${doctor.id}`}>
          <Button className="mt-4 w-full rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-lg shadow-indigo-500/25 group-hover:shadow-xl transition-all">
            Book Appointment
          </Button>
        </Link>
      </div>
    </Card>
  );
}
