// src/components/bookings/BookingForm.tsx
"use client";

import { CalendarDays, MapPin, User, Loader2, CheckCircle } from 'lucide-react';
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/flatpickr.min.css";
import { useNewBooking } from '@/hooks/bookings/useNewBooking';
import ClientSearch from './ClientSearch';
import VehicleSearch from './VehicleSearch';
import BookingSummary from './BookingSummary';
import AddressAutocomplete from '@/components/ui/AddressAutocomplete';


const inputClass = "w-full pl-10 pr-3 py-2.5 rounded-lg border border-[var(--color-surface-border)] bg-[var(--color-surface)] text-[var(--color-ink)] placeholder-[var(--color-ink-subtle)] focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)] outline-none transition-all text-sm";
const labelClass = "block text-[10px] font-semibold uppercase tracking-wider text-[var(--color-ink-muted)] mb-1.5";
const sectionClass = "bg-[var(--color-surface)] rounded-xl border border-[var(--color-surface-border)] p-4";

// ✅ BULLETPROOF LOCAL DATE FORMATTER
// Extracts YYYY-MM-DD directly from the user's local browser timezone, 
// completely avoiding the UTC shift bug caused by .toISOString()
const formatDateToLocalYYYYMMDD = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Premium Flatpickr Wrapper
const PremiumDatePicker = ({ 
  value, 
  onChange, 
  label, 
  required = false,
  minDate,
  maxDate
}: { 
  value: string; 
  onChange: (dates: Date[]) => void; 
  label: string;
  required?: boolean;
  minDate?: string;
  maxDate?: string;
}) => {

  return (
    <div>
      <label className={labelClass}>
        {label} {required && <span className="text-[var(--color-danger)]">*</span>}
      </label>
      <div className="relative">
        <CalendarDays size={16} className="absolute left-3 top-3 text-[var(--color-ink-subtle)] pointer-events-none z-10" />
        <Flatpickr
          value={value}
          onChange={onChange}
          options={{
            dateFormat: "Y-m-d",
            minDate: minDate || "today",
            maxDate: maxDate,
            disableMobile: true, // Forces the beautiful custom dropdown UI
          }}
          className={inputClass}
          placeholder="Select date..."
        />
      </div>
    </div>
  );
};

export default function BookingForm() {
  const {
    loading,
    clients,
    vehicles,
    formData,
    clientSearch,
    vehicleSearch,
    setClientSearch,
    setVehicleSearch,
    updateField,
    calculateTotal,
    getSelectedClient,
    getSelectedVehicle,
    handleSubmit
  } = useNewBooking();

  const selectedClient = getSelectedClient();
  const selectedVehicle = getSelectedVehicle();
  const totalAmount = calculateTotal();

  return (
    <form onSubmit={handleSubmit} className="max-w-6xl mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-4 items-start">
      
      {/* LEFT COLUMN: Booking Details */}
      <div className="space-y-3">
        
        {/* Section 1: Client & Vehicle */}
        <section className={sectionClass}>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-md bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center">
              <User size={14} />
            </div>
            <h3 className="text-sm font-bold text-[var(--color-ink)]">Client & Vehicle</h3>
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
          </div>
        </section>

        {/* Section 2: Dates */}
        <section className={sectionClass}>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-md bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <CalendarDays size={14} />
            </div>
            <h3 className="text-sm font-bold text-[var(--color-ink)]">Rental Period</h3>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <PremiumDatePicker
              label="Start Date"
              value={formData.start_date}
              onChange={(dates) => {
                if (dates[0]) {
                  // ✅ FIX: Use local timezone formatting instead of .toISOString()
                  const localDateStr = formatDateToLocalYYYYMMDD(dates[0]);
                  updateField('start_date', localDateStr);
                  
                  // Auto-clear end date if it's now before the new start date
                  if (formData.end_date && dates[0] > new Date(formData.end_date)) {
                    updateField('end_date', '');
                  }
                }
              }}
              maxDate={formData.end_date}
              required
            />
            <PremiumDatePicker
              label="End Date"
              value={formData.end_date}
              onChange={(dates) => {
                if (dates[0]) {
                  // ✅ FIX: Use local timezone formatting instead of .toISOString()
                  const localDateStr = formatDateToLocalYYYYMMDD(dates[0]);
                  updateField('end_date', localDateStr);
                }
              }}
              minDate={formData.start_date || "today"}
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

      {/* RIGHT COLUMN: Summary + CTA */}
      <aside className="lg:sticky lg:top-4 space-y-3">
        
        <BookingSummary
          client={selectedClient}
          vehicle={selectedVehicle}
          startDate={formData.start_date}
          endDate={formData.end_date}
          totalAmount={totalAmount}
        />

        {/* CTA Card */}
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
