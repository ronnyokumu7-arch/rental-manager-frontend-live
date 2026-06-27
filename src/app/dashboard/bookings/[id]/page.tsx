"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";

import { bookingsApi } from "@/lib/api/bookings";
import { clientsApi } from "@/lib/api/clients";
import { vehiclesApi } from "@/lib/api/vehicles";
import { contractsApi } from "@/lib/api/contracts";
import type { Booking, Client, Vehicle, Contract, BookingUpdatePayload } from "@/lib/types";

import ConfirmDialog from "@/components/ui/ConfirmDialog";
import Modal from "@/components/ui/Modal";
import Select from "@/components/forms/Select";
import FormGroup from "@/components/forms/FormGroup";
import Input from "@/components/forms/Input";

import VehicleBookingTimeline from "@/components/booking/VehicleBookingTimeline";
import BookingManifestCards from "@/components/booking/BookingManifestCards";
import TripLogisticsSection from "@/components/booking/TripLogisticsSection";
import ContractLifecycleSection from "@/components/booking/ContractLifecycleSection";
import BookingActionBar from "@/components/booking/BookingActionBar";

export default function BookingProfilePage() {
  const params = useParams();
  const router = useRouter();
  const bookingId = Number(params.id);

  const [booking, setBooking] = useState<Booking | null>(null);
  const [client, setClient] = useState<Client | null>(null);
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [contract, setContract] = useState<Contract | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [isTripEnded, setIsTripEnded] = useState(false);
  
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedBooking, setEditedBooking] = useState<Partial<Booking>>({});

  const [isEditingTrip, setIsEditingTrip] = useState(false);
  const [tripDates, setTripDates] = useState({ start: "", end: "" });
  const [destination, setDestination] = useState("");

  const [showClientModal, setShowClientModal] = useState(false);
  const [showVehicleModal, setShowVehicleModal] = useState(false);
  const [showMileageModal, setShowMileageModal] = useState(false);
  const [mileageValue, setMileageValue] = useState(0);

  const [availableClients, setAvailableClients] = useState<Client[]>([]);
  const [availableVehicles, setAvailableVehicles] = useState<Vehicle[]>([]);

  const [confirmState, setConfirmState] = useState<{
    open: boolean; title: string; message: string; variant: "danger" | "warning" | "info" | "success"; onConfirm: () => void;
  }>({ open: false, title: "", message: "", variant: "danger", onConfirm: () => {} });

  // Centralized data fetching
  const fetchData = async () => {
    setLoading(true);
    try {
      const bookingData = await bookingsApi.get(bookingId);
      setBooking(bookingData);
      setEditedBooking(bookingData);
      setTripDates({ start: bookingData.start_date.split('T')[0], end: bookingData.end_date.split('T')[0] });
      setDestination(bookingData.destination || '');

      const [clientData, vehicleData] = await Promise.all([
        clientsApi.get(bookingData.client_id), 
        vehiclesApi.get(bookingData.vehicle_id),
      ]);
      setClient(clientData); 
      setVehicle(vehicleData);

      try {
        const contractsData = await contractsApi.list({ booking_id: bookingId });
        if (contractsData.length > 0) {
          setContract(contractsData[0]);
        } else {
          setContract(null);
        }
      } catch (e) { 
        console.warn("Contract fetch failed", e); 
        setContract(null);
      }
    } catch (error: any) { 
      toast.error(error.response?.data?.detail || "Failed to load booking"); 
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => {
    if (!bookingId) return;
    fetchData();
  }, [bookingId]);

  useEffect(() => {
    if (showClientModal) clientsApi.list().then(setAvailableClients);
    if (showVehicleModal) vehiclesApi.list().then((data) => setAvailableVehicles(data.filter(v => v.status === "available")));
  }, [showClientModal, showVehicleModal]);

  // --- HANDLERS ---

  const handleSaveTripChanges = async (dates: { start: string; end: string }, dest: string) => {
    try {
      await bookingsApi.update(bookingId!, { start_date: dates.start, end_date: dates.end, destination: dest } as BookingUpdatePayload);
      toast.success("Trip logistics updated!");
      await fetchData();
    } catch (error: any) { toast.error(error.response?.data?.detail || "Failed to update trip"); }
  };

  const handleConfirm = () => {
    setConfirmState({
      open: true, title: "Confirm Booking", message: "Confirm this booking?", variant: "success",
      onConfirm: async () => {
        setIsActionLoading(true);
        try { await bookingsApi.confirm(bookingId!); toast.success("Booking confirmed!"); await fetchData(); } 
        catch (error: any) { toast.error(error.response?.data?.detail || "Failed"); } finally { setIsActionLoading(false); }
      }
    });
  };

  const handleStartTrip = () => {
    setConfirmState({
      open: true, title: "Start Trip", message: "Start the trip?", variant: "info",
      onConfirm: async () => {
        setIsActionLoading(true);
        try { await bookingsApi.activate(bookingId!); toast.success("Trip started!"); await fetchData(); } 
        catch (error: any) { toast.error(error.response?.data?.detail || "Failed"); } finally { setIsActionLoading(false); }
      }
    });
  };

  const handleEndTripClick = () => {
    setIsTripEnded(true);
    toast.success("Trip ended. Please update mileage to complete.");
  };

  const handleUpdateMileageClick = () => {
    if (vehicle) setMileageValue(vehicle.current_mileage || 0);
    setShowMileageModal(true);
  };

  const handleSaveMileage = async () => {
    if (!vehicle || mileageValue <= 0) { toast.error("Enter valid mileage"); return; }
    setIsActionLoading(true);
    try {
      await vehiclesApi.update(vehicle.id, { current_mileage: mileageValue });
      await bookingsApi.complete(bookingId!);
      toast.success("Mileage updated & Booking Completed!");
      setShowMileageModal(false);
      await fetchData();
    } catch (error: any) { toast.error(error.response?.data?.detail || "Failed"); } 
    finally { setIsActionLoading(false); }
  };

  const handleCancel = () => {
    setConfirmState({
      open: true, title: "Cancel Booking", message: "Cancel this booking?", variant: "danger",
      onConfirm: async () => {
        setIsActionLoading(true);
        try { await bookingsApi.cancel(bookingId!); toast.success("Cancelled"); await fetchData(); } 
        catch (error: any) { toast.error(error.response?.data?.detail || "Failed"); } finally { setIsActionLoading(false); }
      }
    });
  };

  // --- CONTRACT HANDLERS ---
  
  const handleRegenerateContract = async () => {
    try {
      toast.loading("Generating contract...", { duration: 2000 });
      await contractsApi.regenerate(bookingId!);
      toast.success("Contract generated successfully!");
      await fetchData();
    } catch (error: any) { toast.error(error.response?.data?.detail || "Failed to generate contract"); }
  };

  const handleCopyShareLink = async () => {
    if (!contract) { toast.error("No contract found"); return; }
    try {
      let shareToken = contract.share_token;
      if (!shareToken) {
        toast.loading("Generating share link...", { duration: 1000 });
        await contractsApi.shareLink(contract.id);
        await fetchData();
        toast.success("Share link generated! Click copy again.");
        return;
      }
      const shareUrl = `${window.location.origin}/contracts/view/${shareToken}`;
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Contract link copied to clipboard!");
    } catch (error: any) { toast.error(error.response?.data?.detail || "Failed to generate share link"); }
  };

  const handleViewContract = async () => {
    if (!contract) { toast.error("No contract found"); return; }
    try {
      if (!contract.share_token) {
        toast.loading("Generating share link...", { duration: 1000 });
        await contractsApi.shareLink(contract.id);
        await fetchData();
      }
      window.open(`/contracts/view/${contract.share_token}`, '_blank');
    } catch (error: any) { toast.error(error.response?.data?.detail || "Failed to open contract"); }
  };

  const handleDownloadContract = async () => {
    if (!contract) { toast.error("No contract found"); return; }
    try {
      toast.loading("Downloading contract...", { duration: 2000 });
      const response = await contractsApi.downloadPdf(contract.id);
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Contract-${contract.contract_number}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
      toast.success("Contract downloaded!");
    } catch (error: any) { toast.error(error.response?.data?.detail || "Failed to download contract"); }
  };

  const handleEmailContract = async () => {
    if (!contract) { toast.error("No contract found"); return; }
    try {
      toast.loading("Sending contract to client...", { duration: 2000 });
      await contractsApi.sendToClient(contract.id);
      toast.success("Contract sent to client!");
      await fetchData();
    } catch (error: any) { toast.error(error.response?.data?.detail || "Failed to send contract"); }
  };

  const handleChangeClient = (id: number) => { setEditedBooking(prev => ({ ...prev, client_id: id })); setShowClientModal(false); toast.success("Client changed. Save to apply."); };
  const handleChangeVehicle = (id: number) => { setEditedBooking(prev => ({ ...prev, vehicle_id: id })); setShowVehicleModal(false); toast.success("Vehicle changed. Save to apply."); };

  if (loading) return <div className="flex justify-center min-h-[400px]">Loading...</div>;
  if (!booking || !client || !vehicle) return null;

  const duration = Math.max(1, Math.ceil((new Date(booking.end_date).getTime() - new Date(booking.start_date).getTime()) / (1000 * 60 * 60 * 24)));
  const isEditable = booking.status === "pending" || booking.status === "confirmed";

  return (
    <div className="min-h-screen bg-slate-50/50 pb-32">
      <div className="px-6 py-4">
        <button onClick={() => router.push("/dashboard/bookings")} className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors">
          <ArrowLeft size={16} /> Back to Bookings
        </button>
      </div>

      <div className="px-6 space-y-6 max-w-7xl mx-auto">
        <VehicleBookingTimeline vehicleId={vehicle.id} currentBookingId={booking.id} startDate={booking.start_date} endDate={booking.end_date} currentStatus={booking.status} isTripEnded={isTripEnded} />
        <BookingManifestCards booking={booking} client={client} vehicle={vehicle} duration={duration} isEditable={isEditable} onChangeClient={() => setShowClientModal(true)} onChangeVehicle={() => setShowVehicleModal(true)} />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TripLogisticsSection booking={booking} isEditable={isEditable} onSaveTripChanges={handleSaveTripChanges} />
          <ContractLifecycleSection contract={contract} onRegenerate={handleRegenerateContract} onCopyLink={handleCopyShareLink} onView={handleViewContract} onDownload={handleDownloadContract} onEmailClient={handleEmailContract} />
        </div>
      </div>

      <BookingActionBar status={booking.status} isEditable={isEditMode} isActionLoading={isActionLoading} isTripEnded={isTripEnded} onConfirm={handleConfirm} onStartTrip={handleStartTrip} onEndTrip={handleEndTripClick} onUpdateMileage={handleUpdateMileageClick} onCancel={handleCancel} />

      <Modal open={showMileageModal} onClose={() => setShowMileageModal(false)} title="Update Mileage" subtitle="Enter final odometer reading to complete booking" size="sm">
        <div className="space-y-4">
          <div className="p-3 bg-slate-50 rounded-lg">
            <p className="text-xs text-gray-500">Current Mileage</p>
            <p className="text-lg font-bold text-gray-900">{vehicle.current_mileage?.toLocaleString()} km</p>
          </div>
          <FormGroup label="New Mileage (km)">
            <Input type="number" value={mileageValue} onChange={(e) => setMileageValue(parseInt(e.target.value) || 0)} min={vehicle.current_mileage || 0} />
          </FormGroup>
          <div className="flex justify-end gap-2">
            <button onClick={() => setShowMileageModal(false)} className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg">Cancel</button>
            <button onClick={handleSaveMileage} disabled={isActionLoading} className="px-4 py-2 text-sm text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg disabled:opacity-50">{isActionLoading ? "Saving..." : "Save & Complete"}</button>
          </div>
        </div>
      </Modal>

      <Modal open={showClientModal} onClose={() => setShowClientModal(false)} title="Change Client" size="sm">
        <FormGroup label="Select Client">
          <Select value={editedBooking.client_id?.toString() || booking.client_id.toString()} onChange={(e) => handleChangeClient(parseInt(e.target.value))} options={availableClients.map(c => ({ value: c.id.toString(), label: `${c.full_name} (${c.phone})` }))} />
        </FormGroup>
      </Modal>

      <Modal open={showVehicleModal} onClose={() => setShowVehicleModal(false)} title="Change Vehicle" size="sm">
        <FormGroup label="Select Vehicle">
          <Select value={editedBooking.vehicle_id?.toString() || booking.vehicle_id.toString()} onChange={(e) => handleChangeVehicle(parseInt(e.target.value))} options={availableVehicles.map(v => ({ value: v.id.toString(), label: `${v.make} ${v.model} (${v.plate_number})` }))} />
        </FormGroup>
      </Modal>

      <ConfirmDialog open={confirmState.open} onClose={() => setConfirmState({ ...confirmState, open: false })} onConfirm={() => { confirmState.onConfirm(); setConfirmState({ ...confirmState, open: false }); }} title={confirmState.title} message={confirmState.message} variant={confirmState.variant} confirmLabel="Confirm" />
    </div>
  );
}
