// src/components/dashboard/SoftLockBanner.tsx
"use client";

import { AlertTriangle, ExternalLink } from "lucide-react";
import Link from "next/link";

interface SoftLockBannerProps {
  outstandingBalance: string;
  daysUntilLock: number | null;
}

export default function SoftLockBanner({ outstandingBalance, daysUntilLock }: SoftLockBannerProps) {
  const balance = parseFloat(outstandingBalance);
  if (balance <= 0) return null;

  const urgency = daysUntilLock !== null && daysUntilLock <= 1 ? "urgent" : "warning";
  
  return (
    <div className={`mb-6 p-4 rounded-2xl border-2 ${
      urgency === "urgent"
        ? "bg-rose-50 border-rose-300 text-rose-900"
        : "bg-amber-50 border-amber-300 text-amber-900"
    }`}>
      <div className="flex items-start gap-3">
        <AlertTriangle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
          urgency === "urgent" ? "text-rose-600" : "text-amber-600"
        }`} />
        <div className="flex-1">
          <h3 className="text-sm font-bold mb-1">
            {urgency === "urgent"
              ? "Payment Overdue — Operations Limited"
              : "Outstanding Commission Balance"
            }
          </h3>
          <p className="text-xs leading-relaxed mb-3">
            {urgency === "urgent"
              ? `You owe KES ${balance.toLocaleString()} in platform commission. Your account is currently in view-only mode. Pay now to unlock contracts, invoices, and vehicle management.`
              : `You have KES ${balance.toLocaleString()} in unpaid commission${daysUntilLock !== null ? ` (${daysUntilLock} day${daysUntilLock !== 1 ? "s" : ""} until operations are limited)` : ""}. Pay at your convenience to avoid service interruption.`
            }
          </p>
          <Link
            href="/commission/pay"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white border border-current text-xs font-bold hover:shadow-md transition-all"
          >
            Pay Now <ExternalLink size={12} />
          </Link>
        </div>
      </div>
    </div>
  );
}
