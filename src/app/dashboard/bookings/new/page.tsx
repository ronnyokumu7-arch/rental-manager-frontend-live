// src/app/dashboard/bookings/new/page.tsx
"use client";

import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import BookingForm from '@/components/bookings/BookingForm';

export default function NewBookingPage() {
  const router = useRouter();

  return (
    <div className="h-[calc(100vh-4rem)] bg-[var(--color-bg)] overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[var(--color-bg)]/95 backdrop-blur-sm border-b border-[var(--color-surface-border)] px-4 sm:px-6 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <button 
            onClick={() => router.push('/dashboard/bookings')} 
            className="inline-flex items-center gap-2 text-sm font-medium text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] transition-colors"
          >
            <ArrowLeft size={16} /> Back
          </button>
          <h1 className="text-base font-bold text-[var(--color-ink)]">New Booking</h1>
          <div className="w-24" />
        </div>
      </div>

      {/* Form */}
      <BookingForm />
    </div>
  );
}
