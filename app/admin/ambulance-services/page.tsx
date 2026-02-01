'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Ambulance,
  ArrowLeft,
  Plus,
  Phone,
  MapPin,
  Edit2,
  Trash2,
  Loader2,
  CheckCircle,
  XCircle,
  Save,
  X,
} from 'lucide-react';
import { apiService } from '@/services/api';
import type { AmbulanceService } from '@/types';

export default function AmbulanceServicesPage() {
  const [services, setServices] = useState<AmbulanceService[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingService, setEditingService] = useState<AmbulanceService | null>(null);
  const [formData, setFormData] = useState({
    companyName: '',
    phone: '',
    address: '',
    description: '',
    isActive: true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setIsLoading(true);
      const data = await apiService.getAmbulanceServicesAdmin();
      setServices(data);
    } catch (err) {
      console.error('Failed to fetch ambulance services:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    setFormData({
      companyName: '',
      phone: '',
      address: '',
      description: '',
      isActive: true,
    });
    setEditingService(null);
    setError('');
    setShowAddModal(true);
  };

  const handleOpenEditModal = (service: AmbulanceService) => {
    setFormData({
      companyName: service.companyName,
      phone: service.phone,
      address: service.address || '',
      description: service.description || '',
      isActive: service.isActive,
    });
    setEditingService(service);
    setError('');
    setShowAddModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.companyName.trim() || !formData.phone.trim()) {
      setError('Company name and phone are required');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      if (editingService) {
        await apiService.updateAmbulanceService(editingService.id, formData);
      } else {
        await apiService.createAmbulanceService(formData);
      }
      await fetchServices();
      setShowAddModal(false);
      setEditingService(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save ambulance service');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this ambulance service?')) {
      return;
    }

    try {
      await apiService.deleteAmbulanceService(id);
      await fetchServices();
    } catch (err) {
      console.error('Failed to delete ambulance service:', err);
    }
  };

  const handleToggleActive = async (service: AmbulanceService) => {
    try {
      await apiService.updateAmbulanceService(service.id, {
        isActive: !service.isActive,
      });
      await fetchServices();
    } catch (err) {
      console.error('Failed to update ambulance service:', err);
    }
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" /> Back
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Ambulance Services</h1>
            <p className="text-sm text-muted-foreground">
              Manage ambulance service providers
            </p>
          </div>
        </div>
        <Button onClick={handleOpenAddModal} className="bg-gradient-to-r from-red-500 to-pink-500">
          <Plus className="h-4 w-4 mr-2" /> Add Service
        </Button>
      </div>

      {/* Services List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : services.length === 0 ? (
        <Card className="p-12 text-center">
          <Ambulance className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
          <p className="mt-4 text-lg text-muted-foreground">
            No ambulance services added yet
          </p>
          <Button onClick={handleOpenAddModal} className="mt-4">
            <Plus className="h-4 w-4 mr-2" /> Add Your First Service
          </Button>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <Card
              key={service.id}
              className={`p-6 ${!service.isActive ? 'opacity-60 bg-muted/50' : ''}`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-lg ${service.isActive ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-400'}`}>
                    <Ambulance className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground">{service.companyName}</h3>
                    {service.isActive ? (
                      <span className="inline-flex items-center text-xs text-green-600">
                        <CheckCircle className="h-3 w-3 mr-1" /> Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center text-xs text-gray-500">
                        <XCircle className="h-3 w-3 mr-1" /> Inactive
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="font-semibold text-primary">{service.phone}</span>
                </div>
                {service.address && (
                  <div className="flex items-start gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 mt-0.5" />
                    <span>{service.address}</span>
                  </div>
                )}
                {service.description && (
                  <p className="text-sm text-muted-foreground">{service.description}</p>
                )}
              </div>

              <div className="flex gap-2 pt-4 border-t">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleToggleActive(service)}
                  className="flex-1"
                >
                  {service.isActive ? 'Deactivate' : 'Activate'}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleOpenEditModal(service)}
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-red-600 hover:text-red-700"
                  onClick={() => handleDelete(service.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-red-100">
                  <Ambulance className="h-5 w-5 text-red-600" />
                </div>
                <h3 className="font-semibold text-foreground">
                  {editingService ? 'Edit Ambulance Service' : 'Add Ambulance Service'}
                </h3>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setShowAddModal(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 text-sm text-red-600">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground">
                  Company Name <span className="text-red-500">*</span>
                </label>
                <Input
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  placeholder="e.g., Sylhet Ambulance Service"
                  className="mt-1"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="e.g., 01700-000000"
                  className="mt-1"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground">Address</label>
                <Input
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="e.g., Zindabazar, Sylhet"
                  className="mt-1"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground">Description</label>
                <Input
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="e.g., 24/7 Emergency Service"
                  className="mt-1"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="rounded"
                />
                <label htmlFor="isActive" className="text-sm text-foreground">
                  Active (visible to users)
                </label>
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" disabled={isSubmitting} className="flex-1">
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" /> {editingService ? 'Update' : 'Add'} Service
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
