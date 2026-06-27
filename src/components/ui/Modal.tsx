"use client";

import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { X, LucideIcon } from "lucide-react";

type ModalSize = "sm" | "md" | "lg" | "xl" | "full";

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

const sizeStyles: Record<ModalSize, string> = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  full: "max-w-3xl",
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
      className="modal-overlay animate-fade-in"
      onClick={closeOnBackdrop ? onClose : undefined}
    >
      <div
        ref={modalRef}
        className={`modal ${sizeStyles[size]} w-full animate-slide-up ${className}`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "modal-title" : undefined}
      >
        {/* Header */}
        {hasHeader && (
          <div className="flex items-start justify-between gap-4 px-6 py-5 border-b border-surface-border">
            <div className="flex items-start gap-3 min-w-0">
              {Icon && (
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-accent-bg">
                  <Icon
                    size={20}
                    strokeWidth={1.8}
                    className="text-accent-dark"
                  />
                </div>
              )}
              <div className="min-w-0">
                {title && (
                  <h2
                    id="modal-title"
                    className="text-lg font-semibold text-ink leading-tight"
                  >
                    {title}
                  </h2>
                )}
                {subtitle && (
                  <p className="text-sm text-ink-muted mt-0.5 leading-snug">
                    {subtitle}
                  </p>
                )}
              </div>
            </div>
            {showCloseButton && (
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg flex items-center justify-center
                  text-ink-subtle hover:bg-surface-hover hover:text-ink transition-colors flex-shrink-0"
                aria-label="Close"
              >
                <X size={18} strokeWidth={2} />
              </button>
            )}
          </div>
        )}

        {/* Body */}
        <div className="px-6 py-5">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-surface-border bg-surface/50">
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