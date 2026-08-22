"use client";

import { useEffect, useRef, useState } from "react";
import { CalendarDays, MapPin, User, Loader2, CheckCircle, Car, UserCircle, Heart, Info, Clock, ChevronDown, Plane, Building2, Map } from 'lucide-react';
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/flatpickr.min.css";
import { useNewBooking } from '@/hooks/bookings/useNewBooking';
import ClientSearch from './ClientSearch';
import VehicleSearch from './VehicleSearch';
import BookingSummary from './BookingSummary';
import AddressAutocomplete from '@/components/ui/AddressAutocomplete';
import type { ServiceType, ServiceDefinition } from '@/lib/types';


const inputClass = "w-full pl-10 pr-3 py-2.5 rounded-lg border border-[var(--color-surface-border)] bg-[var(--color-surface)] text-[var(--color-ink)] placeholder-[var(--color-ink-subtle)] focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)] outline-none transition-all text-sm";
const labelClass = "block text-[10px] font-semibold uppercase tracking-wider text-[var(--color-ink-muted)] mb-1.5";
const sectionClass = "bg-[var(--color-surface)] rounded-xl border border-[var(--color-surface-border)] p-4";

// ✅ BULLETPROOF LOCAL DATE FORMATTER (YYYY-MM-DD)
const formatDateToLocalYYYYMMDD = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// ✅ MILESTONE 1: 24h slot-based Time Picker (no deps, no AM/PM ambiguity)
const TIME_SLOTS = Array.from({ length: 48 }, (_, i) => {
  const h = Math.floor(i / 2);
  const m = i % 2 === 0 ? "00" : "30";
  return `${String(h).padStart(2, "0")}:${m}`;
});

const TimePicker = ({ value, onChange }: { value: string; onChange: (t: string) => void }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  return (
    <div ref={ref} className="relative w-[104px] shrink-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Select time"
        className="w-full flex items-center justify-center gap-1.5 px-2 py-2.5 rounded-lg border border-[var(--color-surface-border)] bg-[var(--color-surface)] text-[var(--color-ink)] focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)] outline-none transition-all text-sm font-semibold tabular-nums active:scale-[0.98]"
      >
        <Clock size={14} className="text-[var(--color-ink-subtle)]" />
        {value || "09:00"}
      </button>

      {/* ✅ right-0 → opens leftward, never overflows the viewport on phones */}
      {open && (
        <div className="absolute z-50 mt-1 right-0 w-48 max-h-56 overflow-y-auto overscroll-contain rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface)] shadow-xl p-1 grid grid-cols-3 gap-1">
          {TIME_SLOTS.map((slot) => (
            <button
              key={slot}
              type="button"
              onClick={() => { onChange(slot); setOpen(false); }}
              className={`px-2 py-2 rounded-md text-xs font-semibold tabular-nums transition-colors ${
                slot === (value || "09:00")
                  ? "bg-[var(--color-primary)] text-white"
                  : "text-[var(--color-ink)] hover:bg-[var(--color-surface-hover)] active:bg-[var(--color-surface-hover)]"
              }`}
            >
              {slot}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// ✅ MILESTONE 1: Date + TIME picker (time always visible = transparent pricing)
const PremiumDateAndTimePicker = ({
  value,
  onChange,
  label,
  required = false,
  minDate,
}: {
  value: string; // "YYYY-MM-DDTHH:mm:ss" or ""
  onChange: (datetime: string) => void;
  label: string;
  required?: boolean;
  minDate?: string;
}) => {
  const [datePart, timeRaw] = value ? value.split("T") : ["", ""];
  const timePart = timeRaw ? timeRaw.slice(0, 5) : "";

  const emit = (d: string, t: string) => onChange(`${d}T${t}:00`);

  return (
    <div>
      <label className={labelClass}>
        {label} {required && <span className="text-[var(--color-danger)]">*</span>}
      </label>
      <div className="flex gap-2">
        {/* Date */}
        <div className="relative flex-1 min-w-0">
          <CalendarDays size={16} className="absolute left-3 top-3 text-[var(--color-ink-subtle)] pointer-events-none z-10" />
          <Flatpickr
            value={datePart}
            onChange={(dates) => {
              if (dates[0]) emit(formatDateToLocalYYYYMMDD(dates[0]), timePart || "09:00");
            }}
            options={{
              dateFormat: "Y-m-d",
              minDate: minDate || "today",
              disableMobile: true,
            }}
            className={inputClass}
            placeholder="Select date..."
          />
        </div>
        {/* Time — 24h slot picker, always visible */}
        <TimePicker
          value={timePart || "09:00"}
          onChange={(t) => emit(datePart || formatDateToLocalYYYYMMDD(new Date()), t)}
        />
      </div>
    </div>
  );
};

// ✅ MILESTONE 1.1: Premium catalog-driven Service Selector
// Segmented control (Self Drive | Chauffeur) + INLINE expanding sub-service panel.
// Inline = mobile-safe: full width, no absolute dropdowns, zero truncation at 360px.
const ServiceTypeSelector = ({
  value,
  onChange,
  services,
}: {
  value: ServiceType;
  onChange: (type: ServiceType) => void;
  services: ServiceDefinition[];
}) => {
  const [chauffeurOpen, setChauffeurOpen] = useState(false);

  const selectedService = services.find((s) => s.key === value);
  const chauffeurServices = services.filter((s) => s.category === "chauffeur");
  const isChauffeur = !!selectedService?.category && selectedService.category === "chauffeur";

  const getIcon = (key: ServiceType) => {
    if (key === "selfdrive") return Car;
    if (key === "chauffeur_wedding") return Heart;
    if (key === "corporate") return Building2;
    if (key === "airport_transfer") return Plane;
    if (key === "city_excursion") return Map;
    return UserCircle; // pro_driver, hourly, taxi
  };

  const chauffeurShortLabel = () => {
    if (!isChauffeur || !selectedService) return "Chauffeur";
    return selectedService.display_name.replace("Chauffeur · ", "");
  };

  return (
    <div>
      <label className={labelClass}>
        Service Type <span className="text-[var(--color-danger)]">*</span>
      </label>

      {/* ✅ Premium segmented control */}
      <div className="grid grid-cols-2 gap-1 rounded-xl bg-[var(--color-surface-hover)] border border-[var(--color-surface-border)] p-1">
        <button
          type="button"
          onClick={() => { onChange("selfdrive"); setChauffeurOpen(false); }}
          className={`flex items-center justify-center gap-1.5 px-1 py-2.5 rounded-lg text-[11px] sm:text-xs font-bold whitespace-nowrap transition-all active:scale-[0.98] ${
            !isChauffeur
              ? "bg-[var(--color-surface)] text-[var(--color-primary)] shadow-sm ring-1 ring-[var(--color-primary)]/25"
              : "text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"
          }`}
        >
          <Car size={14} />
          Self Drive
        </button>

        <button
          type="button"
          onClick={() => setChauffeurOpen((o) => !o)}
          aria-expanded={chauffeurOpen}
          className={`flex items-center justify-center gap-1.5 px-1 py-2.5 rounded-lg text-[11px] sm:text-xs font-bold whitespace-nowrap transition-all active:scale-[0.98] ${
            isChauffeur
              ? "bg-[var(--color-surface)] text-[var(--color-primary)] shadow-sm ring-1 ring-[var(--color-primary)]/25"
              : "text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"
          }`}
        >
          <UserCircle size={14} />
          {chauffeurShortLabel()}
          <ChevronDown
            size={12}
            className={`transition-transform ${chauffeurOpen ? "rotate-180" : ""}`}
          />
        </button>
      </div>

      {/* ✅ Inline expanding panel — full width, thumb-friendly, never truncates */}
      {chauffeurOpen && (
        <div className="mt-2 rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface)] p-1 space-y-1">
          {chauffeurServices.map((svc) => {
            const Icon = getIcon(svc.key);
            const active = value === svc.key;
            return (
              <button
                key={svc.key}
                type="button"
                disabled={!svc.is_live}
                onClick={() => { onChange(svc.key); setChauffeurOpen(false); }}
                className={`w-full flex items-start gap-2.5 px-3 py-2.5 rounded-lg text-left transition-colors ${
                  active
                    ? "bg-[var(--color-primary)]/10"
                    : svc.is_live
                    ? "hover:bg-[var(--color-surface-hover)] active:bg-[var(--color-surface-hover)]"
                    : "opacity-60 cursor-not-allowed"
                }`}
              >
                <Icon
                  size={16}
                  className={`shrink-0 mt-0.5 ${active ? "text-[var(--color-primary)]" : "text-[var(--color-ink-muted)]"}`}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-xs font-bold ${active ? "text-[var(--color-primary)]" : "text-[var(--color-ink)]"}`}>
                      {svc.display_name}
                    </span>
                    {!svc.is_live && (
                      <span className="text-[8px] font-bold uppercase tracking-wide bg-[var(--color-surface-hover)] text-[var(--color-ink-muted)] px-1.5 py-0.5 rounded whitespace-nowrap">
                        Coming soon
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-[var(--color-ink-muted)] mt-0.5">
                    {svc.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Dynamic caption — one line, updates with selection */}
      {selectedService && (
        <p className="mt-2 flex items-start gap-1.5 text-[10px] text-[var(--color-ink-muted)]">
          <Info size={11} className="text-[var(--color-primary)] shrink-0 mt-[1px]" />
          {selectedService.description}
        </p>
      )}
    </div>
  );
};

export default function BookingForm() {
  const {
    loading,
    clients,
    vehicles,
    services,
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
