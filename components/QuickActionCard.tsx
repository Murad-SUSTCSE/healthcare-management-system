'use client';

import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, type LucideIcon } from 'lucide-react';

interface QuickActionCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  href: string;
  color: 'blue' | 'green' | 'orange' | 'red';
}

const colorMap = {
  blue: {
    bg: 'bg-blue-100',
    text: 'text-blue-600',
    gradient: 'from-blue-100 to-blue-50',
  },
  green: {
    bg: 'bg-green-100',
    text: 'text-green-600',
    gradient: 'from-green-100 to-green-50',
  },
  orange: {
    bg: 'bg-orange-100',
    text: 'text-orange-600',
    gradient: 'from-orange-100 to-orange-50',
  },
  red: {
    bg: 'bg-red-100',
    text: 'text-red-600',
    gradient: 'from-red-100 to-red-50',
  },
};

export function QuickActionCard({
  icon: Icon,
  title,
  description,
  href,
  color,
}: QuickActionCardProps) {
  const colors = colorMap[color];

  return (
    <Link href={href}>
      <Card className={`h-full cursor-pointer overflow-hidden bg-gradient-to-br ${colors.gradient} transition-all duration-300 hover:shadow-lg hover:scale-105`}>
        <div className="p-6">
          <div className={`mb-4 inline-flex rounded-lg ${colors.bg} p-3`}>
            <Icon className={`h-8 w-8 ${colors.text}`} />
          </div>
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
          <p className="mt-2 text-sm text-muted-foreground">{description}</p>
          <div className="mt-4 flex items-center text-primary font-medium">
            Get Started
            <ArrowRight className="ml-2 h-4 w-4" />
          </div>
        </div>
      </Card>
    </Link>
  );
}
