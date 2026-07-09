"use client";

import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { X, LucideIcon } from "lucide-react";

// ✅ EXPANDED: Now supports all standard Tailwind max-widths up to 7xl and true full-screen
type ModalSize = "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl" | "7xl" | "full";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  icon?: LucideIcon;
  size?: ModalSize;
  children: React.ReactNode;
  footer?: React.ReactNode;
  closeOnBackdrop?: boolean;
  closeOnEsc?: boolean;
  showCloseButton?: boolean;
  className?: string;
}

// ✅ ADAPTIVE: Maps sizes to actual Tailwind max-widths
const sizeStyles: Record<ModalSize, string> = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  "2xl": "max-w-2xl",
  "3xl": "max-w-3xl",
  "4xl": "max-w-4xl",
  "5xl": "max-w-5xl",
  "6xl": "max-w-6xl",
  "7xl": "max-w-7xl",
  // True landscape/full-screen feel
  full: "max-w-[95vw] min-h-[85vh]", 
};

export default function Modal({
  open,
  onClose,
  title,
  subtitle,
  icon: Icon,
  size = "md",
  children,
  footer,
  closeOnBackdrop = true,
  closeOnEsc = true,
  showCloseButton = true,
  className = "",
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  // ESC key handler
  useEffect(() => {
    if (!open || !closeOnEsc) return;
    function handleEsc(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [open, closeOnEsc, onClose]);

  // Lock body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  const hasHeader = title || subtitle || Icon || showCloseButton;

  const content = (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
      onClick={closeOnBackdrop ? onClose : undefined}
    >
      <div
        ref={modalRef}
        // ✅ ADAPTIVE: Uses w-full for mobile, but respects the massive max-w on desktop
        className={`relative w-full ${sizeStyles[size]} bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh] animate-scale-in ${className}`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "modal-title" : undefined}
      >
        {/* Header */}
        {hasHeader && (
          <div className="flex items-start justify-between gap-4 px-6 py-5 border-b border-slate-200 dark:border-slate-800 flex-shrink-0">
            <div className="flex items-start gap-3 min-w-0">
              {Icon && (
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-indigo-50 dark:bg-indigo-900/20">
                  <Icon size={20} strokeWidth={1.8} className="text-indigo-600 dark:text-indigo-400" />
                </div>
              )}
              <div className="min-w-0">
                {title && (
                  <h2 id="modal-title" className="text-lg font-bold text-slate-900 dark:text-slate-100 leading-tight">
                    {title}
                  </h2>
                )}
                {subtitle && (
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                    {subtitle}
                  </p>
                )}
              </div>
            </div>
            {showCloseButton && (
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-200 transition-colors flex-shrink-0"
                aria-label="Close"
              >
                <X size={18} strokeWidth={2} />
              </button>
            )}
          </div>
        )}

        {/* Body - Scrollable if content exceeds max height */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {/* ✅ ADAPTIVE PADDING: Scales up for larger modals */}
          <div className="px-4 sm:px-6 lg:px-8 py-6">
            {children}
          </div>
        </div>

        {/* Footer */}
        {footer && (
          <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 rounded-b-2xl flex-shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );

  // Render via portal so it escapes any overflow clipping
  if (typeof document === "undefined") return null;
  return createPortal(content, document.body);
}
