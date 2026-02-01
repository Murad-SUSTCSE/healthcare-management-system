'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { WelcomeHeader } from '@/components/WelcomeHeader';
import { QuickActionCard } from '@/components/QuickActionCard';
import { Card } from '@/components/ui/card';
import {
  Calendar,
  MapPin,
  Pill,
  Ambulance,
  Clock,
  CheckCircle,
  Loader2,
} from 'lucide-react';
import { apiService } from '@/services/api';
import type { Appointment } from '@/types';

export default function DashboardPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [allAppointments, setAllAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setIsLoading(true);
        const data = await apiService.getAppointments();
        setAllAppointments(data);
        // Filter to only upcoming appointments (exclude completed and cancelled)
        const upcoming = data.filter(
          (apt) => new Date(apt.date) >= new Date() && apt.status !== 'cancelled' && apt.status !== 'completed'
        );
        setAppointments(upcoming.slice(0, 3)); // Show max 3
      } catch (err) {
        console.error('Failed to fetch appointments:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  // Calculate stats from real data
  const upcomingCount = allAppointments.filter(
    (apt) => new Date(apt.date) >= new Date() && apt.status !== 'cancelled' && apt.status !== 'completed'
  ).length;
  const completedCount = allAppointments.filter(
    (apt) => apt.status === 'completed'
  ).length;
  
  // Past/completed appointments
  const pastAppointments = allAppointments.filter(
    (apt) => apt.status === 'completed'
  ).slice(0, 3);
  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Welcome Header */}
      <WelcomeHeader />

      {/* Quick Actions */}
      <div>
        <h2 className="mb-4 text-2xl font-bold text-foreground">Quick Actions</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <QuickActionCard
            icon={Calendar}
            title="Book Appointment"
            description="Schedule a visit with expert doctors"
            href="/appointments"
            color="blue"
          />
          <QuickActionCard
            icon={MapPin}
            title="Find Hospitals"
            description="Locate nearby healthcare facilities"
            href="/hospitals"
            color="green"
          />
          <QuickActionCard
            icon={Pill}
            title="Order Medicine"
            description="Get medicines delivered to your home"
            href="/medicine"
            color="orange"
          />
          <QuickActionCard
            icon={Ambulance}
            title="Ambulance Service"
            description="Emergency transport 24/7 availability"
            href="/ambulance"
            color="red"
          />
        </div>
      </div>

      {/* Recent Appointments & Stats */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Appointments */}
        <Card className="lg:col-span-2 p-6">
          <h3 className="text-lg font-semibold text-foreground">Upcoming Appointments</h3>
          <div className="mt-6 space-y-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
              </div>
            ) : appointments.length > 0 ? (
              appointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="flex items-start gap-4 rounded-lg border border-border p-4 hover:bg-muted transition-colors"
                >
                  <div className="rounded-full bg-blue-100 p-3">
                    <Calendar className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-foreground">
                      {appointment.doctorName || appointment.doctor?.name || 'Doctor'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {appointment.specialty || appointment.doctor?.specialization || 'General'}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {new Date(appointment.date).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                      })}, {appointment.time}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1">
                    <Clock className="h-4 w-4 text-amber-600" />
                    <span className="text-xs font-semibold text-amber-600">
                      {appointment.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-muted-foreground">
                <Calendar className="mx-auto h-12 w-12 opacity-50" />
                <p className="mt-2">No upcoming appointments</p>
                <Link href="/appointments" className="text-primary hover:underline text-sm">
                  Book an appointment
                </Link>
              </div>
            )}
          </div>
          <Link href="/appointments" className="mt-6 block text-primary font-semibold hover:underline">
            View All Appointments →
          </Link>
        </Card>

        {/* Quick Stats */}
        <div className="space-y-4">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Upcoming</p>
                <p className="mt-1 text-3xl font-bold text-foreground">
                  {isLoading ? '-' : upcomingCount}
                </p>
              </div>
              <div className="rounded-lg p-3 bg-blue-100 text-blue-600">
                <Clock className="h-6 w-6" />
              </div>
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="mt-1 text-3xl font-bold text-foreground">
                  {isLoading ? '-' : completedCount}
                </p>
              </div>
              <div className="rounded-lg p-3 bg-green-100 text-green-600">
                <CheckCircle className="h-6 w-6" />
              </div>
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Appointments</p>
                <p className="mt-1 text-3xl font-bold text-foreground">
                  {isLoading ? '-' : allAppointments.filter(a => a.status !== 'completed' && a.status !== 'cancelled').length}
                </p>
              </div>
              <div className="rounded-lg p-3 bg-orange-100 text-orange-600">
                <Calendar className="h-6 w-6" />
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Past Appointments Section */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-foreground">Past Appointments</h3>
        <div className="mt-6 space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 text-primary animate-spin" />
            </div>
          ) : pastAppointments.length > 0 ? (
            pastAppointments.map((appointment) => (
              <div
                key={appointment.id}
                className="flex items-start gap-4 rounded-lg border border-border p-4 bg-muted/30"
              >
                <div className="rounded-full bg-green-100 p-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-foreground">
                    {appointment.doctorName || appointment.doctor?.name || 'Doctor'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {appointment.specialty || appointment.doctor?.specialization || 'General'}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {new Date(appointment.date).toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                    })}, {appointment.time}
                  </p>
                </div>
                <div className="flex items-center gap-2 rounded-full bg-green-100 px-3 py-1">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-xs font-semibold text-green-600">
                    Completed
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="py-8 text-center text-muted-foreground">
              <CheckCircle className="mx-auto h-12 w-12 opacity-50" />
              <p className="mt-2">No completed appointments yet</p>
            </div>
          )}
        </div>
      </Card>

      {/* Health Tips */}
      <Card className="bg-gradient-to-r from-blue-50 to-green-50 p-6 border-blue-200">
        <h3 className="text-lg font-semibold text-foreground">Health Tips</h3>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {[
            'Stay hydrated: Drink at least 8 glasses of water daily',
            'Get enough sleep: Aim for 7-9 hours per night',
            'Exercise regularly: 30 minutes of moderate activity daily',
            'Eat healthy: Include fruits and vegetables in every meal',
          ].map((tip, idx) => (
            <div key={idx} className="flex gap-3">
              <div className="mt-0.5 h-2 w-2 rounded-full bg-primary flex-shrink-0" />
              <p className="text-sm text-foreground">{tip}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
