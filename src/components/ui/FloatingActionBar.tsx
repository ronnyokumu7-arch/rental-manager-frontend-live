"use client";
import { ReactNode } from "react";

interface FloatingActionBarProps {
  children: ReactNode;
}

export default function FloatingActionBar({ children }: FloatingActionBarProps) {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 p-2 rounded-2xl border border-surface-border/50 bg-surface-card/80 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
      {children}
    </div>
  );
}
