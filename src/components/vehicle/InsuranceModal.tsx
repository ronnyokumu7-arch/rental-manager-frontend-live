// src/components/vehicle/InsuranceModal.tsx
"use client";

import { useState, useEffect } from "react";
import { Shield, FileText, AlertTriangle } from "lucide-react";
import type { Vehicle, VehicleUpdate } from "@/lib/types";

import Modal from "@/components/ui/Modal";
import FormGroup from "@/components/forms/FormGroup";
import Input from "@/components/forms/Input";
import DatePicker from "@/components/forms/DatePicker";

interface InsuranceModalProps {
  vehicle: Vehicle | null;
  open: boolean;
  onClose: () => void;
  // ✅ FIXED: Changed VehicleUpdatePayload to VehicleUpdate
  onSave: (data: VehicleUpdate) => void;
}

export default function InsuranceModal({ vehicle, open, onClose, onSave }: InsuranceModalProps) {
  const [formData, setFormData] = useState({
    insurance_number: "",
    insurance_expiry: "",
  });

  useEffect(() => {
    if (vehicle && open) {
      setFormData({
        insurance_number: vehicle.insurance_number || "",
        // ✅ FIXED: Extract YYYY-MM-DD for the DatePicker component
        insurance_expiry: vehicle.insurance_expiry ? vehicle.insurance_expiry.split("T")[0] : "",
      });
    }
  }, [vehicle, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehicle) return;

    onSave({
      insurance_number: formData.insurance_number || null,
      // ✅ FIXED: Convert back to ISO string for the backend
      insurance_expiry: formData.insurance_expiry ? new Date(formData.insurance_expiry).toISOString() : null,
    });
  };

  if (!vehicle) return null;

  // Calculate days until expiry for UI warning
  const daysUntilExpiry = formData.insurance_expiry
    ? Math.ceil((new Date(formData.insurance_expiry).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <Modal 
      open={open} 
      onClose={onClose} 
      // ✅ FIXED: Removed hidden extra spaces in the title
      title="Insurance & Compliance" 
      subtitle="Manage policy details" 
      icon={Shield} 
      size="md" 
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Vehicle Info Card */}
        <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-900 dark:text-slate-100">
              {vehicle.make} {vehicle.model}
            </p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">{vehicle.plate_number}</p>
          </div>
          <Shield size={20} className="text-blue-600 dark:text-blue-400" />
        </div>

        {/* Policy Number */}
        <FormGroup label="Insurance Policy Number" required>
          <div className="relative">
            <FileText className="absolute left-3 top-3 h-4 w-4 text-slate-400 pointer-events-none" />
            <Input
              value={formData.insurance_number}
              onChange={(e) => setFormData({ ...formData, insurance_number: e.target.value })}
              placeholder="e.g., POL-12345678"
              className="pl-9"
              required
            />
          </div>
        </FormGroup>

        {/* Expiry Date */}
        <FormGroup label="Policy Expiry Date" required>
          <DatePicker
            value={formData.insurance_expiry}
            onChange={(val) => setFormData({ ...formData, insurance_expiry: val })}
            placeholder="Select expiry date"
            required
          />
          {daysUntilExpiry !== null && (
            <div className={`mt-2 flex items-center gap-1.5 text-xs ${daysUntilExpiry < 30 ? "text-red-600 font-semibold" : "text-slate-500"}`}>
              {daysUntilExpiry < 30 && <AlertTriangle size={12} />}
              <span>{daysUntilExpiry < 0 ? `Expired ${Math.abs(daysUntilExpiry)} days ago` : `Expires in ${daysUntilExpiry} days`}</span>
            </div>
          )}
        </FormGroup>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200 dark:border-slate-700">
          <button type="button" onClick={onClose} className="btn btn-ghost btn-sm">Cancel</button>
          <button type="submit" className="btn btn-primary btn-sm">Save Compliance Data</button>
        </div>
      </form>
    </Modal>
  );
}
