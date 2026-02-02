'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/card';
import { Stethoscope, Sparkles } from 'lucide-react';

export function WelcomeHeader() {
  const { user } = useAuth();
  const hour = new Date().getHours();

  let greeting = 'Good morning';
  let emoji = '🌅';
  if (hour >= 12 && hour < 18) {
    greeting = 'Good afternoon';
    emoji = '☀️';
  } else if (hour >= 18) {
    greeting = 'Good evening';
    emoji = '🌙';
  }

  return (
    <Card className="relative overflow-hidden border-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 shadow-xl shadow-purple-500/20">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-4 -right-4 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
        <div className="absolute top-1/2 left-1/4 w-48 h-48 bg-pink-400/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-8 right-1/3 w-40 h-40 bg-indigo-400/20 rounded-full blur-2xl"></div>
      </div>
      
      <div className="relative flex items-center justify-between px-6 py-8 md:px-8">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/20 backdrop-blur-sm px-3 py-1 text-sm text-white/90">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Welcome back</span>
          </div>
          <h1 className="text-2xl font-bold text-white md:text-3xl">
            {greeting}, {user?.name?.split(' ')[0]}! {emoji}
          </h1>
          <p className="text-white/80">
            Your health journey continues at Sylhet Health Hub
          </p>
        </div>
        <div className="hidden md:flex items-center gap-3">
          <div className="rounded-2xl bg-white/20 backdrop-blur-sm p-4 shadow-lg">
            <Stethoscope className="h-10 w-10 text-white" />
          </div>
        </div>
      </div>
    </Card>
  );
}
