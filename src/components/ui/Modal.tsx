// src/components/ui/Modal.tsx
"use client";

import { useEffect } from "react";
import { X } from "lucide-react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  size?: "sm" | "md" | "lg" | "xl";
  children: React.ReactNode;
}

export default function Modal({ open, onClose, title, subtitle, size = "md", children }: ModalProps) {
  // Handle Escape key and prevent background scrolling
  useEffect(() => {
    if (!open) return;
    
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    
    window.addEventListener("keydown", handleEsc);
    document.body.style.overflow = "hidden";
    
    return () => {
      window.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "unset";
    };
  }, [open, onClose]);

  if (!open) return null;

  const sizeClasses = { sm: "max-w-sm", md: "max-w-lg", lg: "max-w-2xl", xl: "max-w-4xl" };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop: Clicking this triggers onClose */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm" 
        onClick={onClose} 
      />

      {/* Modal Content */}
      <div className={`relative w-full ${sizeClasses[size]} bg-[var(--color-surface)] border border-[var(--color-surface-border)] rounded-2xl shadow-2xl flex flex-col max-h-[90vh]`}>
        
        {/* Header with guaranteed working X button */}
        <div className="flex items-center justify-between p-5 border-b border-[var(--color-surface-border)]">
          <div>
            {title && <h3 className="text-lg font-bold text-[var(--color-ink)]">{title}</h3>}
            {subtitle && <p className="text-sm text-[var(--color-ink-muted)]">{subtitle}</p>}
          </div>
          <button 
            onClick={onClose} 
            className="p-2 rounded-lg hover:bg-[var(--color-surface-hover)] text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto custom-scrollbar">
          {children}
        </div>
      </div>
    </div>
  );
}
