'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  ArrowLeft,
  Calendar,
  Clock,
  User,
  Stethoscope,
  Search,
  Loader2,
  CheckCircle,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import { apiService } from '@/services/api';

interface AdminAppointment {
  id: string;
  patientId: string;
  patientName: string;
  patientEmail: string;
  doctorId: string;
  doctorName: string;
  specialty: string;
  date: string;
  time: string;
  status: string;
  reason: string | null;
  hospital: string;
  createdAt: string;
}

export default function AdminAppointmentsPage() {
  const [appointments, setAppointments] = useState<AdminAppointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setIsLoading(true);
        const data = await apiService.getAdminAppointments();
        setAppointments(data);
      } catch (err) {
        console.error('Failed to fetch appointments:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  // Filter appointments
  const filteredAppointments = appointments.filter((apt) => {
    const matchesSearch =
      apt.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apt.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apt.patientEmail.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || apt.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Separate current and past appointments
  const now = new Date();
  const currentAppointments = filteredAppointments
    .filter((apt) => {
      const aptDate = new Date(apt.date);
      return aptDate >= now && apt.status !== 'CANCELLED' && apt.status !== 'COMPLETED';
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const pastAppointments = filteredAppointments
    .filter((apt) => {
      const aptDate = new Date(apt.date);
      return aptDate < now || apt.status === 'CANCELLED' || apt.status === 'COMPLETED';
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
            <CheckCircle className="h-3 w-3" />
            Confirmed
          </span>
        );
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700">
            <Clock className="h-3 w-3" />
            Pending
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
            <CheckCircle className="h-3 w-3" />
            Completed
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700">
            <XCircle className="h-3 w-3" />
            Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
            <AlertCircle className="h-3 w-3" />
            {status}
          </span>
        );
    }
  };

  const AppointmentCard = ({ apt, isPast }: { apt: AdminAppointment; isPast?: boolean }) => (
    <div
      className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg border border-border ${
        isPast ? 'bg-muted/30' : 'bg-background'
      }`}
    >
      <div className="flex-1 space-y-2">
        <div className="flex items-center gap-3">
          <div className={`rounded-full p-2 ${isPast ? 'bg-gray-100' : 'bg-blue-100'}`}>
            <User className={`h-4 w-4 ${isPast ? 'text-gray-600' : 'text-blue-600'}`} />
          </div>
          <div>
            <p className="font-semibold text-foreground">{apt.patientName}</p>
            <p className="text-sm text-muted-foreground">{apt.patientEmail}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 ml-11">
          <Stethoscope className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-foreground">
            Dr. {apt.doctorName} - {apt.specialty}
          </span>
        </div>
        <div className="flex items-center gap-3 ml-11">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            {new Date(apt.date).toLocaleDateString('en-US', {
              weekday: 'short',
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}{' '}
            at {apt.time}
          </span>
        </div>
        {apt.hospital && (
          <div className="flex items-center gap-3 ml-11">
            <span className="text-sm text-muted-foreground">📍 {apt.hospital}</span>
          </div>
        )}
        {apt.reason && (
          <div className="ml-11">
            <p className="text-sm text-muted-foreground">
              <span className="font-medium">Reason:</span> {apt.reason}
            </p>
          </div>
        )}
      </div>
      <div className="mt-3 sm:mt-0 sm:ml-4">{getStatusBadge(apt.status)}</div>
    </div>
  );

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-foreground">All Appointments</h1>
          <p className="mt-1 text-muted-foreground">
            View all system appointments - current and past
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-4 border-l-4 border-l-blue-500">
          <p className="text-sm text-muted-foreground">Total Appointments</p>
          <p className="text-2xl font-bold text-foreground">{appointments.length}</p>
        </Card>
        <Card className="p-4 border-l-4 border-l-green-500">
          <p className="text-sm text-muted-foreground">Current/Upcoming</p>
          <p className="text-2xl font-bold text-foreground">{currentAppointments.length}</p>
        </Card>
        <Card className="p-4 border-l-4 border-l-amber-500">
          <p className="text-sm text-muted-foreground">Pending</p>
          <p className="text-2xl font-bold text-foreground">
            {appointments.filter((a) => a.status === 'PENDING').length}
          </p>
        </Card>
        <Card className="p-4 border-l-4 border-l-gray-500">
          <p className="text-sm text-muted-foreground">Past/Completed</p>
          <p className="text-2xl font-bold text-foreground">{pastAppointments.length}</p>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by patient or doctor name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-border bg-background px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="all">All Statuses</option>
          <option value="PENDING">Pending</option>
          <option value="CONFIRMED">Confirmed</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      {isLoading ? (
        <Card className="p-12 text-center">
          <Loader2 className="mx-auto h-12 w-12 text-primary animate-spin" />
          <p className="mt-4 text-lg text-muted-foreground">Loading appointments...</p>
        </Card>
      ) : (
        <>
          {/* Current Appointments */}
          <Card className="p-6">
            <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-600" />
              Current & Upcoming Appointments ({currentAppointments.length})
            </h2>
            {currentAppointments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="mx-auto h-12 w-12 opacity-50" />
                <p className="mt-2">No current or upcoming appointments</p>
              </div>
            ) : (
              <div className="space-y-3">
                {currentAppointments.map((apt) => (
                  <AppointmentCard key={apt.id} apt={apt} />
                ))}
              </div>
            )}
          </Card>

          {/* Past Appointments */}
          <Card className="p-6">
            <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-gray-500" />
              Past Appointments ({pastAppointments.length})
            </h2>
            {pastAppointments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="mx-auto h-12 w-12 opacity-50" />
                <p className="mt-2">No past appointments</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pastAppointments.map((apt) => (
                  <AppointmentCard key={apt.id} apt={apt} isPast />
                ))}
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  );
}
