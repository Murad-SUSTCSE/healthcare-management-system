'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { DoctorCard } from '@/components/DoctorCard';
import { Calendar, MapPin, Stethoscope, Search, Loader2 } from 'lucide-react';
import type { Doctor } from '@/types';
import { apiService } from '@/services/api';

export default function AppointmentsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialization, setSelectedSpecialization] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch doctors from API
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setIsLoading(true);
        const data = await apiService.getDoctors();
        setDoctors(data);
        setFilteredDoctors(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load doctors');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  // Get unique specializations
  const specializations = ['all', ...new Set(doctors.map((d) => d.specialization))];

  useEffect(() => {
    let filtered = doctors;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (doctor) =>
          doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          doctor.hospital.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by specialization
    if (selectedSpecialization !== 'all') {
      filtered = filtered.filter(
        (doctor) => doctor.specialization === selectedSpecialization
      );
    }

    setFilteredDoctors(filtered);
  }, [searchTerm, selectedSpecialization, doctors]);

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Book an Appointment</h1>
        <p className="mt-2 text-muted-foreground">
          Find and book appointments with our expert doctors
        </p>
      </div>

      {/* Search and Filter */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search by doctor name or hospital..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 rounded-lg"
          />
        </div>

        {/* Specialization Filter */}
        <select
          value={selectedSpecialization}
          onChange={(e) => setSelectedSpecialization(e.target.value)}
          className="rounded-lg border border-border bg-background px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        >
          {specializations.map((spec) => (
            <option key={spec} value={spec}>
              {spec === 'all' ? 'All Specializations' : spec}
            </option>
          ))}
        </select>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          {
            icon: Stethoscope,
            label: 'Doctors Available',
            value: filteredDoctors.length,
            color: 'blue',
          },
          {
            icon: Calendar,
            label: 'Average Rating',
            value: (
              (filteredDoctors.reduce((sum, d) => sum + d.rating, 0) /
                filteredDoctors.length) || 0
            ).toFixed(1),
            color: 'green',
          },
          {
            icon: MapPin,
            label: 'Hospitals',
            value: new Set(filteredDoctors.map((d) => d.hospital)).size,
            color: 'orange',
          },
        ].map((stat) => {
          const Icon = stat.icon;
          const colorClasses = {
            blue: 'bg-blue-100 text-blue-600',
            green: 'bg-green-100 text-green-600',
            orange: 'bg-orange-100 text-orange-600',
          };

          return (
            <Card key={stat.label} className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="mt-1 text-2xl font-bold text-foreground">
                    {stat.value}
                  </p>
                </div>
                <div
                  className={`rounded-lg p-3 ${
                    colorClasses[stat.color as keyof typeof colorClasses]
                  }`}
                >
                  <Icon className="h-6 w-6" />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Doctors Grid */}
      <div>
        <h2 className="mb-4 text-xl font-semibold text-foreground">
          Available Doctors ({filteredDoctors.length})
        </h2>
        {isLoading ? (
          <Card className="p-12 text-center">
            <Loader2 className="mx-auto h-12 w-12 text-primary animate-spin" />
            <p className="mt-4 text-lg text-muted-foreground">
              Loading doctors...
            </p>
          </Card>
        ) : error ? (
          <Card className="p-12 text-center">
            <Stethoscope className="mx-auto h-12 w-12 text-red-500 opacity-50" />
            <p className="mt-4 text-lg text-red-600">{error}</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Please try again later
            </p>
          </Card>
        ) : filteredDoctors.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredDoctors.map((doctor) => (
              <DoctorCard key={doctor.id} doctor={doctor} />
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center">
            <Stethoscope className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
            <p className="mt-4 text-lg text-muted-foreground">
              No doctors found matching your criteria
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Try adjusting your filters or search term
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
