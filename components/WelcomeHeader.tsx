'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/card';
import { Stethoscope } from 'lucide-react';

export function WelcomeHeader() {
  const { user } = useAuth();
  const hour = new Date().getHours();

  let greeting = 'Good morning';
  if (hour >= 12 && hour < 18) {
    greeting = 'Good afternoon';
  } else if (hour >= 18) {
    greeting = 'Good evening';
  }

  return (
    <Card className="overflow-hidden bg-gradient-to-r from-blue-500 via-blue-400 to-green-500">
      <div className="flex items-center justify-between px-6 py-8 md:px-8">
        <div>
          <h1 className="text-2xl font-bold text-white md:text-3xl">
            {greeting}, {user?.name?.split(' ')[0]}! 👋
          </h1>
          <p className="mt-2 text-blue-100">
            Welcome back to Sylhet Health Hub
          </p>
        </div>
        <div className="hidden rounded-full bg-white/20 p-4 md:flex">
          <Stethoscope className="h-8 w-8 text-white" />
        </div>
      </div>
    </Card>
  );
}
