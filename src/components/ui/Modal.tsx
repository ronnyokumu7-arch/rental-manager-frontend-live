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

  // Responsive width: full-width on mobile (bottom sheet), size-limited on desktop
  const desktopWidth = {
    sm: "sm:max-w-sm",
    md: "sm:max-w-lg",
    lg: "sm:max-w-2xl",
    xl: "sm:max-w-4xl",
  }[size];

  return (
    // Container: items-end on mobile (slide from bottom), items-center on desktop
    <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200" 
        onClick={onClose} 
      />

      {/* Modal Content: bottom sheet on mobile, centered card on desktop */}
      <div
        className={`
          relative w-full ${desktopWidth}
          bg-[var(--color-surface)] border border-[var(--color-surface-border)] border-b-0 sm:border-b
          rounded-t-2xl sm:rounded-2xl
          shadow-2xl
          flex flex-col
          max-h-[85vh] sm:max-h-[90vh]
          pb-[env(safe-area-inset-bottom,0px)]
          animate-in slide-in-from-bottom sm:slide-in-from-bottom-0 duration-300 ease-out
        `}
      >
        {/* iOS drag handle indicator — mobile only */}
        <div className="sm:hidden flex justify-center pt-3 -mb-1">
          <div className="w-10 h-1 rounded-full bg-[var(--color-surface-border-strong)]" />
        </div>

        {/* Header with guaranteed working X button */}
        <div className="flex items-center justify-between p-5 border-b border-[var(--color-surface-border)]">
          <div className="min-w-0">
            {title && <h3 className="text-lg font-bold text-[var(--color-ink)] truncate">{title}</h3>}
            {subtitle && <p className="text-sm text-[var(--color-ink-muted)] truncate">{subtitle}</p>}
          </div>
          <button 
            onClick={onClose} 
            className="p-2 rounded-lg hover:bg-[var(--color-surface-hover)] text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] transition-colors shrink-0 ml-2"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-6 overflow-y-auto custom-scrollbar">
          {children}
        </div>
      </div>
    </div>
  );
}
