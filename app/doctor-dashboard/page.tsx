'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Stethoscope,
  Calendar,
  Users,
  Clock,
  Plus,
  Trash2,
  Edit,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { apiService } from '@/services/api';
import { Header } from '@/components/Header';
import { ProtectedRoute } from '@/components/ProtectedRoute';

interface DoctorProfile {
  id: number;
  userId: number;
  specialization: string;
  visitingHours: string;
  fees: number;
  hospitalId: number | null;
  user: { id: number; name: string; email: string };
  hospital: { id: number; name: string; address: string } | null;
}

interface AvailabilitySlot {
  id: number;
  doctorId: number;
  date: string;
  startTime: string;
  endTime: string;
  isBooked: boolean;
}

interface Appointment {
  id: number;
  patientId: number;
  doctorId: number;
  date: string;
  status: string;
  reason: string | null;
  patient: { id: number; name: string; email: string };
  hospital: { id: number; name: string; address: string } | null;
}

interface Hospital {
  id: number | string;
  name: string;
  address: string;
}

// Generate 30-minute time slots from 9AM to 11PM
const generateTimeSlots = () => {
  const slots = [];
  for (let hour = 9; hour < 23; hour++) {
    for (let min = 0; min < 60; min += 30) {
      const startTime = `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`;
      const endHour = min === 30 ? hour + 1 : hour;
      const endMin = min === 30 ? 0 : 30;
      const endTime = `${endHour.toString().padStart(2, '0')}:${endMin.toString().padStart(2, '0')}`;
      slots.push({ startTime, endTime, label: `${startTime} - ${endTime}` });
    }
  }
  return slots;
};

const TIME_SLOTS = generateTimeSlots();

const WEEKDAYS = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
];

interface WeeklyAvailabilitySlot {
  id: number;
  doctorId: number;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

export default function DoctorDashboardPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'availability' | 'appointments'>('overview');
  const [profile, setProfile] = useState<DoctorProfile | null>(null);
  const [availability, setAvailability] = useState<AvailabilitySlot[]>([]);
  const [weeklyAvailability, setWeeklyAvailability] = useState<WeeklyAvailabilitySlot[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedWeekday, setSelectedWeekday] = useState<number>(new Date().getDay());
  const [selectedSlots, setSelectedSlots] = useState<Set<string>>(new Set());
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [editForm, setEditForm] = useState({
    specialization: '',
    fees: '',
    hospitalId: '',
    visitingHours: '',
  });

  // Fetch doctor data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch profile first - if this fails, the user might not have a doctor profile yet
        let profileData = null;
        try {
          profileData = await apiService.getDoctorProfile();
          setProfile(profileData);
          setEditForm({
            specialization: profileData.specialization || '',
            fees: profileData.fees?.toString() || '',
            hospitalId: profileData.hospitalId?.toString() || '',
            visitingHours: profileData.visitingHours || '',
          });
        } catch (err) {
          console.error('Doctor profile not found - may need to be created');
        }

        // Fetch other data in parallel
        const [availabilityData, weeklyAvailabilityData, appointmentsData, hospitalsData] = await Promise.all([
          apiService.getDoctorAvailability().catch(() => []),
          apiService.getWeeklyAvailability().catch(() => []),
          apiService.getDoctorAppointments().catch(() => []),
          apiService.getHospitals().catch(() => []),
        ]);
        
        setAvailability(availabilityData);
        setWeeklyAvailability(weeklyAvailabilityData);
        setAppointments(appointmentsData);
        setHospitals(hospitalsData);
      } catch (error) {
        console.error('Failed to fetch doctor data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // Format date for display
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatDateShort = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  // Navigate weekdays
  const goToPreviousWeekday = () => {
    setSelectedWeekday((prev) => (prev === 0 ? 6 : prev - 1));
    setSelectedSlots(new Set());
  };

  const goToNextWeekday = () => {
    setSelectedWeekday((prev) => (prev === 6 ? 0 : prev + 1));
    setSelectedSlots(new Set());
  };

  // Get slots for selected weekday
  const getSlotsForWeekday = (dayOfWeek: number) => {
    return weeklyAvailability.filter((slot) => slot.dayOfWeek === dayOfWeek);
  };

  // Toggle slot selection
  const toggleSlotSelection = (slotKey: string) => {
    const newSelected = new Set(selectedSlots);
    if (newSelected.has(slotKey)) {
      newSelected.delete(slotKey);
    } else {
      newSelected.add(slotKey);
    }
    setSelectedSlots(newSelected);
  };

  // Add selected slots for weekday
  const addSelectedSlots = async () => {
    if (selectedSlots.size === 0) return;
    
    const slotsToAdd = Array.from(selectedSlots).map((slotKey) => {
      const [startTime, endTime] = slotKey.split('-');
      return { startTime, endTime };
    });

    try {
      await apiService.addWeeklyAvailability(selectedWeekday, slotsToAdd);
      const updatedAvailability = await apiService.getWeeklyAvailability();
      setWeeklyAvailability(updatedAvailability);
      setSelectedSlots(new Set());
      setMessage({ type: 'success', text: 'Availability slots added successfully!' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error: any) {
      console.error('Failed to add availability:', error);
      setMessage({ type: 'error', text: error?.message || 'Failed to add availability slots' });
      setTimeout(() => setMessage(null), 5000);
    }
  };

  // Delete a weekly slot
  const deleteWeeklySlot = async (slotId: number) => {
    try {
      await apiService.deleteWeeklyAvailability(slotId);
      setWeeklyAvailability(weeklyAvailability.filter((s) => s.id !== slotId));
      setMessage({ type: 'success', text: 'Slot deleted successfully!' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error: any) {
      console.error('Failed to delete slot:', error);
      setMessage({ type: 'error', text: error?.message || 'Failed to delete slot' });
      setTimeout(() => setMessage(null), 5000);
    }
  };

  // Delete a date-based slot (legacy)
  const deleteSlot = async (slotId: number) => {
    try {
      await apiService.deleteDoctorAvailability(slotId);
      setAvailability(availability.filter((s) => s.id !== slotId));
    } catch (error) {
      console.error('Failed to delete slot:', error);
    }
  };

  // Update profile
  const saveProfile = async () => {
    try {
      const updatedProfile = await apiService.updateDoctorProfile({
        specialization: editForm.specialization,
        fees: parseFloat(editForm.fees),
        hospitalId: editForm.hospitalId ? parseInt(editForm.hospitalId) : undefined,
        visitingHours: editForm.visitingHours,
      });
      setProfile(updatedProfile);
      setIsEditingProfile(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  // Update appointment status
  const updateAppointmentStatus = async (appointmentId: number, status: string) => {
    try {
      await apiService.updateAppointmentStatus(appointmentId, status);
      setAppointments(
        appointments.map((apt) => (apt.id === appointmentId ? { ...apt, status } : apt))
      );
    } catch (error) {
      console.error('Failed to update appointment:', error);
    }
  };

  // Get today's appointments count (exclude completed)
  const todayAppointments = appointments.filter((apt) => {
    const aptDate = new Date(apt.date).toDateString();
    return aptDate === new Date().toDateString() && apt.status !== 'COMPLETED' && apt.status !== 'CANCELLED';
  });

  // Active appointments (not completed or cancelled)
  const activeAppointments = appointments.filter((apt) => apt.status !== 'COMPLETED' && apt.status !== 'CANCELLED');
  
  // Completed/Past appointments
  const pastAppointments = appointments.filter((apt) => apt.status === 'COMPLETED' || new Date(apt.date) < new Date());

  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-background">
          <Header />
          <main className="container mx-auto px-4 py-6">
            <div className="flex h-64 items-center justify-center">
              <div className="text-center">
                <div className="mb-4 h-12 w-12 mx-auto animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                <p className="text-foreground">Loading...</p>
              </div>
            </div>
          </main>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-6">
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
              <div className="rounded-2xl bg-gradient-to-br from-blue-500 to-green-500 p-4">
                <Stethoscope className="h-10 w-10 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">Doctor Dashboard</h1>
              <p className="mt-1 text-muted-foreground">Welcome, Dr. {user?.name}</p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="p-6 border-l-4 border-l-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Today's Appointments</p>
                  <p className="mt-1 text-3xl font-bold text-foreground">{todayAppointments.length}</p>
                </div>
                <div className="rounded-lg p-3 bg-blue-100 text-blue-600">
                  <Calendar className="h-6 w-6" />
                </div>
              </div>
            </Card>
            <Card className="p-6 border-l-4 border-l-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Appointments</p>
                  <p className="mt-1 text-3xl font-bold text-foreground">{activeAppointments.length}</p>
                </div>
                <div className="rounded-lg p-3 bg-green-100 text-green-600">
                  <Users className="h-6 w-6" />
                </div>
              </div>
            </Card>
            <Card className="p-6 border-l-4 border-l-amber-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Completed</p>
                  <p className="mt-1 text-3xl font-bold text-foreground">{appointments.filter(a => a.status === 'COMPLETED').length}</p>
                </div>
                <div className="rounded-lg p-3 bg-amber-100 text-amber-600">
                  <Check className="h-6 w-6" />
                </div>
              </div>
            </Card>
            <Card className="p-6 border-l-4 border-l-purple-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Weekly Time Slots</p>
                  <p className="mt-1 text-3xl font-bold text-foreground">
                    {weeklyAvailability.length}
                  </p>
                </div>
                <div className="rounded-lg p-3 bg-purple-100 text-purple-600">
                  <Clock className="h-6 w-6" />
                </div>
              </div>
            </Card>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-2 border-b border-border">
            {['overview', 'availability', 'appointments'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as typeof activeTab)}
                className={`px-4 py-2 font-medium capitalize transition-colors ${
                  activeTab === tab
                    ? 'border-b-2 border-primary text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {activeTab === 'overview' && (
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Upcoming Appointments */}
              <Card className="p-6">
                <h2 className="text-xl font-bold text-foreground mb-4">Upcoming Appointments</h2>
                {appointments.filter(apt => new Date(apt.date) >= new Date() && apt.status !== 'CANCELLED' && apt.status !== 'COMPLETED').length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No upcoming appointments</p>
                ) : (
                  <div className="space-y-3">
                    {appointments
                      .filter(apt => new Date(apt.date) >= new Date() && apt.status !== 'CANCELLED' && apt.status !== 'COMPLETED')
                      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                      .slice(0, 5)
                      .map((apt) => (
                      <div key={apt.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                        <div>
                          <p className="font-medium text-foreground">{apt.patient.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(apt.date).toLocaleDateString('en-US', {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric',
                            })}{' '}
                            at{' '}
                            {new Date(apt.date).toLocaleTimeString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            apt.status === 'CONFIRMED'
                              ? 'bg-green-100 text-green-700'
                              : apt.status === 'PENDING'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {apt.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              {/* Past Appointments */}
              <Card className="p-6">
                <h2 className="text-xl font-bold text-foreground mb-4">Past Appointments</h2>
                {appointments.filter(apt => apt.status === 'COMPLETED').length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No completed appointments yet</p>
                ) : (
                  <div className="space-y-3">
                    {appointments
                      .filter(apt => apt.status === 'COMPLETED')
                      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                      .slice(0, 5)
                      .map((apt) => (
                      <div key={apt.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                        <div>
                          <p className="font-medium text-foreground">{apt.patient.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(apt.date).toLocaleDateString('en-US', {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric',
                            })}{' '}
                            at{' '}
                            {new Date(apt.date).toLocaleTimeString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                        <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-700">
                          COMPLETED
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>
          )}

          {activeTab === 'availability' && (
            <div className="space-y-6">
              {/* Message display */}
              {message && (
                <div
                  className={`p-4 rounded-lg ${
                    message.type === 'success'
                      ? 'bg-green-100 text-green-700 border border-green-200'
                      : 'bg-red-100 text-red-700 border border-red-200'
                  }`}
                >
                  {message.text}
                </div>
              )}

              <Card className="p-6">
                <h2 className="text-xl font-bold text-foreground mb-4">Manage Weekly Availability</h2>
                <p className="text-muted-foreground mb-6">
                  Set your recurring weekly schedule. Time slots are from 9:00 AM to 11:00 PM with 30-minute intervals.
                </p>
                
                {/* Weekday Navigator */}
                <div className="flex items-center justify-between mb-6">
                  <Button variant="outline" onClick={goToPreviousWeekday}>
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-foreground">
                      {WEEKDAYS.find((w) => w.value === selectedWeekday)?.label}
                    </p>
                    <div className="flex gap-2 mt-3 justify-center">
                      {WEEKDAYS.map((day) => (
                        <button
                          key={day.value}
                          onClick={() => {
                            setSelectedWeekday(day.value);
                            setSelectedSlots(new Set());
                          }}
                          className={`w-10 h-10 rounded-full text-sm font-medium transition-colors ${
                            selectedWeekday === day.value
                              ? 'bg-primary text-primary-foreground'
                              : getSlotsForWeekday(day.value).length > 0
                              ? 'bg-green-100 text-green-700 hover:bg-green-200'
                              : 'bg-muted hover:bg-muted/80'
                          }`}
                        >
                          {day.label.charAt(0)}
                        </button>
                      ))}
                    </div>
                  </div>
                  <Button variant="outline" onClick={goToNextWeekday}>
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                </div>

                {/* Add New Slots */}
                <div>
                  <h3 className="font-medium text-foreground mb-3">
                    Select Time Slots for {WEEKDAYS.find((w) => w.value === selectedWeekday)?.label}
                  </h3>
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 mb-4">
                    {TIME_SLOTS.map((slot) => {
                      const slotKey = `${slot.startTime}-${slot.endTime}`;
                      const existingSlot = getSlotsForWeekday(selectedWeekday).find(
                        (s) => s.startTime === slot.startTime
                      );
                      const isSelected = selectedSlots.has(slotKey);

                      return (
                        <button
                          key={slotKey}
                          onClick={() => !existingSlot && toggleSlotSelection(slotKey)}
                          disabled={!!existingSlot}
                          className={`p-2 text-sm rounded-lg border transition-colors ${
                            existingSlot
                              ? 'bg-green-50 border-green-200 text-green-600 cursor-not-allowed'
                              : isSelected
                              ? 'bg-primary text-primary-foreground border-primary'
                              : 'bg-muted/50 border-border hover:border-primary hover:bg-muted'
                          }`}
                        >
                          {slot.label}
                        </button>
                      );
                    })}
                  </div>
                  <Button
                    onClick={addSelectedSlots}
                    disabled={selectedSlots.size === 0}
                    className="gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add {selectedSlots.size} Selected Slot{selectedSlots.size !== 1 ? 's' : ''}
                  </Button>
                </div>
              </Card>

              {/* Selected Slots for Weekday */}
              <Card className="p-6">
                <h2 className="text-xl font-bold text-foreground mb-4">
                  Your Slots for {WEEKDAYS.find((w) => w.value === selectedWeekday)?.label}
                </h2>
                {getSlotsForWeekday(selectedWeekday).length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No availability slots set for {WEEKDAYS.find((w) => w.value === selectedWeekday)?.label}.
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {getSlotsForWeekday(selectedWeekday)
                      .sort((a, b) => a.startTime.localeCompare(b.startTime))
                      .map((slot) => (
                        <div
                          key={slot.id}
                          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-100 text-green-700 border border-green-200"
                        >
                          <Clock className="h-4 w-4" />
                          <span className="font-medium">
                            {slot.startTime} - {slot.endTime}
                          </span>
                          <button
                            onClick={() => deleteWeeklySlot(slot.id)}
                            className="ml-2 p-1 hover:bg-red-200 rounded text-red-500 hover:text-red-700 transition-colors"
                            title="Remove slot"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                  </div>
                )}
              </Card>

              {/* All Weekly Availability Overview */}
              <Card className="p-6">
                <h2 className="text-xl font-bold text-foreground mb-4">Weekly Schedule Overview</h2>
                {weeklyAvailability.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No weekly availability set. Start by selecting a day and adding time slots above.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {WEEKDAYS.map((day) => {
                      const daySlots = getSlotsForWeekday(day.value).sort((a, b) =>
                        a.startTime.localeCompare(b.startTime)
                      );
                      if (daySlots.length === 0) return null;
                      return (
                        <div key={day.value} className="border-b border-border pb-4 last:border-b-0">
                          <h3 className="font-semibold text-foreground mb-2">{day.label}</h3>
                          <div className="flex flex-wrap gap-2">
                            {daySlots.map((slot) => (
                              <div
                                key={slot.id}
                                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted text-sm"
                              >
                                <Clock className="h-3 w-3" />
                                <span>
                                  {slot.startTime} - {slot.endTime}
                                </span>
                                <button
                                  onClick={() => deleteWeeklySlot(slot.id)}
                                  className="p-0.5 hover:bg-red-200 rounded text-red-500 hover:text-red-700 transition-colors"
                                  title="Remove slot"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </Card>
            </div>
          )}

          {activeTab === 'appointments' && (
            <div className="space-y-6">
              {/* Current/Upcoming Appointments */}
              <Card className="p-6">
                <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                  <Clock className="h-5 w-5 text-blue-600" />
                  Current & Upcoming Appointments ({appointments.filter(apt => 
                    new Date(apt.date) >= new Date() && apt.status !== 'COMPLETED' && apt.status !== 'CANCELLED'
                  ).length})
                </h2>
                {appointments.filter(apt => 
                  new Date(apt.date) >= new Date() && apt.status !== 'COMPLETED' && apt.status !== 'CANCELLED'
                ).length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No upcoming appointments</p>
                ) : (
                  <div className="space-y-4">
                    {appointments
                      .filter(apt => new Date(apt.date) >= new Date() && apt.status !== 'COMPLETED' && apt.status !== 'CANCELLED')
                      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                      .map((apt) => (
                      <div
                        key={apt.id}
                        className="flex items-center justify-between p-4 rounded-lg border border-border"
                      >
                        <div className="flex-1">
                          <p className="font-medium text-foreground">{apt.patient.name}</p>
                          <p className="text-sm text-muted-foreground">{apt.patient.email}</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            {new Date(apt.date).toLocaleString('en-US', {
                              dateStyle: 'medium',
                              timeStyle: 'short',
                            })}
                          </p>
                          {apt.reason && (
                            <p className="text-sm text-muted-foreground mt-1">Reason: {apt.reason}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              apt.status === 'CONFIRMED'
                                ? 'bg-green-100 text-green-700'
                                : apt.status === 'PENDING'
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {apt.status}
                          </span>
                          {apt.status === 'PENDING' && (
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => updateAppointmentStatus(apt.id, 'CONFIRMED')}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => updateAppointmentStatus(apt.id, 'CANCELLED')}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                          {apt.status === 'CONFIRMED' && (
                            <Button
                              size="sm"
                              onClick={() => updateAppointmentStatus(apt.id, 'COMPLETED')}
                            >
                              Mark Complete
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              {/* Past Appointments */}
              <Card className="p-6">
                <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                  <Check className="h-5 w-5 text-gray-500" />
                  Past Appointments ({appointments.filter(apt => 
                    new Date(apt.date) < new Date() || apt.status === 'COMPLETED' || apt.status === 'CANCELLED'
                  ).length})
                </h2>
                {appointments.filter(apt => 
                  new Date(apt.date) < new Date() || apt.status === 'COMPLETED' || apt.status === 'CANCELLED'
                ).length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No past appointments</p>
                ) : (
                  <div className="space-y-4">
                    {appointments
                      .filter(apt => new Date(apt.date) < new Date() || apt.status === 'COMPLETED' || apt.status === 'CANCELLED')
                      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                      .map((apt) => (
                      <div
                        key={apt.id}
                        className="flex items-center justify-between p-4 rounded-lg border border-border bg-muted/30"
                      >
                        <div className="flex-1">
                          <p className="font-medium text-foreground">{apt.patient.name}</p>
                          <p className="text-sm text-muted-foreground">{apt.patient.email}</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            {new Date(apt.date).toLocaleString('en-US', {
                              dateStyle: 'medium',
                              timeStyle: 'short',
                            })}
                          </p>
                          {apt.reason && (
                            <p className="text-sm text-muted-foreground mt-1">Reason: {apt.reason}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              apt.status === 'COMPLETED'
                                ? 'bg-blue-100 text-blue-700'
                                : apt.status === 'CANCELLED'
                                ? 'bg-red-100 text-red-700'
                                : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {apt.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>
          )}
        </div>
      </main>
    </div>
  </ProtectedRoute>
  );
}
