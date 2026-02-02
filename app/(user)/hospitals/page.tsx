'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Search,
  MapPin,
  Building2,
  Phone,
  Clock,
  Navigation,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { apiService } from '@/services/api';

interface Hospital {
  id: string | number;
  name: string;
  address: string;
  phone: string;
  latitude?: number;
  longitude?: number;
  emergencyService?: boolean;
  type?: string;
  departments?: string[];
}

// Fallback hardcoded hospitals with coordinates (used if API fails)
const FALLBACK_HOSPITALS: Hospital[] = [
  {
    id: '1',
    name: 'Sylhet MAG Osmani Medical College Hospital',
    address: 'Medical College Road, Sylhet',
    phone: '0821-716001',
    latitude: 24.9048,
    longitude: 91.8600,
    emergencyService: true,
    type: 'Government',
    departments: ['Emergency', 'Surgery', 'Medicine', 'Pediatrics', 'Gynecology'],
  },
  {
    id: '2',
    name: 'Mount Adora Hospital',
    address: 'Subhanighat, Sylhet',
    phone: '0821-2830000',
    latitude: 24.8989,
    longitude: 91.8736,
    emergencyService: true,
    type: 'Private',
    departments: ['Cardiology', 'Neurology', 'Orthopedics', 'ICU'],
  },
  {
    id: '3',
    name: 'Jalalabad Ragib Rabeya Medical College Hospital',
    address: 'Pathantula, Sylhet',
    phone: '0821-761001',
    latitude: 24.9128,
    longitude: 91.8492,
    emergencyService: true,
    type: 'Private',
    departments: ['Surgery', 'Medicine', 'Cardiology', 'Nephrology'],
  },
  {
    id: '4',
    name: 'North East Medical College Hospital',
    address: 'South Surma, Sylhet',
    phone: '0821-2890001',
    latitude: 24.8722,
    longitude: 91.8844,
    emergencyService: true,
    type: 'Private',
    departments: ['Emergency', 'Surgery', 'Pediatrics', 'Gynecology'],
  },
  {
    id: '5',
    name: 'Sylhet Women\'s Medical College Hospital',
    address: 'Mirboxtola, Sylhet',
    phone: '0821-717901',
    latitude: 24.9015,
    longitude: 91.8710,
    emergencyService: true,
    type: 'Private',
    departments: ['Gynecology', 'Obstetrics', 'Pediatrics', 'Neonatology'],
  },
  {
    id: '6',
    name: 'Ibn Sina Hospital Sylhet',
    address: 'Zindabazar, Sylhet',
    phone: '0821-725678',
    latitude: 24.8945,
    longitude: 91.8695,
    emergencyService: true,
    type: 'Private',
    departments: ['Cardiology', 'Gastroenterology', 'Orthopedics', 'ENT'],
  },
  {
    id: '7',
    name: 'Oasis Hospital',
    address: 'Amberkhana, Sylhet',
    phone: '0821-2831234',
    latitude: 24.9005,
    longitude: 91.8750,
    emergencyService: true,
    type: 'Private',
    departments: ['General Medicine', 'Surgery', 'Diagnostics'],
  },
  {
    id: '8',
    name: 'Popular Diagnostic Centre Sylhet',
    address: 'Bondor, Sylhet',
    phone: '0821-720123',
    latitude: 24.8920,
    longitude: 91.8680,
    emergencyService: false,
    type: 'Diagnostic',
    departments: ['Pathology', 'Radiology', 'Cardiology', 'Health Checkup'],
  },
  {
    id: '9',
    name: 'Medinova Medical Services',
    address: 'Zindabazar, Sylhet',
    phone: '0821-718500',
    latitude: 24.8950,
    longitude: 91.8700,
    emergencyService: false,
    type: 'Diagnostic',
    departments: ['Diagnostics', 'Consultation', 'Lab Services'],
  },
  {
    id: '10',
    name: 'Shahjalal Upazila Health Complex',
    address: 'Airport Road, Sylhet',
    phone: '0821-723456',
    latitude: 24.9630,
    longitude: 91.8830,
    emergencyService: true,
    type: 'Government',
    departments: ['General Medicine', 'Emergency', 'Vaccination'],
  },
];

export default function HospitalsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHospitals = async () => {
      try {
        setIsLoading(true);
        const data = await apiService.getHospitals();
        // Merge API data with fallback data for additional fields
        const mergedHospitals = data.map((apiHospital: any) => {
          const fallback = FALLBACK_HOSPITALS.find(
            (h) => h.name.toLowerCase().includes(apiHospital.name.toLowerCase().split(' ')[0]) ||
                   apiHospital.name.toLowerCase().includes(h.name.toLowerCase().split(' ')[0])
          );
          return {
            ...apiHospital,
            id: String(apiHospital.id),
            emergencyService: fallback?.emergencyService ?? true,
            type: fallback?.type ?? 'Private',
            departments: fallback?.departments ?? ['General Medicine', 'Emergency'],
          };
        });
        // If API returns hospitals, use them; otherwise use fallback
        setHospitals(mergedHospitals.length > 0 ? mergedHospitals : FALLBACK_HOSPITALS);
      } catch (error) {
        console.error('Failed to fetch hospitals:', error);
        setHospitals(FALLBACK_HOSPITALS);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHospitals();
  }, []);

  const filteredHospitals = hospitals.filter(
    (h) =>
      h.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      h.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (h.type?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
  );

  const openGoogleMapsDirections = (hospital: Hospital) => {
    // Use coordinates if available for accurate directions
    if (hospital.latitude && hospital.longitude) {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${hospital.latitude},${hospital.longitude}`;
      window.open(url, '_blank');
    } else {
      // Fallback to name and address
      const destination = encodeURIComponent(`${hospital.name}, ${hospital.address}`);
      const url = `https://www.google.com/maps/dir/?api=1&destination=${destination}`;
      window.open(url, '_blank');
    }
  };

  const emergencyCount = filteredHospitals.filter((h) => h.emergencyService).length;

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
          <p className="mt-4 text-muted-foreground">Loading hospitals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Find Hospitals</h1>
        <p className="mt-2 text-muted-foreground">
          Discover healthcare facilities in Sylhet
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
        <Input
          placeholder="Search by hospital name, location, or type..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 rounded-lg"
        />
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Hospitals</p>
              <p className="mt-1 text-2xl font-bold text-foreground">
                {filteredHospitals.length}
              </p>
            </div>
            <div className="rounded-lg bg-blue-100 p-3">
              <Building2 className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Emergency Services</p>
              <p className="mt-1 text-2xl font-bold text-foreground">{emergencyCount}</p>
            </div>
            <div className="rounded-lg bg-red-100 p-3">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Hospitals List */}
      <div>
        <h2 className="mb-4 text-xl font-semibold text-foreground">
          Hospitals in Sylhet ({filteredHospitals.length})
        </h2>

        {filteredHospitals.length === 0 ? (
          <Card className="p-12 text-center">
            <MapPin className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
            <p className="mt-4 text-lg text-muted-foreground">
              No hospitals found matching your search
            </p>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredHospitals.map((hospital) => (
              <Card key={hospital.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-xl ${
                      hospital.type === 'Government' 
                        ? 'bg-green-100 text-green-600' 
                        : hospital.type === 'Diagnostic'
                        ? 'bg-purple-100 text-purple-600'
                        : 'bg-blue-100 text-blue-600'
                    }`}>
                      <Building2 className="h-6 w-6" />
                    </div>
                    <div>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        hospital.type === 'Government'
                          ? 'bg-green-100 text-green-700'
                          : hospital.type === 'Diagnostic'
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {hospital.type}
                      </span>
                      {hospital.emergencyService && (
                        <span className="ml-2 text-xs font-medium px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                          24/7 Emergency
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-foreground mb-2">
                  {hospital.name}
                </h3>

                <div className="flex items-start gap-2 mb-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>{hospital.address}</span>
                </div>

                <div className="flex items-center gap-2 mb-4 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <a href={`tel:${hospital.phone}`} className="text-primary hover:underline">
                    {hospital.phone}
                  </a>
                </div>

                {/* Departments */}
                <div className="mb-4">
                  <div className="flex flex-wrap gap-1">
                    {hospital.departments.slice(0, 3).map((dept) => (
                      <span
                        key={dept}
                        className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600"
                      >
                        {dept}
                      </span>
                    ))}
                    {hospital.departments.length > 3 && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
                        +{hospital.departments.length - 3}
                      </span>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-4 border-t">
                  <Button
                    onClick={() => openGoogleMapsDirections(hospital)}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
                  >
                    <Navigation className="h-4 w-4 mr-2" />
                    Directions
                  </Button>
                  <a href={`tel:${hospital.phone}`} className="flex-1">
                    <Button variant="outline" className="w-full">
                      <Phone className="h-4 w-4 mr-2" />
                      Call
                    </Button>
                  </a>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Info Card */}
      <Card className="p-6 bg-gradient-to-r from-blue-50 to-green-50 border-blue-200">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-full bg-white">
            <Clock className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h3 className="font-bold text-foreground">Emergency Services</h3>
            <p className="text-sm text-muted-foreground">
              Most hospitals offer 24/7 emergency services. Call ahead or dial 999 for emergencies.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
