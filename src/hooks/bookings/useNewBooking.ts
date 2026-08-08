// src/hooks/bookings/useNewBooking.ts
import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { bookingsApi } from '@/lib/api/bookings';
import { clientsApi } from '@/lib/api/clients';
import { vehiclesApi } from '@/lib/api/vehicles';
import type { Client, Vehicle } from '@/lib/types';

export function useNewBooking() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [clientSearch, setClientSearch] = useState('');
  const [vehicleSearch, setVehicleSearch] = useState('');
  
  const [formData, setFormData] = useState({
    client_id: '',
    vehicle_id: '',
    start_date: '',
    end_date: '',
    pickup_location: '',
    return_location: '',
    destination: '',
  });

  // Load initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [c, v] = await Promise.all([
          clientsApi.list(),
          vehiclesApi.list({ status: 'available' })
        ]);
        setClients(c);
        setVehicles(v);
      } catch {
        toast.error('Failed to load initial data');
      }
    };
    fetchData();
  }, []);

  // Filter clients based on search
  const filteredClients = useMemo(() => {
    if (!clientSearch.trim()) return clients.slice(0, 10); // Show first 10
    
    const search = clientSearch.toLowerCase();
    return clients.filter(client => 
      client.full_name.toLowerCase().includes(search) ||
      client.id_number?.toLowerCase().includes(search) ||
      client.dl_number?.toLowerCase().includes(search) ||
      client.phone.toLowerCase().includes(search)
    ).slice(0, 10); // Limit to 10 results
  }, [clients, clientSearch]);

  // Filter vehicles based on search
  const filteredVehicles = useMemo(() => {
    if (!vehicleSearch.trim()) return vehicles.slice(0, 10);
    
    const search = vehicleSearch.toLowerCase();
    return vehicles.filter(vehicle => 
      vehicle.make.toLowerCase().includes(search) ||
      vehicle.model.toLowerCase().includes(search) ||
      vehicle.plate_number.toLowerCase().includes(search)
    ).slice(0, 10);
  }, [vehicles, vehicleSearch]);

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const calculateTotal = () => {
    if (!formData.start_date || !formData.end_date || !formData.vehicle_id) return 0;
    const vehicle = vehicles.find(v => v.id.toString() === formData.vehicle_id);
    if (!vehicle) return 0;
    
    const start = new Date(formData.start_date);
    const end = new Date(formData.end_date);
    
    // ✅ FIX: Removed the "+ 1" which was incorrectly adding an extra day.
    // July 27 to July 28 is exactly 1 day (24 hours).
    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    // Ensure at least 1 day minimum
    const days = Math.max(1, diffDays);
    
    return days * Number(vehicle.daily_rate);
  };

  const getSelectedClient = () => clients.find(c => c.id.toString() === formData.client_id);
  const getSelectedVehicle = () => vehicles.find(v => v.id.toString() === formData.vehicle_id);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.client_id || !formData.vehicle_id) {
      toast.error('Please select a client and a vehicle.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        client_id: Number(formData.client_id),
        vehicle_id: Number(formData.vehicle_id),
        start_date: new Date(formData.start_date).toISOString(),
        end_date: new Date(formData.end_date).toISOString(),
        pickup_location: formData.pickup_location || undefined,
        return_location: formData.return_location || undefined,
        destination: formData.destination || undefined,
        total_amount: calculateTotal(),
        currency_code: 'KES',
        status: 'pending'
      };

      await bookingsApi.create(payload);
      toast.success('Booking created successfully!');
      router.push('/dashboard/bookings');
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to create booking');
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    clients: filteredClients,
    vehicles: filteredVehicles,
    allClients: clients,
    allVehicles: vehicles,
    formData,
    clientSearch,
    vehicleSearch,
    setClientSearch,
    setVehicleSearch,
    updateField,
    calculateTotal,
    getSelectedClient,
    getSelectedVehicle,
    handleSubmit,
  };
}
