'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Shield,
  Users,
  Stethoscope,
  ClipboardList,
  Ambulance,
  Package,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { apiService } from '@/services/api';

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalDoctors: 0,
    totalUsers: 0,
    approvedDoctors: 0,
    totalAppointments: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        const statsData = await apiService.getAdminStats();
        setStats({
          totalDoctors: statsData.totalDoctors,
          totalUsers: statsData.totalUsers,
          approvedDoctors: statsData.approvedDoctors,
          totalAppointments: statsData.totalAppointments,
        });
      } catch (err) {
        console.error('Failed to fetch stats:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="rounded-2xl bg-gradient-to-br from-red-500 to-orange-500 p-4">
          <Shield className="h-10 w-10 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="mt-1 text-muted-foreground">Welcome back, {user?.name}</p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="p-6 border-l-4 border-l-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Doctors</p>
              <p className="mt-1 text-3xl font-bold text-foreground">
                {isLoading ? '-' : stats.totalDoctors}
              </p>
            </div>
            <div className="rounded-lg p-3 bg-blue-100 text-blue-600">
              <Stethoscope className="h-6 w-6" />
            </div>
          </div>
        </Card>
        <Card className="p-6 border-l-4 border-l-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Users</p>
              <p className="mt-1 text-3xl font-bold text-foreground">
                {isLoading ? '-' : stats.totalUsers}
              </p>
            </div>
            <div className="rounded-lg p-3 bg-green-100 text-green-600">
              <Users className="h-6 w-6" />
            </div>
          </div>
        </Card>
        <Card className="p-6 border-l-4 border-l-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Appointments</p>
              <p className="mt-1 text-3xl font-bold text-foreground">
                {isLoading ? '-' : stats.totalAppointments}
              </p>
            </div>
            <div className="rounded-lg p-3 bg-purple-100 text-purple-600">
              <ClipboardList className="h-6 w-6" />
            </div>
          </div>
        </Card>
      </div>

      {/* Admin Actions */}
      <div>
        <h2 className="mb-4 text-2xl font-bold text-foreground">Admin Actions</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Link href="/admin/manage-doctors">
            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer group">
              <div className="flex items-center gap-4">
                <div className="rounded-lg p-3 bg-gradient-to-br from-blue-500 to-green-500 text-white group-hover:scale-110 transition-transform">
                  <Stethoscope className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground">Manage Doctors</h3>
                  <p className="text-sm text-muted-foreground">
                    Create and manage doctor accounts
                  </p>
                  {stats.totalDoctors > 0 && (
                    <span className="inline-flex mt-2 items-center rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-700">
                      {stats.totalDoctors} doctors
                    </span>
                  )}
                </div>
              </div>
            </Card>
          </Link>

          <Link href="/admin/users">
            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer group">
              <div className="flex items-center gap-4">
                <div className="rounded-lg p-3 bg-gradient-to-br from-purple-500 to-pink-500 text-white group-hover:scale-110 transition-transform">
                  <Users className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground">Manage Users</h3>
                  <p className="text-sm text-muted-foreground">
                    View and manage all users
                  </p>
                </div>
              </div>
            </Card>
          </Link>

          <Link href="/admin/ambulance-services">
            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer group">
              <div className="flex items-center gap-4">
                <div className="rounded-lg p-3 bg-gradient-to-br from-red-500 to-pink-500 text-white group-hover:scale-110 transition-transform">
                  <Ambulance className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground">Ambulance Services</h3>
                  <p className="text-sm text-muted-foreground">
                    Manage ambulance providers
                  </p>
                </div>
              </div>
            </Card>
          </Link>

          <Link href="/admin/orders">
            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer group">
              <div className="flex items-center gap-4">
                <div className="rounded-lg p-3 bg-gradient-to-br from-yellow-500 to-orange-500 text-white group-hover:scale-110 transition-transform">
                  <Package className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground">Medicine Orders</h3>
                  <p className="text-sm text-muted-foreground">
                    View and manage customer orders
                  </p>
                </div>
              </div>
            </Card>
          </Link>

          <Link href="/admin/appointments">
            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer group">
              <div className="flex items-center gap-4">
                <div className="rounded-lg p-3 bg-gradient-to-br from-indigo-500 to-blue-500 text-white group-hover:scale-110 transition-transform">
                  <ClipboardList className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground">All Appointments</h3>
                  <p className="text-sm text-muted-foreground">
                    View all system appointments
                  </p>
                </div>
              </div>
            </Card>
          </Link>
        </div>
      </div>

      {/* Info Notice */}
      <Card className="p-6 bg-gradient-to-r from-red-50 to-orange-50 border-red-200">
        <div className="flex items-center gap-4">
          <div className="rounded-full bg-white p-3">
            <Shield className="h-6 w-6 text-red-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground">Admin Access</h3>
            <p className="text-sm text-muted-foreground">
              You have full administrative access to the Sylhet Health Hub platform.
              All actions are logged for security purposes.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
