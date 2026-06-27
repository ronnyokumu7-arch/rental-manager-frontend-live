"use client";

import { Mail, MessageCircle, Share2 } from "lucide-react";
import Modal from "@/components/ui/Modal";
import Select from "@/components/forms/Select";
import FormGroup from "@/components/forms/FormGroup";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import type { Client, Vehicle, Booking } from "@/lib/types";

interface BookingModalsProps {
  showClientModal: boolean;
  showVehicleModal: boolean;
  showShareModal: boolean;
  shareMethod: "email" | "whatsapp" | "";
  availableClients: Client[];
  availableVehicles: Vehicle[];
  editedBooking: Partial<Booking>;
  booking: Booking;
  client: Client;
  confirmState: { open: boolean; title: string; message: string; variant: "danger" | "warning" | "info" | "success"; onConfirm: () => void };
  onCloseClientModal: () => void;
  onCloseVehicleModal: () => void;
  onCloseShareModal: () => void;
  onCloseConfirm: () => void;
  onConfirmConfirm: () => void;
  onChangeClient: (id: number) => void;
  onChangeVehicle: (id: number) => void;
  onSetShareMethod: (method: "email" | "whatsapp" | "") => void;
  onSendInvoice: () => void;
}

export default function BookingModals({
  showClientModal, showVehicleModal, showShareModal, shareMethod,
  availableClients, availableVehicles, editedBooking, booking, client, confirmState,
  onCloseClientModal, onCloseVehicleModal, onCloseShareModal, onCloseConfirm, onConfirmConfirm,
  onChangeClient, onChangeVehicle, onSetShareMethod, onSendInvoice
}: BookingModalsProps) {
  return (
    <>
      <Modal open={showClientModal} onClose={onCloseClientModal} title="Change Client" subtitle="Select a different client" size="sm">
        <FormGroup label="Select Client">
          <Select value={editedBooking.client_id?.toString() || booking.client_id.toString()} onChange={(e) => onChangeClient(parseInt(e.target.value))} options={availableClients.map((c) => ({ value: c.id.toString(), label: `${c.full_name} (${c.phone})` }))} />
        </FormGroup>
      </Modal>

      <Modal open={showVehicleModal} onClose={onCloseVehicleModal} title="Change Vehicle" subtitle="Select a different vehicle" size="sm">
        <FormGroup label="Select Vehicle">
          <Select value={editedBooking.vehicle_id?.toString() || booking.vehicle_id.toString()} onChange={(e) => onChangeVehicle(parseInt(e.target.value))} options={availableVehicles.map((v) => ({ value: v.id.toString(), label: `${v.make} ${v.model} (${v.plate_number})` }))} />
        </FormGroup>
      </Modal>

      <Modal open={showShareModal} onClose={onCloseShareModal} title="Share Invoice" subtitle="Choose how to send the invoice" size="sm">
        <div className="space-y-3">
          <p className="text-sm text-gray-600">Send invoice to {client.full_name} via:</p>
          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => onSetShareMethod("email")} className={`p-3 rounded-lg border-2 flex flex-col items-center gap-2 transition-all ${shareMethod === "email" ? "border-blue-500 bg-blue-50" : "border-slate-200 hover:border-slate-300"}`}>
              <Mail size={24} className={shareMethod === "email" ? "text-blue-600" : "text-gray-400"} />
              <span className="text-xs font-medium">Email</span>
            </button>
            <button onClick={() => onSetShareMethod("whatsapp")} className={`p-3 rounded-lg border-2 flex flex-col items-center gap-2 transition-all ${shareMethod === "whatsapp" ? "border-green-500 bg-green-50" : "border-slate-200 hover:border-slate-300"}`}>
              <MessageCircle size={24} className={shareMethod === "whatsapp" ? "text-green-600" : "text-gray-400"} />
              <span className="text-xs font-medium">WhatsApp</span>
            </button>
          </div>
          {shareMethod && (
            <button onClick={onSendInvoice} className="w-full py-2 bg-indigo-600 text-white text-sm font-bold rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2">
              <Share2 size={14} /> Send via {shareMethod === "email" ? "Email" : "WhatsApp"}
            </button>
          )}
        </div>
      </Modal>

      <ConfirmDialog open={confirmState.open} onClose={onCloseConfirm} onConfirm={onConfirmConfirm} title={confirmState.title} message={confirmState.message} variant={confirmState.variant} confirmLabel="Confirm" />
    </>
  );
}
