// src/components/client/AddClientButton.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { Plus, UserPlus, Link2, ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import AddClientModal from "./AddClientModal";

export default function AddClientButton() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAddManually = () => {
    setMenuOpen(false);
    router.push("/dashboard/clients/new");
  };

  const handleInviteClient = () => {
    setMenuOpen(false);
    setModalOpen(true);
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className="h-9 px-4 rounded-xl bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm"
      >
        <Plus size={14} strokeWidth={2.5} />
        Add Client
        <ChevronDown size={14} className={`transition-transform ${menuOpen ? "rotate-180" : ""}`} />
      </button>

      {menuOpen && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-[var(--color-surface)] border border-[var(--color-surface-border)] rounded-xl shadow-lg z-40 animate-in fade-in zoom-in-95 duration-150">
          <button
            onClick={handleAddManually}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-[var(--color-ink)] hover:bg-[var(--color-surface-hover)] transition-colors first:rounded-t-xl"
          >
            <div className="w-8 h-8 rounded-lg bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center">
              <UserPlus size={16} />
            </div>
            <div className="text-left">
              <div className="text-sm">Add Manually</div>
              <div className="text-[10px] text-[var(--color-ink-muted)] font-normal">
                Enter client details yourself
              </div>
            </div>
          </button>
          <div className="border-t border-[var(--color-surface-border)]" />
          <button
            onClick={handleInviteClient}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-[var(--color-ink)] hover:bg-[var(--color-surface-hover)] transition-colors last:rounded-b-xl"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <Link2 size={16} />
            </div>
            <div className="text-left">
              <div className="text-sm">Invite Client</div>
              <div className="text-[10px] text-[var(--color-ink-muted)] font-normal">
                Send onboarding link
              </div>
            </div>
          </button>
        </div>
      )}

      <AddClientModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}
