// src/hooks/bookings/useBookingFinancials.ts
"use client";

import { useState, useMemo } from "react";
import toast from "react-hot-toast";
import { bookingsApi } from "@/lib/api/bookings";
import { formatCurrency, DEFAULT_CURRENCY, type CurrencyCode } from "@/lib/utils/currency";
import type { Booking } from "@/lib/types";

export function useBookingFinancials(
  booking: Booking | null | undefined,
  onRefresh?: () => void,
  activeCurrency: CurrencyCode = DEFAULT_CURRENCY
) {
  const [isGeneratingInvoice, setIsGeneratingInvoice] = useState(false);
  const [isExtending, setIsExtending] = useState(false);

  const math = useMemo(() => {
    if (!booking) {
      return { 
        days: 0, 
        dailyRate: 0, 
        subtotal: 0, 
        totalAmount: 0,
        formattedDailyRate: formatCurrency(0, activeCurrency),
        formattedSubtotal: formatCurrency(0, activeCurrency),
        formattedTotalAmount: formatCurrency(0, activeCurrency),
      };
    }

    const start = new Date(booking.start_date);
    const end = new Date(booking.end_date);
    const ms = end.getTime() - start.getTime();
    const days = Math.max(1, Math.ceil(ms / (1000 * 60 * 60 * 24)));
    
    const dailyRate = Number(booking.daily_rate || booking.vehicle?.daily_rate || 0);
    const totalAmount = Number(booking.total_price || booking.total_amount || dailyRate * days);
    const subtotal = dailyRate * days;

    return {
      days,
      dailyRate,
      subtotal,
      totalAmount,
      formattedDailyRate: formatCurrency(dailyRate, activeCurrency),
      formattedSubtotal: formatCurrency(subtotal, activeCurrency),
      formattedTotalAmount: formatCurrency(totalAmount, activeCurrency),
    };
  }, [booking, activeCurrency]);

  const primaryInvoice = booking?.invoices?.[0] || null;

  const handleGenerateInvoice = async () => {
    if (!booking) return;
    setIsGeneratingInvoice(true);
    try {
      await bookingsApi.generateInvoice(booking.id);
      toast.success("Invoice generated successfully!");
      if (onRefresh) onRefresh();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to generate invoice");
    } finally {
      setIsGeneratingInvoice(false);
    }
  };

  const handleExtendBooking = async (additionalDays: number) => {
    if (!booking) return;
    setIsExtending(true);
    try {
      const currentEnd = new Date(booking.end_date);
      currentEnd.setDate(currentEnd.getDate() + additionalDays);
      const newEndDate = currentEnd.toISOString();

      await bookingsApi.extend(booking.id, newEndDate);
      toast.success(`Booking extended by ${additionalDays} day(s)!`);
      if (onRefresh) onRefresh();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to extend booking");
    } finally {
      setIsExtending(false);
    }
  };

  const copyInvoiceLink = () => {
    if (!primaryInvoice) return;
    const link = `${window.location.origin}/invoices/${primaryInvoice.id}`;
    navigator.clipboard.writeText(link);
    toast.success("Invoice share link copied to clipboard!");
  };

  return {
    currency: activeCurrency,
    math,
    primaryInvoice,
    isGeneratingInvoice,
    isExtending,
    handleGenerateInvoice,
    handleExtendBooking,
    copyInvoiceLink,
  };
}
