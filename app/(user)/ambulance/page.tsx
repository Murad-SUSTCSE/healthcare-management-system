'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Ambulance,
  Phone,
  AlertCircle,
  CheckCircle,
  Clock,
  MapPin,
  Loader2,
  PhoneCall,
} from 'lucide-react';
import { apiService } from '@/services/api';
import type { AmbulanceService } from '@/types';

export default function AmbulancePage() {
  const [services, setServices] = useState<AmbulanceService[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setIsLoading(true);
        const data = await apiService.getAmbulanceServices();
        setServices(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load ambulance services');
      } finally {
        setIsLoading(false);
      }
    };

    fetchServices();
  }, []);

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Ambulance Services</h1>
        <p className="mt-2 text-muted-foreground">
          Emergency medical transportation available 24/7
        </p>
      </div>

      {/* Emergency Alert */}
      <Card className="border-red-200 bg-gradient-to-r from-red-50 to-orange-50">
        <div className="flex items-center gap-3 p-6">
          <AlertCircle className="h-6 w-6 text-red-600 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-red-900">Emergency?</h3>
            <p className="mt-1 text-sm text-red-700">
              In case of life-threatening emergency, call <strong>999</strong> immediately
            </p>
          </div>
          <a href="tel:999" className="ml-auto">
            <Button className="bg-red-600 hover:bg-red-700">
              <PhoneCall className="h-4 w-4 mr-2" /> Call 999
            </Button>
          </a>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Ambulance Services List */}
        <div className="lg:col-span-2">
          <h2 className="text-lg font-bold text-foreground mb-4">
            Available Ambulance Services
          </h2>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : error ? (
            <Card className="p-6 text-center border-red-200">
              <AlertCircle className="mx-auto h-12 w-12 text-red-500 opacity-50" />
              <p className="mt-4 text-lg text-red-600">{error}</p>
            </Card>
          ) : services.length === 0 ? (
            <Card className="p-12 text-center">
              <Ambulance className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
              <p className="mt-4 text-lg text-muted-foreground">
                No ambulance services available at the moment
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                Please call 999 for emergencies
              </p>
            </Card>
          ) : (
            <div className="space-y-4">
              {services.map((service) => (
                <Card key={service.id} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="p-3 rounded-xl bg-red-100 text-red-600">
                        <Ambulance className="h-8 w-8" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-foreground">
                          {service.companyName}
                        </h3>
                        {service.address && (
                          <div className="flex items-center gap-1 mt-1 text-sm text-muted-foreground">
                            <MapPin className="h-3 w-3" />
                            {service.address}
                          </div>
                        )}
                        {service.description && (
                          <p className="mt-2 text-sm text-muted-foreground">
                            {service.description}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">Call Now</p>
                        <p className="text-lg font-bold text-primary font-mono">
                          {service.phone}
                        </p>
                      </div>
                      <a href={`tel:${service.phone.replace(/[^0-9+]/g, '')}`}>
                        <Button className="bg-green-600 hover:bg-green-700 rounded-full h-12 w-12 p-0">
                          <Phone className="h-5 w-5" />
                        </Button>
                      </a>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Info Cards */}
        <div className="space-y-4">
          {/* Emergency Number */}
          <Card className="border-red-200 bg-red-50 p-6">
            <p className="text-sm font-semibold text-red-900 mb-2">
              National Emergency Hotline
            </p>
            <a href="tel:999" className="block">
              <p className="text-4xl font-bold text-red-600 font-mono">999</p>
            </a>
            <p className="mt-2 text-xs text-red-700">
              Call immediately for life-threatening emergencies
            </p>
          </Card>

          {/* Response Time */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="h-5 w-5 text-primary" />
              <p className="font-semibold text-foreground">Response Time</p>
            </div>
            <p className="text-2xl font-bold text-primary">5-15 min</p>
            <p className="mt-2 text-xs text-muted-foreground">
              Average response time in city areas
            </p>
          </Card>

          {/* Service Coverage */}
          <Card className="p-6">
            <p className="font-semibold text-foreground mb-3">What to Expect</p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                24/7 Availability
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Trained Medical Staff
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Equipped Ambulances
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Hospital Coordination
              </li>
            </ul>
          </Card>

          {/* Tips */}
          <Card className="p-6 border-blue-200 bg-blue-50">
            <p className="font-semibold text-blue-900 mb-3">When Calling</p>
            <ul className="space-y-2 text-sm text-blue-800">
              <li>• State your location clearly</li>
              <li>• Describe the emergency</li>
              <li>• Stay on the line</li>
              <li>• Follow instructions given</li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}
