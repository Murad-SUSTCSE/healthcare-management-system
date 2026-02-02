'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  User,
  Mail,
  Phone,
  Calendar,
  Edit2,
  Save,
  Stethoscope,
  Loader2,
  Building,
  DollarSign,
  Shield,
  LogOut,
  Key,
  Smartphone,
  X,
} from 'lucide-react';
import { apiService } from '@/services/api';

// Predefined medical specializations
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

interface DoctorProfile {
  id: number;
  userId: number;
  specialization: string;
  specializations?: string[];
  fees: number;
  hospitalId: number | null;
  user: { id: number; name: string; email: string };
  hospital: { id: number; name: string; address: string } | null;
}

interface Hospital {
  id: number | string;
  name: string;
  address: string;
}

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    dateOfBirth: user?.dateOfBirth || '',
    bloodGroup: user?.bloodGroup || '',
  });

  const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  const [doctorProfile, setDoctorProfile] = useState<DoctorProfile | null>(null);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [isEditingDoctor, setIsEditingDoctor] = useState(false);
  const [doctorForm, setDoctorForm] = useState({
    specializations: [] as string[],
    fees: '',
    hospitalId: '',
  });

  // Password change state
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const isDoctor = user?.role === 'DOCTOR';

  // Update formData when user data is loaded
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : '',
        bloodGroup: user.bloodGroup || '',
      });
    }
  }, [user]);

  useEffect(() => {
    const fetchDoctorProfile = async () => {
      if (!isDoctor) return;
      try {
        const [profileData, hospitalsData] = await Promise.all([
          apiService.getDoctorProfile(),
          apiService.getHospitals(),
        ]);
        setDoctorProfile(profileData);
        setHospitals(hospitalsData);
        setDoctorForm({
          specializations: profileData.specializations || (profileData.specialization ? [profileData.specialization] : []),
          fees: profileData.fees?.toString() || '',
          hospitalId: profileData.hospitalId?.toString() || '',
        });
      } catch {
        console.error('Failed to fetch doctor profile');
      }
    };
    fetchDoctorProfile();
  }, [isDoctor]);

  // Toggle specialization selection
  const toggleSpecialization = (spec: string) => {
    setDoctorForm((prev) => {
      const current = prev.specializations;
      if (current.includes(spec)) {
        return { ...prev, specializations: current.filter((s) => s !== spec) };
      } else {
        return { ...prev, specializations: [...current, spec] };
      }
    });
  };

  const handleChangePassword = async () => {
    setPasswordError('');
    setPasswordSuccess('');

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters');
      return;
    }

    try {
      setIsChangingPassword(true);
      await apiService.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setPasswordSuccess('Password changed successfully!');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => {
        setShowPasswordModal(false);
        setPasswordSuccess('');
      }, 2000);
    } catch (error: any) {
      setPasswordError(error?.message || 'Failed to change password');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const saveDoctorProfile = async () => {
    if (doctorForm.specializations.length === 0) {
      alert('Please select at least one specialization');
      return;
    }
    try {
      const updatedProfile = await apiService.updateDoctorProfile({
        specializations: doctorForm.specializations,
        fees: parseFloat(doctorForm.fees),
        hospitalId: doctorForm.hospitalId ? parseInt(doctorForm.hospitalId) : undefined,
      });
      setDoctorProfile(updatedProfile);
      setIsEditingDoctor(false);
    } catch {
      console.error('Failed to update profile');
    }
  };

  const handleSave = async () => {
    try {
      const updateData = {
        name: formData.name,
        phone: formData.phone || undefined,
        dateOfBirth: formData.dateOfBirth || undefined,
        bloodGroup: formData.bloodGroup || undefined,
      };
      console.log('Updating profile with:', updateData);
      
      const updatedUser = await apiService.updateProfile(updateData);
      console.log('Profile updated:', updatedUser);
      
      // Update local user context
      if (updatedUser) {
        setFormData({
          name: updatedUser.name || '',
          email: updatedUser.email || '',
          phone: updatedUser.phone || '',
          dateOfBirth: updatedUser.dateOfBirth ? new Date(updatedUser.dateOfBirth).toISOString().split('T')[0] : '',
          bloodGroup: updatedUser.bloodGroup || '',
        });
      }
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };
  const handleLogout = () => { logout(); router.push('/login'); };

  const ProfileField = ({ icon: Icon, label, value, field, type = 'text', placeholder }: {
    icon: React.ElementType; label: string; value: string; field: string; type?: string; placeholder?: string;
  }) => (
    <div className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors">
      <div className="p-2 rounded-lg bg-primary/10">
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        {isEditing ? (
          <Input
            type={type}
            value={value}
            onChange={(e) => setFormData(prev => ({ ...prev, [field]: e.target.value }))}
            placeholder={placeholder}
            className="h-8 mt-1"
          />
        ) : (
          <p className="text-sm font-medium text-foreground truncate">{value || 'Not provided'}</p>
        )}
      </div>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Hero Section */}
      <Card className="overflow-hidden">
        <div className="h-24 bg-gradient-to-r from-blue-500 via-purple-500 to-green-500" />
        <div className="px-6 pb-6">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-10">
            <div className="h-20 w-20 rounded-full bg-gradient-to-br from-blue-400 to-green-400 border-4 border-background flex items-center justify-center">
              <User className="h-8 w-8 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-foreground">{user?.name}</h1>
                {isDoctor && (
                  <span className="px-2 py-0.5 text-xs font-medium bg-teal-100 text-teal-700 rounded-full">
                    Doctor
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
            <div className="flex gap-2">
              {isDoctor && (
                <Link href="/doctor-dashboard">
                  <Button size="sm" className="bg-gradient-to-r from-teal-600 to-blue-600">
                    <Stethoscope className="h-4 w-4 mr-2" /> Dashboard
                  </Button>
                </Link>
              )}
              <Button size="sm" variant="outline" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" /> Logout
              </Button>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Personal Info */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">Personal Information</h2>
              {isEditing ? (
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleSave}><Save className="h-4 w-4 mr-1" /> Save</Button>
                  <Button size="sm" variant="ghost" onClick={() => setIsEditing(false)}><X className="h-4 w-4" /></Button>
                </div>
              ) : (
                <Button size="sm" variant="ghost" onClick={() => setIsEditing(true)}><Edit2 className="h-4 w-4" /></Button>
              )}
            </div>
            <div className="grid sm:grid-cols-2 gap-1">
              <ProfileField icon={User} label="Full Name" value={formData.name} field="name" />
              <ProfileField icon={Mail} label="Email" value={formData.email} field="email" type="email" />
              <ProfileField icon={Phone} label="Phone" value={formData.phone} field="phone" placeholder="+880-1700-000000" />
              <ProfileField icon={Calendar} label="Date of Birth" value={formData.dateOfBirth} field="dateOfBirth" type="date" />
              
              {/* Blood Group Dropdown */}
              <div className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Shield className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground">Blood Group</p>
                  {isEditing ? (
                    <select
                      value={formData.bloodGroup}
                      onChange={(e) => setFormData(prev => ({ ...prev, bloodGroup: e.target.value }))}
                      className="w-full mt-1 rounded-md border border-input bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="">Select blood group</option>
                      {BLOOD_GROUPS.map((bg) => (
                        <option key={bg} value={bg}>{bg}</option>
                      ))}
                    </select>
                  ) : (
                    <p className="text-sm font-medium text-foreground">{formData.bloodGroup || 'Not provided'}</p>
                  )}
                </div>
              </div>
            </div>
          </Card>

          {/* Doctor Profile - Only for doctors */}
          {isDoctor && doctorProfile && (
            <Card className="p-6 border-teal-200 bg-gradient-to-br from-teal-50/50 to-blue-50/50">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Stethoscope className="h-5 w-5 text-teal-600" />
                  <h2 className="text-lg font-semibold text-foreground">Doctor Profile</h2>
                </div>
                {isEditingDoctor ? (
                  <div className="flex gap-2">
                    <Button size="sm" onClick={saveDoctorProfile}><Save className="h-4 w-4 mr-1" /> Save</Button>
                    <Button size="sm" variant="ghost" onClick={() => setIsEditingDoctor(false)}><X className="h-4 w-4" /></Button>
                  </div>
                ) : (
                  <Button size="sm" variant="ghost" onClick={() => setIsEditingDoctor(true)}><Edit2 className="h-4 w-4" /></Button>
                )}
              </div>
              
              {isEditingDoctor ? (
                <div className="space-y-4">
                  {/* Specializations Multi-select */}
                  <div className="sm:col-span-2">
                    <label className="text-xs font-medium text-muted-foreground block mb-2">
                      Specializations <span className="text-red-500">*</span> (Select at least one)
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto p-2 border rounded-lg bg-white/50">
                      {SPECIALIZATION_OPTIONS.map((spec) => (
                        <label
                          key={spec}
                          className={`flex items-center gap-2 p-2 rounded-md cursor-pointer transition-colors text-sm ${
                            doctorForm.specializations.includes(spec)
                              ? 'bg-teal-100 text-teal-800 border border-teal-300'
                              : 'bg-gray-50 hover:bg-gray-100 border border-transparent'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={doctorForm.specializations.includes(spec)}
                            onChange={() => toggleSpecialization(spec)}
                            className="rounded text-teal-600 focus:ring-teal-500"
                          />
                          <span className="truncate">{spec}</span>
                        </label>
                      ))}
                    </div>
                    {doctorForm.specializations.length > 0 && (
                      <p className="text-xs text-teal-600 mt-1">
                        Selected: {doctorForm.specializations.join(', ')}
                      </p>
                    )}
                  </div>
                  
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">Fees (BDT)</label>
                      <Input type="number" value={doctorForm.fees} onChange={(e) => setDoctorForm({ ...doctorForm, fees: e.target.value })} className="mt-1" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">Hospital</label>
                      <select value={doctorForm.hospitalId} onChange={(e) => setDoctorForm({ ...doctorForm, hospitalId: e.target.value })} className="w-full mt-1 rounded-md border border-input bg-background px-3 py-2 text-sm">
                        <option value="">Select hospital</option>
                        {hospitals.map((h) => <option key={h.id} value={h.id}>{h.name}</option>)}
                      </select>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Specializations Display */}
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-white/50">
                    <Stethoscope className="h-4 w-4 text-teal-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground">Specializations</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {(doctorProfile.specializations || [doctorProfile.specialization]).map((spec) => (
                          <span key={spec} className="px-2 py-0.5 text-xs bg-teal-100 text-teal-700 rounded-full">
                            {spec}
                          </span>
                        ))}
                        {(!doctorProfile.specializations?.length && !doctorProfile.specialization) && (
                          <span className="text-sm text-muted-foreground">Not set</span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid sm:grid-cols-2 gap-4">
                    {[
                      { icon: DollarSign, label: 'Consultation Fee', value: doctorProfile.fees ? `৳${doctorProfile.fees}` : null },
                      { icon: Building, label: 'Hospital', value: doctorProfile.hospital?.name },
                    ].map(({ icon: Icon, label, value }) => (
                      <div key={label} className="flex items-center gap-3 p-3 rounded-lg bg-white/50">
                        <Icon className="h-4 w-4 text-teal-600" />
                        <div>
                          <p className="text-xs text-muted-foreground">{label}</p>
                          <p className="text-sm font-medium">{value || 'Not set'}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          )}


        </div>

        {/* Sidebar */}
        <div className="lg:col-span-2 space-y-4">
          {/* Doctor Portal - Only show for doctors */}
          {isDoctor && (
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Stethoscope className="h-4 w-4 text-primary" />
                <p className="text-sm font-medium text-foreground">Doctor Portal</p>
              </div>
              <Link href="/doctor-dashboard">
                <Button size="sm" className="w-full bg-gradient-to-r from-blue-600 to-green-600">
                  <Stethoscope className="h-4 w-4 mr-2" /> Go to Dashboard
                </Button>
              </Link>
            </Card>
          )}

          {/* Security */}
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Shield className="h-4 w-4 text-primary" />
              <p className="text-sm font-medium text-foreground">Security</p>
            </div>
            <div className="space-y-2">
              <Button size="sm" variant="ghost" className="w-full justify-start h-9" onClick={() => setShowPasswordModal(true)}>
                <Key className="h-4 w-4 mr-2" /> Change Password
              </Button>
              <Button size="sm" variant="ghost" className="w-full justify-start h-9" disabled>
                <Smartphone className="h-4 w-4 mr-2" /> Two-Factor Auth
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Change Password</h3>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setShowPasswordModal(false);
                  setPasswordError('');
                  setPasswordSuccess('');
                  setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {passwordError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {passwordError}
              </div>
            )}

            {passwordSuccess && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
                {passwordSuccess}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Current Password</label>
                <Input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  placeholder="Enter current password"
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">New Password</label>
                <Input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  placeholder="Enter new password (min 6 characters)"
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Confirm New Password</label>
                <Input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  placeholder="Confirm new password"
                  className="mt-1"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <Button
                  className="flex-1"
                  onClick={handleChangePassword}
                  disabled={isChangingPassword || !passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword}
                >
                  {isChangingPassword ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Changing...
                    </>
                  ) : (
                    'Change Password'
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowPasswordModal(false);
                    setPasswordError('');
                    setPasswordSuccess('');
                    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
