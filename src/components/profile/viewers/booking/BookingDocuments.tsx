"use client";
import DocumentCard from "./DocumentCard";

interface BookingDocumentsProps {
  contractStatus: string; invoiceStatus: string;
  onViewContract: () => void; onCopyContractLink: () => void; onDownloadContract: () => void;
  onViewInvoice: () => void; onCopyInvoiceLink: () => void; onDownloadInvoice: () => void;
}

export default function BookingDocuments({ contractStatus, invoiceStatus, onViewContract, onCopyContractLink, onDownloadContract, onViewInvoice, onCopyInvoiceLink, onDownloadInvoice }: BookingDocumentsProps) {
  return (
    <div>
      <h4 className="text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500 tracking-wider mb-4">Trip Documents</h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <DocumentCard title="Rental Contract" status={contractStatus} onView={onViewContract} onCopyLink={onCopyContractLink} onDownload={onDownloadContract} />
        <DocumentCard title="Invoice" status={invoiceStatus} onView={onViewInvoice} onCopyLink={onCopyInvoiceLink} onDownload={onDownloadInvoice} />
      </div>
    </div>
  );
}
