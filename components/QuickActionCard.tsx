'use client';

import Link from 'next/link';
import { Card } from '@/components/ui/card';
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
    bg: 'bg-gradient-to-br from-blue-500 to-indigo-600',
    iconBg: 'bg-white/20',
    text: 'text-white',
    shadow: 'shadow-blue-500/25',
  },
  green: {
    bg: 'bg-gradient-to-br from-emerald-500 to-teal-600',
    iconBg: 'bg-white/20',
    text: 'text-white',
    shadow: 'shadow-emerald-500/25',
  },
  orange: {
    bg: 'bg-gradient-to-br from-orange-500 to-amber-600',
    iconBg: 'bg-white/20',
    text: 'text-white',
    shadow: 'shadow-orange-500/25',
  },
  red: {
    bg: 'bg-gradient-to-br from-rose-500 to-red-600',
    iconBg: 'bg-white/20',
    text: 'text-white',
    shadow: 'shadow-rose-500/25',
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
      <Card className={`group h-full cursor-pointer overflow-hidden ${colors.bg} border-0 shadow-lg ${colors.shadow} transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] hover:-translate-y-1`}>
        <div className="p-6 relative">
          {/* Decorative circles */}
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-8 translate-x-8"></div>
          <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/5 rounded-full translate-y-8 -translate-x-4"></div>
          
          <div className={`relative mb-4 inline-flex rounded-xl ${colors.iconBg} backdrop-blur-sm p-3.5 shadow-inner`}>
            <Icon className={`h-7 w-7 ${colors.text}`} />
          </div>
          <h3 className={`text-lg font-bold ${colors.text}`}>{title}</h3>
          <p className={`mt-2 text-sm ${colors.text} opacity-90`}>{description}</p>
          <div className={`mt-4 flex items-center ${colors.text} font-semibold text-sm group-hover:translate-x-1 transition-transform`}>
            Get Started
            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </Card>
    </Link>
  );
}
