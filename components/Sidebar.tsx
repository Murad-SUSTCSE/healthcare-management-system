'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  Calendar,
  MapPin,
  Pill,
  Ambulance,
  User,
  LogOut,
  Heart,
  Menu,
  X,
  Shield,
  Stethoscope,
  Users,
  Clock,
} from 'lucide-react';

// Regular user navigation items
const userNavItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
  { icon: Calendar, label: 'Appointments', href: '/appointments' },
  { icon: MapPin, label: 'Hospitals', href: '/hospitals' },
  { icon: Pill, label: 'Medicine', href: '/medicine' },
  { icon: Ambulance, label: 'Ambulance', href: '/ambulance' },
  { icon: User, label: 'Profile', href: '/profile' },
];

// Doctor navigation items
const doctorNavItems = [
  { icon: Stethoscope, label: 'Doctor Dashboard', href: '/doctor-dashboard' },
  { icon: Calendar, label: 'My Appointments', href: '/doctor-dashboard?tab=appointments' },
  { icon: Clock, label: 'Availability', href: '/doctor-dashboard?tab=availability' },
  { icon: User, label: 'My Profile', href: '/doctor-dashboard?tab=profile' },
];

// Admin navigation items
const adminNavItems = [
  { icon: LayoutDashboard, label: 'Admin Dashboard', href: '/admin' },
  { icon: Stethoscope, label: 'Manage Doctors', href: '/admin/manage-doctors' },
  { icon: Users, label: 'Manage Users', href: '/admin/users' },
  { icon: Calendar, label: 'All Appointments', href: '/admin/appointments' },
  { icon: Ambulance, label: 'Ambulance Services', href: '/admin/ambulance-services' },
  { icon: Pill, label: 'Medicine Orders', href: '/admin/orders' },
];

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useAuth();

  // Check if user is admin or doctor
  const isAdmin = user?.role === 'ADMIN';
  const isDoctor = user?.role === 'DOCTOR';

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="sticky top-0 z-20 flex items-center justify-between border-b border-border/50 bg-card/95 backdrop-blur-xl p-4 lg:hidden">
        <div className="flex items-center gap-2">
          <div className={`rounded-xl p-1.5 shadow-md ${isAdmin ? 'bg-gradient-to-br from-rose-500 to-orange-500 shadow-rose-500/25' : isDoctor ? 'bg-gradient-to-br from-teal-500 to-cyan-500 shadow-teal-500/25' : 'bg-gradient-to-br from-indigo-500 to-purple-600 shadow-indigo-500/25'}`}>
            {isAdmin ? <Shield className="h-5 w-5 text-white" /> : isDoctor ? <Stethoscope className="h-5 w-5 text-white" /> : <Heart className="h-5 w-5 text-white" />}
          </div>
          <span className="font-semibold text-foreground">{isAdmin ? 'Admin Panel' : isDoctor ? 'Doctor Portal' : 'Health Hub'}</span>
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="rounded-xl p-2 hover:bg-muted transition-colors"
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-10 w-64 border-r border-border/50 bg-card/95 backdrop-blur-xl transition-transform duration-300 lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo */}
        <div className="hidden border-b border-border/50 p-6 lg:flex lg:items-center lg:gap-3">
          <div className={`rounded-xl p-2.5 shadow-lg ${isAdmin ? 'bg-gradient-to-br from-rose-500 to-orange-500 shadow-rose-500/25' : isDoctor ? 'bg-gradient-to-br from-teal-500 to-cyan-500 shadow-teal-500/25' : 'bg-gradient-to-br from-indigo-500 to-purple-600 shadow-indigo-500/25'}`}>
            {isAdmin ? <Shield className="h-6 w-6 text-white" /> : isDoctor ? <Stethoscope className="h-6 w-6 text-white" /> : <Heart className="h-6 w-6 text-white" />}
          </div>
          <div>
            <h1 className="font-bold text-foreground">{isAdmin ? 'Admin Panel' : isDoctor ? 'Doctor Portal' : 'Sylhet Health Hub'}</h1>
            <p className="text-xs text-muted-foreground">{isAdmin ? 'System Administration' : isDoctor ? 'Manage your practice' : 'Healthcare at your fingertips'}</p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 space-y-1.5 p-4">
          {/* Show appropriate nav items based on role */}
          {(isAdmin ? adminNavItems : isDoctor ? doctorNavItems : userNavItems).map((item) => {
            const Icon = item.icon;
            const isActive = isAdmin 
              ? pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))
              : isDoctor
              ? pathname === item.href || pathname.startsWith('/doctor-dashboard')
              : pathname === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <button
                  onClick={() => setIsOpen(false)}
                  className={`w-full flex items-center gap-3 rounded-xl px-4 py-3 text-left font-medium transition-all duration-200 ${
                    isActive
                      ? isAdmin 
                        ? 'bg-gradient-to-r from-rose-500 to-orange-500 text-white shadow-lg shadow-rose-500/25'
                        : isDoctor
                        ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-lg shadow-teal-500/25'
                        : 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/25'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </button>
              </Link>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div className="border-t border-border/50 p-4">
          <Button
            onClick={() => {
              logout();
              setIsOpen(false);
            }}
            variant="outline"
            className="w-full justify-start rounded-xl gap-3 border-destructive/30 text-destructive hover:bg-destructive/10 hover:border-destructive/50"
          >
            <LogOut className="h-5 w-5" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-5 bg-black/50 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
