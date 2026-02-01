'use client';

import { useEffect, useRef } from 'react';
import type { Hospital } from '@/types';

interface HospitalMapProps {
  hospitals: Hospital[];
  selectedHospital?: Hospital;
}

export function HospitalMap({ hospitals, selectedHospital }: HospitalMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    // For now, we'll create a simple visualization without requiring Google Maps API
    // In production, integrate with Google Maps API by adding the script
    const canvas = document.createElement('canvas');
    canvas.width = mapContainer.current.clientWidth;
    canvas.height = mapContainer.current.clientHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw background
    ctx.fillStyle = '#f0f8ff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 1;
    for (let i = 0; i < canvas.width; i += 40) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, canvas.height);
      ctx.stroke();
    }
    for (let i = 0; i < canvas.height; i += 40) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(canvas.width, i);
      ctx.stroke();
    }

    // Draw hospitals as points
    hospitals.forEach((hospital, idx) => {
      // Generate pseudo-coordinates based on hospital data
      const x = (parseInt(hospital.latitude.toString()) % 100) * (canvas.width / 100);
      const y = (parseInt(hospital.longitude.toString()) % 100) * (canvas.height / 100);

      const isSelected = selectedHospital?.id === hospital.id;

      // Draw marker
      ctx.fillStyle = isSelected ? '#ff6b6b' : '#3b82f6';
      ctx.beginPath();
      ctx.arc(x, y, isSelected ? 12 : 8, 0, Math.PI * 2);
      ctx.fill();

      // Draw marker ring for selected
      if (isSelected) {
        ctx.strokeStyle = '#ff6b6b';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(x, y, 16, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Draw hospital initial
      ctx.fillStyle = 'white';
      ctx.font = 'bold 10px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText((idx + 1).toString(), x, y);
    });

    mapContainer.current.innerHTML = '';
    mapContainer.current.appendChild(canvas);
  }, [hospitals, selectedHospital]);

  return (
    <div
      ref={mapContainer}
      className="relative h-full min-h-96 w-full rounded-lg border border-border bg-gradient-to-br from-blue-50 to-green-50"
    />
  );
}
