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
      <Card className="relative overflow-hidden border-0 bg-gradient-to-r from-rose-600 via-orange-500 to-amber-500 shadow-xl shadow-rose-500/20">
        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-4 -right-4 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
          <div className="absolute top-1/2 left-1/4 w-48 h-48 bg-orange-400/20 rounded-full blur-3xl"></div>
        </div>
        <div className="relative flex items-center gap-4 p-6">
          <div className="rounded-2xl bg-white/20 backdrop-blur-sm p-4 shadow-lg">
            <Shield className="h-10 w-10 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
            <p className="mt-1 text-white/80">Welcome back, {user?.name}</p>
          </div>
        </div>
      </Card>

      {/* Quick Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="p-6 bg-card/80 backdrop-blur-sm border-border/50 border-l-4 border-l-blue-500 shadow-lg hover:shadow-xl transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Doctors</p>
              <p className="mt-1 text-3xl font-bold text-foreground">
                {isLoading ? '-' : stats.totalDoctors}
              </p>
            </div>
            <div className="rounded-xl p-3 bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/25">
              <Stethoscope className="h-6 w-6 text-white" />
            </div>
          </div>
        </Card>
        <Card className="p-6 bg-card/80 backdrop-blur-sm border-border/50 border-l-4 border-l-emerald-500 shadow-lg hover:shadow-xl transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Users</p>
              <p className="mt-1 text-3xl font-bold text-foreground">
                {isLoading ? '-' : stats.totalUsers}
              </p>
            </div>
            <div className="rounded-xl p-3 bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/25">
              <Users className="h-6 w-6 text-white" />
            </div>
          </div>
        </Card>
        <Card className="p-6 bg-card/80 backdrop-blur-sm border-border/50 border-l-4 border-l-purple-500 shadow-lg hover:shadow-xl transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Appointments</p>
              <p className="mt-1 text-3xl font-bold text-foreground">
                {isLoading ? '-' : stats.totalAppointments}
              </p>
            </div>
            <div className="rounded-xl p-3 bg-gradient-to-br from-purple-500 to-pink-600 shadow-lg shadow-purple-500/25">
              <ClipboardList className="h-6 w-6 text-white" />
            </div>
          </div>
        </Card>
      </div>

      {/* Admin Actions */}
      <div>
        <h2 className="mb-4 text-2xl font-bold text-foreground">Admin Actions</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Link href="/admin/manage-doctors">
            <Card className="p-6 bg-card/80 backdrop-blur-sm border-border/50 hover:shadow-xl transition-all cursor-pointer group hover:-translate-y-1">
              <div className="flex items-center gap-4">
                <div className="rounded-xl p-3 bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg shadow-blue-500/25 group-hover:scale-110 transition-transform">
                  <Stethoscope className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground group-hover:text-primary transition-colors">Manage Doctors</h3>
                  <p className="text-sm text-muted-foreground">
                    Create and manage doctor accounts
                  </p>
                  {stats.totalDoctors > 0 && (
                    <span className="inline-flex mt-2 items-center rounded-full bg-blue-500/10 border border-blue-500/20 px-2.5 py-1 text-xs font-semibold text-blue-600">
                      {stats.totalDoctors} doctors
                    </span>
                  )}
                </div>
              </div>
            </Card>
          </Link>

          <Link href="/admin/users">
            <Card className="p-6 bg-card/80 backdrop-blur-sm border-border/50 hover:shadow-xl transition-all cursor-pointer group hover:-translate-y-1">
              <div className="flex items-center gap-4">
                <div className="rounded-xl p-3 bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg shadow-purple-500/25 group-hover:scale-110 transition-transform">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground group-hover:text-primary transition-colors">Manage Users</h3>
                  <p className="text-sm text-muted-foreground">
                    View and manage all users
                  </p>
                </div>
              </div>
            </Card>
          </Link>

          <Link href="/admin/ambulance-services">
            <Card className="p-6 bg-card/80 backdrop-blur-sm border-border/50 hover:shadow-xl transition-all cursor-pointer group hover:-translate-y-1">
              <div className="flex items-center gap-4">
                <div className="rounded-xl p-3 bg-gradient-to-br from-rose-500 to-red-500 shadow-lg shadow-rose-500/25 group-hover:scale-110 transition-transform">
                  <Ambulance className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground group-hover:text-primary transition-colors">Ambulance Services</h3>
                  <p className="text-sm text-muted-foreground">
                    Manage ambulance providers
                  </p>
                </div>
              </div>
            </Card>
          </Link>

          <Link href="/admin/orders">
            <Card className="p-6 bg-card/80 backdrop-blur-sm border-border/50 hover:shadow-xl transition-all cursor-pointer group hover:-translate-y-1">
              <div className="flex items-center gap-4">
                <div className="rounded-xl p-3 bg-gradient-to-br from-amber-500 to-orange-500 shadow-lg shadow-amber-500/25 group-hover:scale-110 transition-transform">
                  <Package className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground group-hover:text-primary transition-colors">Medicine Orders</h3>
                  <p className="text-sm text-muted-foreground">
                    View and manage customer orders
                  </p>
                </div>
              </div>
            </Card>
          </Link>

          <Link href="/admin/appointments">
            <Card className="p-6 bg-card/80 backdrop-blur-sm border-border/50 hover:shadow-xl transition-all cursor-pointer group hover:-translate-y-1">
              <div className="flex items-center gap-4">
                <div className="rounded-xl p-3 bg-gradient-to-br from-indigo-500 to-violet-500 shadow-lg shadow-indigo-500/25 group-hover:scale-110 transition-transform">
                  <ClipboardList className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground group-hover:text-primary transition-colors">All Appointments</h3>
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
      <Card className="relative overflow-hidden p-6 bg-gradient-to-r from-rose-500/10 via-orange-500/10 to-amber-500/10 border-rose-200/50 shadow-lg">
        <div className="absolute top-0 right-0 w-24 h-24 bg-orange-400/10 rounded-full blur-2xl"></div>
        <div className="relative flex items-center gap-4">
          <div className="rounded-xl bg-gradient-to-br from-rose-500 to-orange-500 p-3 shadow-lg shadow-rose-500/25">
            <Shield className="h-6 w-6 text-white" />
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
