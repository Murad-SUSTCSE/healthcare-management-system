'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  ArrowLeft,
  Stethoscope,
  Plus,
  User,
  Mail,
  Key,
  Loader2,
  AlertCircle,
  CheckCircle,
  Trash2,
  Copy,
  Building2,
  Clock,
} from 'lucide-react';
import { apiService } from '@/services/api';

// Predefined medical specializations (same as profile page)
const SPECIALIZATION_OPTIONS = [
  'General Physician',
  'Cardiology',
  'Dermatology',
  'Endocrinology',
  'Gastroenterology',
  'Gynecology',
  'Hematology',
  'Internal Medicine',
  'Nephrology',
  'Neurology',
  'Oncology',
  'Ophthalmology',
  'Orthopedics',
  'Pediatrics',
  'Psychiatry',
  'Pulmonology',
  'Radiology',
  'Rheumatology',
  'Surgery',
  'Urology',
  'ENT (Ear, Nose, Throat)',
  'Dentistry',
  'Physical Therapy',
  'Emergency Medicine',
];

interface Doctor {
  id: number;
  userId: number;
  specialization: string;
  specializations?: string[];
  fees: number;
  visitingHours: string;
  user: {
    id: number;
    name: string;
    email: string;
    createdAt: string;
  };
  hospital?: {
    id: number;
    name: string;
  };
}

interface CreatedCredentials {
  email: string;
  password: string;
  name: string;
}

export default function ManageDoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createdCredentials, setCreatedCredentials] = useState<CreatedCredentials | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [hospitals, setHospitals] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    name: '',
    specializations: [] as string[],
    fees: '',
    hospitalId: '',
  });

  const toggleSpecialization = (spec: string) => {
    setFormData(prev => ({
      ...prev,
      specializations: prev.specializations.includes(spec)
        ? prev.specializations.filter(s => s !== spec)
        : [...prev.specializations, spec]
    }));
  };

  const fetchDoctors = async () => {
    try {
      setIsLoading(true);
      const data = await apiService.getAdminDoctorsList();
      setDoctors(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load doctors');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchHospitals = async () => {
    try {
      const data = await apiService.getHospitals();
      setHospitals(data);
    } catch (err) {
      console.error('Failed to fetch hospitals:', err);
    }
  };

  useEffect(() => {
    fetchDoctors();
    fetchHospitals();
  }, []);

  const handleCreateDoctor = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setError('Doctor name is required');
      return;
    }

    if (formData.specializations.length === 0) {
      setError('Please select at least one specialization');
      return;
    }

    try {
      setIsCreating(true);
      setError('');
      
      const result = await apiService.createDoctorAccount({
        name: formData.name,
        specializations: formData.specializations,
        fees: formData.fees ? parseFloat(formData.fees) : undefined,
        hospitalId: formData.hospitalId ? parseInt(formData.hospitalId) : undefined,
      });

      setCreatedCredentials({
        email: result.credentials.email,
        password: result.credentials.password,
        name: formData.name,
      });

      // Reset form
      setFormData({
        name: '',
        specializations: [],
        fees: '',
        hospitalId: '',
      });
      
      // Refresh doctors list
      await fetchDoctors();
      setShowCreateForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create doctor account');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteDoctor = async (doctorId: number) => {
    if (!confirm('Are you sure you want to delete this doctor account?')) {
      return;
    }

    try {
      setDeletingId(doctorId);
      await apiService.deleteDoctorAccount(doctorId);
      setDoctors(prev => prev.filter(d => d.id !== doctorId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete doctor');
    } finally {
      setDeletingId(null);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div>
        <Link href="/admin">
          <button className="flex items-center gap-2 text-primary hover:underline mb-4">
            <ArrowLeft className="h-4 w-4" />
            Back to Admin Dashboard
          </button>
        </Link>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="rounded-2xl bg-gradient-to-br from-blue-500 to-green-500 p-4">
              <Stethoscope className="h-10 w-10 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Manage Doctors</h1>
              <p className="mt-1 text-muted-foreground">
                Create and manage doctor accounts
              </p>
            </div>
          </div>
          <Button onClick={() => setShowCreateForm(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Create Doctor Account
          </Button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex gap-2 rounded-lg bg-red-50 p-4 text-red-600">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          {error}
          <button onClick={() => setError('')} className="ml-auto text-sm underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Created Credentials Modal */}
      {createdCredentials && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-full bg-green-100">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-foreground">Doctor Account Created!</h3>
                <p className="text-sm text-muted-foreground">Share these credentials with the doctor</p>
              </div>
            </div>

            <div className="space-y-4 bg-gray-50 rounded-lg p-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Doctor Name</label>
                <div className="flex items-center gap-2 mt-1">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="font-semibold text-foreground">{createdCredentials.name}</span>
                </div>
              </div>
              
              <div>
                <label className="text-xs font-medium text-muted-foreground">Email</label>
                <div className="flex items-center gap-2 mt-1">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="font-mono font-semibold text-foreground">{createdCredentials.email}</span>
                  <button
                    onClick={() => copyToClipboard(createdCredentials.email)}
                    className="ml-auto p-1 hover:bg-gray-200 rounded"
                  >
                    <Copy className="h-4 w-4 text-muted-foreground" />
                  </button>
                </div>
              </div>
              
              <div>
                <label className="text-xs font-medium text-muted-foreground">Password</label>
                <div className="flex items-center gap-2 mt-1">
                  <Key className="h-4 w-4 text-muted-foreground" />
                  <span className="font-mono font-semibold text-foreground bg-yellow-100 px-2 py-1 rounded">
                    {createdCredentials.password}
                  </span>
                  <button
                    onClick={() => copyToClipboard(createdCredentials.password)}
                    className="ml-auto p-1 hover:bg-gray-200 rounded"
                  >
                    <Copy className="h-4 w-4 text-muted-foreground" />
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-4 p-3 bg-amber-50 rounded-lg text-sm text-amber-700">
              <strong>Important:</strong> Save these credentials now! The password cannot be retrieved later.
            </div>

            <Button
              className="w-full mt-4"
              onClick={() => setCreatedCredentials(null)}
            >
              Done
            </Button>
          </Card>
        </div>
      )}

      {/* Create Doctor Form Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-full bg-primary/10">
                <Plus className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Create Doctor Account</h3>
                <p className="text-xs text-muted-foreground">Email & password will be auto-generated</p>
              </div>
            </div>

            <form onSubmit={handleCreateDoctor} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground">Doctor Name *</label>
                <Input
                  placeholder="e.g., Dr. Rahman"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="mt-1"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground">
                  Specializations * <span className="text-xs text-muted-foreground">(Select at least one)</span>
                </label>
                <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2 border rounded-lg bg-gray-50/50 mt-1">
                  {SPECIALIZATION_OPTIONS.map((spec) => (
                    <label
                      key={spec}
                      className={`flex items-center gap-2 p-2 rounded-md cursor-pointer transition-colors text-xs ${
                        formData.specializations.includes(spec)
                          ? 'bg-blue-100 text-blue-800 border border-blue-300'
                          : 'bg-white hover:bg-gray-100 border border-transparent'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={formData.specializations.includes(spec)}
                        onChange={() => toggleSpecialization(spec)}
                        className="rounded text-blue-600 focus:ring-blue-500"
                      />
                      <span className="truncate">{spec}</span>
                    </label>
                  ))}
                </div>
                {formData.specializations.length > 0 && (
                  <p className="text-xs text-blue-600 mt-1">
                    Selected: {formData.specializations.join(', ')}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground">Fees (BDT)</label>
                  <Input
                    type="number"
                    placeholder="500"
                    value={formData.fees}
                    onChange={(e) => setFormData({ ...formData, fees: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Hospital</label>
                  <select
                    value={formData.hospitalId}
                    onChange={(e) => setFormData({ ...formData, hospitalId: e.target.value })}
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="">Independent Practice</option>
                    {hospitals.map((h) => (
                      <option key={h.id} value={h.id}>{h.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="p-3 bg-amber-50 rounded-lg text-xs text-amber-700">
                <Clock className="h-4 w-4 inline mr-1" />
                <strong>Note:</strong> Doctor must set their visiting hours from their profile to appear in patient listings.
              </div>

              <div className="flex gap-2 pt-2">
                <Button type="submit" disabled={isCreating} className="flex-1">
                  {isCreating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Account'
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreateForm(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Doctors</p>
              <p className="mt-1 text-2xl font-bold text-blue-600">
                {doctors.length}
              </p>
            </div>
            <div className="rounded-lg p-3 bg-blue-100">
              <Stethoscope className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">With Hospital</p>
              <p className="mt-1 text-2xl font-bold text-green-600">
                {doctors.filter(d => d.hospital).length}
              </p>
            </div>
            <div className="rounded-lg p-3 bg-green-100">
              <Building2 className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Doctors List */}
      <div>
        <h2 className="mb-4 text-xl font-bold text-foreground">
          All Doctors ({doctors.length})
        </h2>

        {isLoading ? (
          <Card className="p-12 text-center">
            <Loader2 className="mx-auto h-12 w-12 text-primary animate-spin" />
            <p className="mt-4 text-lg text-muted-foreground">Loading doctors...</p>
          </Card>
        ) : doctors.length === 0 ? (
          <Card className="p-12 text-center">
            <Stethoscope className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
            <p className="mt-4 text-lg text-foreground">No doctors yet</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Create your first doctor account to get started.
            </p>
            <Button onClick={() => setShowCreateForm(true)} className="mt-4 gap-2">
              <Plus className="h-4 w-4" />
              Create Doctor Account
            </Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {doctors.map((doctor) => (
              <Card key={doctor.id} className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  {/* Doctor Info */}
                  <div className="flex items-start gap-4">
                    <div className="rounded-full bg-gradient-to-br from-blue-400 to-green-400 p-4">
                      <User className="h-6 w-6 text-white" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-lg font-bold text-foreground">
                        {doctor.user.name}
                      </p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Mail className="h-4 w-4" />
                        {doctor.user.email}
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {(doctor.specializations || [doctor.specialization]).map((spec, idx) => (
                          <span key={idx} className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
                            {spec}
                          </span>
                        ))}
                        <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                          ৳{doctor.fees}
                        </span>
                        {doctor.hospital && (
                          <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-700 rounded-full">
                            {doctor.hospital.name}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        {doctor.visitingHours ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-emerald-100 text-emerald-700 rounded-full">
                            <Clock className="h-3 w-3" />
                            {doctor.visitingHours}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-amber-100 text-amber-700 rounded-full">
                            <Clock className="h-3 w-3" />
                            Not visible to patients (no visiting hours)
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Created: {new Date(doctor.user.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <Button
                      onClick={() => handleDeleteDoctor(doctor.id)}
                      disabled={deletingId === doctor.id}
                      variant="outline"
                      className="border-2 border-red-300 text-red-600 hover:bg-red-50"
                    >
                      {deletingId === doctor.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
