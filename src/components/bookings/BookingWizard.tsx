// src/components/bookings/BookingWizard.tsx
"use client";

import { useState } from "react";
import { CheckCircle, CalendarDays, MapPin, FileText } from "lucide-react";
import { useBookingForm } from "@/hooks/bookings/useBookingForm";
import IdentityStep from "./steps/IdentityStep";
import TripDetailsStep from "./steps/TripDetailsStep";
import ReviewStep from "./steps/ReviewStep";

interface BookingWizardProps {
  onComplete: () => void;
}

const steps = [
  { id: 1, label: "Identity", icon: CalendarDays },
  { id: 2, label: "Trip Details", icon: MapPin },
  { id: 3, label: "Review", icon: FileText },
];

export default function BookingWizard({ onComplete }: BookingWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const formLogic = useBookingForm();

  const nextStep = () => {
    if (currentStep < 3) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Call your API submission logic here from formLogic
    // await formLogic.submitBooking();
    onComplete();
  };

  return (
    <div className="bg-[var(--color-surface)] rounded-3xl shadow-[var(--shadow-xl)] border border-[var(--color-surface-border)] overflow-hidden">
      
      {/* Step Indicator */}
      <div className="px-8 py-6 border-b border-[var(--color-surface-border)] bg-[var(--color-surface-hover)]/50">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = currentStep === step.id;
            const isCompleted = currentStep > step.id;
            return (
              <div key={step.id} className="flex items-center flex-1 last:flex-none">
                <div className="flex flex-col items-center relative z-10">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                    isActive 
                      ? "bg-[var(--color-primary)] text-white shadow-[0_0_0_4px_var(--color-primary-muted)]" 
                      : isCompleted 
                        ? "bg-[var(--color-success)] text-white" 
                        : "bg-[var(--color-surface)] border-2 border-[var(--color-surface-border)] text-[var(--color-ink-subtle)]"
                  }`}>
                    {isCompleted ? <CheckCircle size={18} /> : <Icon size={18} />}
                  </div>
                  <span className={`mt-2 text-xs font-bold uppercase tracking-wider ${
                    isActive ? "text-[var(--color-primary)]" : isCompleted ? "text-[var(--color-success-text)]" : "text-[var(--color-ink-subtle)]"
                  }`}>
                    {step.label}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className={`h-0.5 flex-1 mx-4 rounded-full transition-all duration-500 ${
                    currentStep > step.id ? "bg-[var(--color-success)]" : "bg-[var(--color-surface-border)]"
                  }`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Form Content Area */}
      <form onSubmit={handleSubmit} className="p-8 sm:p-10">
        {currentStep === 1 && (
          <IdentityStep 
            formData={formLogic.formData} 
            updateField={formLogic.updateField} 
          />
        )}
        {currentStep === 2 && (
          <TripDetailsStep 
            formData={formLogic.formData} 
            updateField={formLogic.updateField} 
          />
        )}
        {currentStep === 3 && (
          <ReviewStep formData={formLogic.formData} />
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between mt-12 pt-6 border-t border-[var(--color-surface-border)]">
          <button
            type="button"
            onClick={prevStep}
            disabled={currentStep === 1}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-ink)] transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          
          {currentStep < 3 ? (
            <button
              type="button"
              onClick={nextStep}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] shadow-[var(--shadow-md)] hover:shadow-[var(--shadow-lg)] hover:-translate-y-0.5 transition-all"
            >
              Next Step
            </button>
          ) : (
            <button
              type="submit"
              disabled={formLogic.loading}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-[var(--color-success)] hover:bg-[var(--color-success)]/90 shadow-[var(--shadow-md)] hover:shadow-[var(--shadow-lg)] hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {formLogic.loading ? "Creating..." : "Create Booking"}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
