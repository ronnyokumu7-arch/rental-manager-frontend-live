"use client";

import { CalendarDays, MapPin, User, Loader2, CheckCircle } from 'lucide-react';
import { useNewBooking } from '@/hooks/bookings/useNewBooking';
import ClientSearch from '../ClientSearch';
import VehicleSearch from '../VehicleSearch';
import DriverSearch from '../DriverSearch';
import BookingSummary from '../BookingSummary';
import AddressAutocomplete from '@/components/ui/AddressAutocomplete';
import PremiumDateAndTimePicker from './PremiumDateAndTimePicker';
import ServiceTypeSelector from './ServiceTypeSelector';
import { sectionClass } from './constants';
import type { ServiceType } from '@/lib/types';

export default function BookingForm() {
  const {
    loading,
    clients,
    vehicles,
    drivers,
    services,
    formData,
    clientSearch,
    vehicleSearch,
    driverSearch,
    setClientSearch,
    setVehicleSearch,
    setDriverSearch,
    updateField,
    calculateTotal,
    getSelectedClient,
    getSelectedVehicle,
    handleSubmit,
    // ✅ MILESTONE 1: quote state from hook
    quote,
    quoteLoading,
  } = useNewBooking();

  const selectedClient = getSelectedClient();
  const selectedVehicle = getSelectedVehicle();
  const totalAmount = calculateTotal();

  return (
    <form onSubmit={handleSubmit} className="max-w-6xl mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-4 items-start">
      
      {/* LEFT COLUMN: Booking Details */}
      <div className="space-y-3">
        
        {/* Section 1: Client & Vehicle & Driver */}
        <section className={sectionClass}>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-md bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center">
              <User size={14} />
            </div>
            <h3 className="text-sm font-bold text-[var(--color-ink)]">Client & Vehicle & Driver</h3>
          </div>

          <div className="space-y-3">
            <ClientSearch
              selectedClientId={formData.client_id}
              clients={clients}
              searchQuery={clientSearch}
              onSearchChange={setClientSearch}
              onSelect={(client) => {
                updateField('client_id', client.id.toString());
                setClientSearch('');
              }}
            />

            <VehicleSearch
              selectedVehicleId={formData.vehicle_id}
              vehicles={vehicles}
              searchQuery={vehicleSearch}
              onSearchChange={setVehicleSearch}
              onSelect={(vehicle) => {
                updateField('vehicle_id', vehicle.id.toString());
                setVehicleSearch('');
              }}
            />

            {/* ✅ MILESTONE 2: Driver assignment */}
            <DriverSearch
              selectedDriverId={formData.driver_id}
              drivers={drivers}
              searchQuery={driverSearch}
              onSearchChange={setDriverSearch}
              onSelect={(driver) => {
                updateField('driver_id', driver.id.toString());
                setDriverSearch('');
              }}
            />
          </div>
        </section>

        {/* Section 2: Service + Dates + Times */}
        <section className={sectionClass}>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-md bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <CalendarDays size={14} />
            </div>
            <h3 className="text-sm font-bold text-[var(--color-ink)]">Rental Period</h3>
          </div>

          {/* ✅ MILESTONE 1.1: Service selector consumes catalog */}
          <div className="mb-3">
            <ServiceTypeSelector
              value={(formData.service_type as ServiceType) || "selfdrive"}
              onChange={(type) => updateField('service_type', type)}
              services={services}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <PremiumDateAndTimePicker
              label="Pickup Date & Time"
              value={formData.pickup_at || formData.start_date}
              onChange={(datetime) => {
                updateField('pickup_at', datetime);
                updateField('start_date', datetime.split('T')[0]);

                // Auto-clear return if it's now before/equal pickup
                if (formData.scheduled_return_at && new Date(datetime) >= new Date(formData.scheduled_return_at)) {
                  updateField('scheduled_return_at', '');
                  updateField('end_date', '');
                }
              }}
              required
            />
            <PremiumDateAndTimePicker
              label="Return Date & Time"
              value={formData.scheduled_return_at || formData.end_date}
              onChange={(datetime) => {
                updateField('scheduled_return_at', datetime);
                updateField('end_date', datetime.split('T')[0]);
              }}
              minDate={formData.pickup_at || formData.start_date || "today"}
              required
            />
          </div>
        </section>

        {/* Section 3: Locations */}
        <section className={sectionClass}>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-md bg-purple-500/10 text-purple-500 flex items-center justify-center">
              <MapPin size={14} />
            </div>
            <h3 className="text-sm font-bold text-[var(--color-ink)]">Pickup & Return</h3>
          </div>

          <div className="space-y-3">
            <AddressAutocomplete
              value={formData.pickup_location}
              onChange={(value) => updateField('pickup_location', value)}
              label="Pickup Location"
              placeholder="Search pickup location..."
            />

            <AddressAutocomplete
              value={formData.return_location}
              onChange={(value) => updateField('return_location', value)}
              label="Return Location"
              placeholder="Search return location..."
            />

            <AddressAutocomplete
              value={formData.destination}
              onChange={(value) => updateField('destination', value)}
              label="Destination"
              placeholder="Search destination..."
            />
          </div>
        </section>

      </div>

      {/* RIGHT COLUMN: Summary + CTA — renders on mobile too, exactly as v1 shipped */}
      <aside className="lg:sticky lg:top-4 space-y-3">
        
        <BookingSummary
          client={selectedClient}
          vehicle={selectedVehicle}
          startDate={formData.pickup_at || formData.start_date}
          endDate={formData.scheduled_return_at || formData.end_date}
          totalAmount={totalAmount}
          serviceType={(formData.service_type as ServiceType) || "selfdrive"}
          quote={quote}
          quoteLoading={quoteLoading}
        />

        {/* CTA Card — visible on ALL breakpoints, in normal page flow */}
        <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-surface-border)] p-4">
          <button 
            type="submit" 
            disabled={loading} 
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] shadow-lg shadow-[var(--color-primary)]/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <CheckCircle size={16} />
                Create Booking
              </>
            )}
          </button>
          <p className="text-[10px] text-center text-[var(--color-ink-muted)] mt-2">
            Booking will be created in pending state
          </p>
        </div>

      </aside>
    </form>
  );
}
