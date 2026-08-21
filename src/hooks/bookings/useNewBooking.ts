// src/hooks/bookings/useNewBooking.ts
import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { bookingsApi } from '@/lib/api/bookings';
import { clientsApi } from '@/lib/api/clients';
import { vehiclesApi } from '@/lib/api/vehicles';
import { servicesApi } from '@/lib/api/services';
import type { Client, Vehicle, ServiceType, PricingResult, ServiceDefinition } from '@/lib/types';

export function useNewBooking() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [services, setServices] = useState<ServiceDefinition[]>([]);
  const [clientSearch, setClientSearch] = useState('');
  const [vehicleSearch, setVehicleSearch] = useState('');
  
  const [formData, setFormData] = useState({
    client_id: '',
    vehicle_id: '',
    service_type: 'selfdrive' as ServiceType,
    start_date: '',
    end_date: '',
    pickup_at: '',
    scheduled_return_at: '',
    pickup_location: '',
    return_location: '',
    destination: '',
  });

  // ✅ MILESTONE 1: Live quote state
  const [quote, setQuote] = useState<PricingResult | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(false);

  // Load initial data (clients + vehicles + service catalog)
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [c, v, s] = await Promise.all([
          clientsApi.list(),
          vehiclesApi.list({ status: 'available' }),
          servicesApi.list(),
        ]);
        setClients(c);
        setVehicles(v);
        setServices(s.services);
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

  // ✅ MILESTONE 1.1: Group services by category (for Chauffeur sub-tabs)
  const servicesByCategory = useMemo(() => {
    const grouped: Record<string, ServiceDefinition[]> = {};
    services.forEach(svc => {
      if (!grouped[svc.category]) {
        grouped[svc.category] = [];
      }
      grouped[svc.category].push(svc);
    });
    return grouped;
  }, [services]);

  // ✅ MILESTONE 1: Debounced quote API call
  useEffect(() => {
    if (
      !formData.vehicle_id ||
      !formData.pickup_at ||
      !formData.scheduled_return_at
    ) {
      setQuote(null);
      return;
    }

    const fetchQuote = async () => {
      setQuoteLoading(true);
      try {
        const result = await bookingsApi.quote({
          vehicle_id: parseInt(formData.vehicle_id),
          service_type: formData.service_type,
          pickup_at: formData.pickup_at,
          return_at: formData.scheduled_return_at,
          // ✅ MILESTONE 1.1: Future-proof fields (undefined for now)
          // distance_km: undefined,
          // route_key: undefined,
          // stops: undefined,
        });
        setQuote(result);
      } catch (err: any) {
        console.error("Quote failed:", err);
        setQuote(null);
      } finally {
        setQuoteLoading(false);
      }
    };

    const timeoutId = setTimeout(fetchQuote, 300);
    return () => clearTimeout(timeoutId);
  }, [
    formData.vehicle_id,
    formData.service_type,
    formData.pickup_at,
    formData.scheduled_return_at,
  ]);

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const calculateTotal = () => {
    // ✅ MILESTONE 1: Prefer quote total when available
    if (quote?.total) {
      return parseFloat(quote.total.toString());
    }

    // Fallback to client-side calculation
    if (!formData.start_date || !formData.end_date || !formData.vehicle_id) return 0;
    const vehicle = vehicles.find(v => v.id.toString() === formData.vehicle_id);
    if (!vehicle) return 0;
    
    const start = new Date(formData.start_date);
    const end = new Date(formData.end_date);
    
    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
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

    if (!formData.pickup_at || !formData.scheduled_return_at) {
      toast.error('Please select pickup and return times.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        client_id: Number(formData.client_id),
        vehicle_id: Number(formData.vehicle_id),
        service_type: formData.service_type,
        start_date: formData.start_date || formData.pickup_at.split('T')[0],
        end_date: formData.end_date || formData.scheduled_return_at.split('T')[0],
        pickup_at: formData.pickup_at,
        scheduled_return_at: formData.scheduled_return_at,
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
    services,  // ✅ MILESTONE 1.1: Full service catalog
    servicesByCategory,  // ✅ MILESTONE 1.1: Grouped by category (for sub-tabs)
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
    // ✅ MILESTONE 1: Expose quote state for BookingSummary
    quote,
    quoteLoading,
  };
}
