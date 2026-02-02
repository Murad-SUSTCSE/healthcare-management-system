'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Heart, MapPin, Pill, Ambulance, Users, ArrowRight } from 'lucide-react';

export default function Home() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();

  // Helper function to get redirect path based on user role
  const getRedirectPath = (role?: string): string => {
    switch (role) {
      case 'ADMIN':
        return '/admin';
      case 'DOCTOR':
        return '/doctor-dashboard';
      default:
        return '/dashboard';
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Navigation */}
      <nav className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-gradient-to-br from-blue-500 to-green-500 p-2">
              <Heart className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-foreground">Sylhet Health Hub</span>
          </div>
          <div className="flex gap-3">
            {isAuthenticated ? (
              <Button
                onClick={() => router.push(getRedirectPath(user?.role))}
                className="rounded-xl bg-gradient-to-r from-blue-500 to-green-500 text-white"
              >
                Go to Dashboard
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={() => router.push('/login')}
                  className="rounded-xl"
                >
                  Sign In
                </Button>
                <Button
                  onClick={() => router.push('/register')}
                  className="rounded-xl"
                >
                  Get Started
                </Button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-8 lg:items-center">
          <div>
            <h1 className="text-5xl font-bold leading-tight text-foreground">
              Your Health, Our Priority
            </h1>
            <p className="mt-4 text-xl text-muted-foreground">
              Access healthcare services with ease. Book appointments, find hospitals, order medicine, and get emergency assistance all in one place.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button
                size="lg"
                onClick={() => router.push('/register')}
                className="rounded-xl"
              >
                Start Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => router.push('/login')}
                className="rounded-xl border-2"
              >
                Sign In
              </Button>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              {
                icon: Users,
                title: 'Find Doctors',
                description: 'Connect with expert doctors easily',
              },
              {
                icon: MapPin,
                title: 'Locate Hospitals',
                description: 'Find nearby hospitals on map',
              },
              {
                icon: Pill,
                title: 'Order Medicine',
                description: 'Get medicine delivered at home',
              },
              {
                icon: Ambulance,
                title: 'Ambulance Service',
                description: 'Emergency assistance 24/7',
              },
            ].map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="rounded-2xl border border-border bg-card p-6 shadow-sm transition-all hover:shadow-md hover:border-primary"
                >
                  <div className="mb-3 inline-flex rounded-lg bg-gradient-to-br from-blue-100 to-green-100 p-3">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground">{feature.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-t border-b border-border bg-card">
        <div className="mx-auto max-w-6xl grid gap-8 px-4 py-12 sm:px-6 lg:px-8 lg:grid-cols-4">
          {[
            { number: '500+', label: 'Doctors' },
            { number: '50+', label: 'Hospitals' },
            { number: '10K+', label: 'Medicines' },
            { number: '24/7', label: 'Support' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-3xl font-bold text-primary">{stat.number}</p>
              <p className="mt-1 text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-r from-blue-100 to-green-100 p-12 text-center">
          <h2 className="text-3xl font-bold text-foreground">
            Ready to get started?
          </h2>
          <p className="mt-4 text-lg text-foreground">
            Join thousands of users who trust Sylhet Health Hub for their healthcare needs.
          </p>
          <Button
            size="lg"
            onClick={() => router.push('/register')}
            className="mt-8 rounded-xl"
          >
            Create Your Account
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="text-center text-muted-foreground">
            <p>© 2024 Sylhet Health Hub. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
