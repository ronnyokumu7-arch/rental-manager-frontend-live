// src/components/dashboard/SoftLockBanner.tsx
"use client";

import { useState, useEffect } from "react";
import { AlertTriangle, ExternalLink, X } from "lucide-react";
import Link from "next/link";

interface SoftLockBannerProps {
  outstandingBalance: string;
  daysUntilLock: number | null;
}

const SNOOZE_KEY = "commission_banner_snoozed_until";
const SNOOZE_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

export default function SoftLockBanner({ outstandingBalance, daysUntilLock }: SoftLockBannerProps) {
  const [isSnoozed, setIsSnoozed] = useState(false);

  const balance = parseFloat(outstandingBalance);
  const isLocked = daysUntilLock !== null && daysUntilLock <= 0;

  // ✅ Check localStorage on mount
  useEffect(() => {
    const snoozedUntil = localStorage.getItem(SNOOZE_KEY);
    if (snoozedUntil) {
      const snoozeTime = parseInt(snoozedUntil, 10);
      if (Date.now() < snoozeTime) {
        setIsSnoozed(true);
      } else {
        localStorage.removeItem(SNOOZE_KEY);
      }
    }
  }, []);

  const handleSnooze = () => {
    const snoozeUntil = Date.now() + SNOOZE_DURATION_MS;
    localStorage.setItem(SNOOZE_KEY, snoozeUntil.toString());
    setIsSnoozed(true);
  };

  // ✅ Don't render if balance is zero
  if (balance <= 0) return null;

  // ✅ Don't render if snoozed AND not locked (locked state is never snoozeable)
  if (isSnoozed && !isLocked) return null;

  const urgency = isLocked ? "urgent" : "warning";

  return (
    <div
      className={`mb-6 p-4 rounded-2xl border-2 relative ${
        urgency === "urgent"
          ? "bg-rose-50 border-rose-300 text-rose-900"
          : "bg-amber-50 border-amber-300 text-amber-900"
      }`}
    >
      {/* ✅ X close button (top-right, only for warning state) */}
      {!isLocked && (
        <button
          onClick={handleSnooze}
          className="absolute top-3 right-3 p-1 rounded-lg hover:bg-black/5 transition-colors"
          title="Dismiss for 24 hours"
        >
          <X className="w-4 h-4" />
        </button>
      )}

      <div className="flex items-start gap-3">
        <AlertTriangle
          className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
            urgency === "urgent" ? "text-rose-600" : "text-amber-600"
          }`}
        />
        <div className="flex-1">
          <h3 className="text-sm font-bold mb-1">
            {urgency === "urgent"
              ? "Payment Overdue — Operations Limited"
              : "Outstanding Commission Balance"}
          </h3>
          <p className="text-xs leading-relaxed mb-3">
            {urgency === "urgent"
              ? `You owe KES ${balance.toLocaleString()} in platform commission. Your account is currently in view-only mode. Pay now to unlock contracts, invoices, and vehicle management.`
              : `You have KES ${balance.toLocaleString()} in unpaid commission${
                  daysUntilLock !== null
                    ? ` (${daysUntilLock} day${daysUntilLock !== 1 ? "s" : ""} until operations are limited)`
                    : ""
                }. Pay at your convenience to avoid service interruption.`}
          </p>
          <div className="flex items-center gap-3">
            <Link
              href="/commission/pay"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white border border-current text-xs font-bold hover:shadow-md transition-all"
            >
              Pay Now <ExternalLink size={12} />
            </Link>
            {/* ✅ "Remind me later" link (only for warning state) */}
            {!isLocked && (
              <button
                onClick={handleSnooze}
                className="text-xs font-semibold underline hover:no-underline transition-all"
              >
                Remind me later
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}