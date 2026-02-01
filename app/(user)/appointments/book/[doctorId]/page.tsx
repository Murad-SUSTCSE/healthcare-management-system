'use client';

import React from "react"

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar, Clock, AlertCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { apiService } from '@/services/api';
import type { Doctor } from '@/types';

interface AvailabilitySlot {
  id: number;
  doctorId: number;
  date: string;
  startTime: string;
  endTime: string;
  isBooked: boolean;
}

export default function BookAppointmentPage() {
  const router = useRouter();
  const params = useParams();
  const doctorId = params.doctorId as string;

  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [availableSlots, setAvailableSlots] = useState<AvailabilitySlot[]>([]);
  const [isLoadingDoctor, setIsLoadingDoctor] = useState(true);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState<AvailabilitySlot | null>(null);
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch doctor data
  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        setIsLoadingDoctor(true);
        const data = await apiService.getDoctor(doctorId);
        setDoctor(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load doctor information');
      } finally {
        setIsLoadingDoctor(false);
      }
    };

    if (doctorId) {
      fetchDoctor();
    }
  }, [doctorId]);

  // Fetch available slots when date is selected
  useEffect(() => {
    const fetchSlots = async () => {
      if (!selectedDate || !doctorId) return;
      
      try {
        setIsLoadingSlots(true);
        const slots = await apiService.getPublicDoctorAvailability(parseInt(doctorId), selectedDate);
        setAvailableSlots(slots);
        setSelectedSlot(null); // Reset selected slot when date changes
      } catch (err) {
        console.error('Failed to fetch slots:', err);
        setAvailableSlots([]);
      } finally {
        setIsLoadingSlots(false);
      }
    };

    fetchSlots();
  }, [selectedDate, doctorId]);

  // Generate next 14 days
  const getNextDays = () => {
    const days = [];
    const today = new Date();
    for (let i = 1; i <= 14; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      days.push(date);
    }
    return days;
  };

  const nextDays = getNextDays();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!selectedDate || !selectedSlot) {
      setError('Please select both date and time slot');
      return;
    }

    setIsLoading(true);
    try {
      // Create proper ISO date string with time
      const [hours, minutes] = selectedSlot.startTime.split(':');
      const appointmentDate = new Date(selectedDate);
      appointmentDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      
      await apiService.bookAppointment({
        doctorId,
        date: appointmentDate.toISOString(),
        time: selectedSlot.startTime,
        slotId: selectedSlot.id,
        notes,
      });

      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to book appointment');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingDoctor) {
    return (
      <div className="flex h-96 items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="text-center">
          <Loader2 className="mx-auto h-12 w-12 text-primary animate-spin" />
          <p className="mt-4 text-lg text-muted-foreground">Loading doctor information...</p>
        </div>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="space-y-6 p-4 sm:p-6 lg:p-8">
        <Link href="/appointments">
          <button className="flex items-center gap-2 text-primary hover:underline">
            <ArrowLeft className="h-4 w-4" />
            Back to Doctors
          </button>
        </Link>
        <Card className="p-12 text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
          <p className="mt-4 text-lg text-red-600">{error || 'Doctor not found'}</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Back Button */}
      <Link href="/appointments">
        <button className="flex items-center gap-2 text-primary hover:underline">
          <ArrowLeft className="h-4 w-4" />
          Back to Doctors
        </button>
      </Link>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Doctor Information */}
        <Card className="lg:col-span-1 p-6">
          <h2 className="text-lg font-bold text-foreground">Doctor Details</h2>
          <div className="mt-6 space-y-4">
            <div className="h-24 rounded-lg bg-gradient-to-r from-blue-200 to-green-200"></div>
            <div>
              <p className="text-sm text-muted-foreground">Name</p>
              <p className="font-semibold text-foreground">{doctor.name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Specialization</p>
              <p className="font-semibold text-primary">{doctor.specialization}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Hospital</p>
              <p className="font-semibold text-foreground">{doctor.hospital}</p>
            </div>
          </div>
        </Card>

        {/* Booking Form */}
        <Card className="lg:col-span-2 p-6">
          <h2 className="text-lg font-bold text-foreground">Schedule Appointment</h2>

          {error && (
            <div className="mt-4 flex gap-3 rounded-lg bg-red-50 p-4 text-sm text-red-600">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-6">
            {/* Date Selection */}
            <div>
              <label className="mb-3 flex items-center gap-2 font-semibold text-foreground">
                <Calendar className="h-5 w-5 text-primary" />
                Select Date
              </label>
              <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
                {nextDays.map((date) => {
                  const dateStr = date.toISOString().split('T')[0];
                  const dayName = date.toLocaleDateString('en-US', {
                    weekday: 'short',
                  });
                  const dayNum = date.getDate();

                  return (
                    <button
                      key={dateStr}
                      type="button"
                      onClick={() => setSelectedDate(dateStr)}
                      className={`rounded-lg py-3 text-center transition-all ${
                        selectedDate === dateStr
                          ? 'bg-primary text-white ring-2 ring-primary ring-offset-2'
                          : 'border border-border bg-background hover:border-primary'
                      }`}
                    >
                      <p className="text-xs font-semibold">{dayName}</p>
                      <p className="text-sm font-bold">{dayNum}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Time Selection */}
            {selectedDate && (
              <div>
                <label className="mb-3 flex items-center gap-2 font-semibold text-foreground">
                  <Clock className="h-5 w-5 text-primary" />
                  Select Time Slot (30 min)
                </label>
                {isLoadingSlots ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    <span className="ml-2 text-muted-foreground">Loading available slots...</span>
                  </div>
                ) : availableSlots.length > 0 ? (
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                    {availableSlots.map((slot) => (
                      <button
                        key={slot.id}
                        type="button"
                        onClick={() => setSelectedSlot(slot)}
                        className={`rounded-lg py-3 px-3 text-sm font-semibold transition-all ${
                          selectedSlot?.id === slot.id
                            ? 'bg-primary text-white ring-2 ring-primary ring-offset-2'
                            : 'border border-border bg-background hover:border-primary hover:bg-muted'
                        }`}
                      >
                        {slot.startTime} - {slot.endTime}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-lg bg-amber-50 p-4 text-center">
                    <Clock className="mx-auto h-8 w-8 text-amber-500" />
                    <p className="mt-2 text-sm text-amber-700">
                      No available slots for this date. Please select another date.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Notes */}
            <div>
              <label className="mb-2 block font-semibold text-foreground">
                Notes (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any additional information for the doctor..."
                className="w-full rounded-lg border border-border bg-background p-3 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                rows={4}
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <Button
                type="submit"
                disabled={isLoading || !selectedDate || !selectedSlot}
                className="flex-1 rounded-lg"
              >
                {isLoading ? 'Booking...' : 'Confirm Appointment'}
              </Button>
              <Link href="/appointments" className="flex-1">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full rounded-lg border-2 bg-transparent"
                >
                  Cancel
                </Button>
              </Link>
            </div>
          </form>

          {/* Info Box */}
          <div className="mt-6 rounded-lg bg-blue-50 p-4">
            <p className="text-sm text-blue-900">
              ℹ️ You will receive a confirmation email and SMS with your appointment details.
              You can reschedule or cancel up to 24 hours before the appointment.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
