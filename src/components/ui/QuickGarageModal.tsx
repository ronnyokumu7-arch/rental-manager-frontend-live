// src/components/vehicle/QuickGarageModal.tsx
"use client";

import { useState, useEffect } from "react";
import { Wrench } from "lucide-react";
import type { Vehicle, VehicleUpdate } from "@/lib/types";
import Modal from "@/components/ui/Modal";
import FormGroup from "@/components/forms/FormGroup";
import Input from "@/components/forms/Input";
import Select from "@/components/forms/Select";

interface QuickGarageModalProps {
  vehicle: Vehicle | null;
  open: boolean;
  onClose: () => void;
  // ✅ FIXED: Changed VehicleUpdatePayload to VehicleUpdate
  onSave: (data: VehicleUpdate) => void;
}

export default function QuickGarageModal({
  vehicle,
  open,
  onClose,
  onSave,
}: QuickGarageModalProps) {
  const [formData, setFormData] = useState({
    status: "available",
    current_mileage: 0,
    next_service_km: 0,
  });

  useEffect(() => {
    if (vehicle && open) {
      setFormData({
        status: vehicle.status,
        current_mileage: vehicle.current_mileage,
        next_service_km: vehicle.next_service_km || 0,
      });
    }
  }, [vehicle, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehicle) return;
    
    onSave({
      status: formData.status as Vehicle["status"],
      current_mileage: formData.current_mileage,
      next_service_km: formData.next_service_km,
    });
  };

  if (!vehicle) return null;

  return (
    <Modal open={open} onClose={onClose}>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-warning-bg flex items-center justify-center">
            <Wrench size={20} className="text-warning-text" strokeWidth={1.8} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-ink">Quick Garage</h2>
            <p className="text-sm text-ink-muted">Update vehicle status and maintenance</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Vehicle Info Card */}
          <div className="p-3 rounded-lg bg-surface border border-surface-border">
            <p className="text-xs font-bold text-ink">
              {vehicle.make} {vehicle.model}
            </p>
            <p className="text-[10px] text-ink-muted">{vehicle.plate_number}</p>
          </div>

          {/* Status */}
          <FormGroup label="Status">
            <Select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              options={[
                { value: "available", label: "Available" },
                { value: "rented", label: "Rented" },
                { value: "maintenance", label: "Maintenance" },
                { value: "retired", label: "Retired" },
              ]}
            />
          </FormGroup>

          {/* Current Mileage */}
          <FormGroup label="Current Mileage (km)">
            <Input
              type="number"
              value={formData.current_mileage}
              onChange={(e) => setFormData({ ...formData, current_mileage: Number(e.target.value) })}
              min={0}
            />
          </FormGroup>

          {/* Next Service */}
          <FormGroup label="Next Service (km)">
            <Input
              type="number"
              value={formData.next_service_km}
              onChange={(e) => setFormData({ ...formData, next_service_km: Number(e.target.value) })}
              min={0}
              placeholder="e.g. 15000"
            />
          </FormGroup>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-4 border-t border-surface-border">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
