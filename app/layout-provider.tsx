'use client';

import React from "react"

import { AuthProvider } from '@/contexts/AuthContext';

export function LayoutProvider({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
}
