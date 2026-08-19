// src/components/ui/SecureLightbox.tsx
"use client";

import { useEffect, useState } from "react";
import { X, ExternalLink, Loader2, AlertTriangle } from "lucide-react";
import { fetchSignedUrl } from "@/components/ui/SecureImage";

interface SecureLightboxProps {
  url: string | null;   // stored API URL; null = closed
  title?: string;
  onClose: () => void;
}

export default function SecureLightbox({ url, title = "Document", onClose }: SecureLightboxProps) {
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  // Resolve the signed URL whenever a document is opened
  useEffect(() => {
    if (!url) return;
    let cancelled = false;
    setSignedUrl(null);
    setFailed(false);
    
    fetchSignedUrl(url).then((u) => {
      if (cancelled) return;
      
      // ✅ FIXED: Replaced ternary expression with standard if/else statement
      // to satisfy the `@typescript-eslint/no-unused-expressions` rule.
      if (u) {
        setSignedUrl(u);
      } else {
        setFailed(true);
      }
    });
    
    return () => { cancelled = true; };
  }, [url]);

  // Esc key closes
  useEffect(() => {
    // ✅ FIXED: Replaced short-circuit expression with standard if statement
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    
    if (url) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [url, onClose]);

  if (!url) return null;

  const isPdf = /\.pdf($|\?)/i.test(url);

  return (
    <div
      className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-surface-border)] shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-surface-border)]">
          <h4 className="text-sm font-bold text-[var(--color-ink)] truncate">{title}</h4>
          <div className="flex items-center gap-1">
            {signedUrl && (
              <button
                type="button"
                onClick={() => window.open(signedUrl, "_blank")}
                title="Open in new tab"
                className="p-1.5 rounded-lg text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] hover:bg-[var(--color-surface-hover)] transition-colors"
              >
                <ExternalLink size={15} />
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              title="Close"
              className="p-1.5 rounded-lg text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] hover:bg-[var(--color-surface-hover)] transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-auto bg-black/40 flex items-center justify-center min-h-[300px]">
          {failed ? (
            <div className="p-8 text-center">
              <AlertTriangle size={28} className="text-amber-500 mx-auto mb-2" />
              <p className="text-xs text-[var(--color-ink-muted)]">Unable to load this document.</p>
            </div>
          ) : !signedUrl ? (
            <Loader2 size={24} className="animate-spin text-[var(--color-ink-muted)]" />
          ) : isPdf ? (
            <iframe src={signedUrl} title={title} className="w-full h-[70vh] bg-white" />
          ) : (
            <img src={signedUrl} alt={title} className="max-w-full max-h-[70vh] object-contain" />
          )}
        </div>
      </div>
    </div>
  );
}
