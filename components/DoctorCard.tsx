'use client';

import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, MapPin, Calendar } from 'lucide-react';
import type { Doctor } from '@/types';

interface DoctorCardProps {
  doctor: Doctor;
}

export function DoctorCard({ doctor }: DoctorCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all">
      {/* Doctor Avatar Background */}
      <div className="h-32 bg-gradient-to-r from-blue-200 to-green-200"></div>

      <div className="p-6">
        {/* Rating */}
        <div className="mb-3 flex items-center gap-2">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`h-4 w-4 ${
                i < Math.floor(doctor.rating)
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-gray-300'
              }`}
            />
          ))}
          <span className="text-sm font-semibold text-foreground">{doctor.rating}</span>
        </div>

        {/* Doctor Info */}
        <h3 className="text-lg font-bold text-foreground">{doctor.name}</h3>
        <p className="mt-1 text-sm text-primary font-semibold">{doctor.specialization}</p>
        <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="h-3 w-3" />
          {doctor.hospital}
        </div>

        {/* Available Slots Info */}
        <div className="mt-4 flex items-center gap-2 rounded-lg bg-blue-50 p-2">
          <Calendar className="h-4 w-4 text-blue-600" />
          <span className="text-xs text-blue-700 font-semibold">
            {doctor.availableSlots?.length || 0} slots available
          </span>
        </div>

        {/* Book Appointment Button */}
        <Link href={`/appointments/book/${doctor.id}`}>
          <Button className="mt-4 w-full rounded-lg">
            Book Appointment
          </Button>
        </Link>
      </div>
    </Card>
  );
}
