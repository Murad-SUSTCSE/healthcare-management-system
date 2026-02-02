'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  LogOut,
  Heart,
  User,
  Home,
  Calendar,
  MapPin,
  Pill,
  Ambulance,
  Stethoscope,
  Shield,
  Menu,
  X,
} from 'lucide-react';
import { useState } from 'react';

export function Header() {
  const pathname = usePathname();
  const { user, logout, isAuthenticated } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isAdmin = user?.role === 'ADMIN';
  const isDoctor = user?.role === 'DOCTOR';

  // Navigation items based on role
  const navItems = isAdmin
    ? [
        { icon: Home, label: 'Dashboard', href: '/admin' },
        { icon: Stethoscope, label: 'Manage Doctors', href: '/admin/manage-doctors' },
        { icon: Calendar, label: 'Appointments', href: '/admin/appointments' },
      ]
    : isDoctor
    ? [
        { icon: Stethoscope, label: 'Dashboard', href: '/doctor-dashboard' },
        { icon: User, label: 'Profile', href: '/profile' },
      ]
    : [
        { icon: Home, label: 'Dashboard', href: '/dashboard' },
        { icon: Calendar, label: 'Appointments', href: '/appointments' },
        { icon: MapPin, label: 'Hospitals', href: '/hospitals' },
        { icon: Pill, label: 'Medicine', href: '/medicine' },
        { icon: Ambulance, label: 'Ambulance', href: '/ambulance' },
        { icon: User, label: 'Profile', href: '/profile' },
      ];

  if (!isAuthenticated) {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-card/80 backdrop-blur-xl supports-[backdrop-filter]:bg-card/60 shadow-sm">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href={isAdmin ? '/admin' : isDoctor ? '/doctor-dashboard' : '/dashboard'} className="flex items-center gap-2.5 group">
          <div className={`rounded-xl p-2 shadow-lg transition-transform group-hover:scale-105 ${isAdmin ? 'bg-gradient-to-br from-rose-500 to-orange-500' : isDoctor ? 'bg-gradient-to-br from-teal-500 to-cyan-500' : 'bg-gradient-to-br from-blue-500 to-indigo-500'}`}>
            {isAdmin ? <Shield className="h-5 w-5 text-white" /> : isDoctor ? <Stethoscope className="h-5 w-5 text-white" /> : <Heart className="h-5 w-5 text-white" />}
          </div>
          <span className="font-bold text-foreground hidden sm:inline bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
            {isAdmin ? 'Admin Panel' : isDoctor ? 'Doctor Portal' : 'Sylhet Health Hub'}
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1 bg-muted/50 rounded-full p-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || 
              (item.href !== '/dashboard' && item.href !== '/admin' && item.href !== '/doctor-dashboard' && pathname.startsWith(item.href + '/'));
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive ? 'default' : 'ghost'}
                  size="sm"
                  className={`gap-2 rounded-full transition-all ${isActive ? 'shadow-md' : 'text-muted-foreground hover:text-foreground hover:bg-background/80'}`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Button>
              </Link>
            );
          })}
        </nav>

        {/* Right side - User info and Logout */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/50">
            <div className={`h-2 w-2 rounded-full animate-pulse ${isAdmin ? 'bg-rose-500' : isDoctor ? 'bg-teal-500' : 'bg-green-500'}`}></div>
            <span className="text-sm font-medium text-foreground">
              {user?.name}
            </span>
          </div>
          <Button
            onClick={logout}
            variant="outline"
            size="sm"
            className="gap-2 rounded-full border-destructive/30 text-destructive hover:bg-destructive/10 hover:border-destructive/50"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Logout</span>
          </Button>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden rounded-lg p-2 hover:bg-muted"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-card">
          <nav className="container px-4 py-2 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || 
                (item.href !== '/dashboard' && item.href !== '/admin' && item.href !== '/doctor-dashboard' && pathname.startsWith(item.href + '/'));
              return (
                <Link key={item.href} href={item.href} onClick={() => setMobileMenuOpen(false)}>
                  <Button
                    variant={isActive ? 'default' : 'ghost'}
                    className="w-full justify-start gap-3"
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Button>
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
}
