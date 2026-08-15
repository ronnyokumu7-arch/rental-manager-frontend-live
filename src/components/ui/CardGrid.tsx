// src/components/ui/CardGrid.tsx
"use client";

import { Fragment, useState, useEffect } from "react";
import { MoreVertical } from "lucide-react";
import { createPortal } from "react-dom";
import Pagination from "./Pagination";

export interface RowAction<T> {
  label: string;
  icon?: React.ElementType;
  onClick: (item: T) => void;
  separator?: boolean;
  disabled?: boolean;
  variant?: "default" | "danger" | "primary";
}

export interface CardRenderProps<T> {
  item: T;
  onTitleClick: (item: T) => void;
}

interface CardGridProps<T> {
  data: T[];
  renderCardHeader: (props: CardRenderProps<T>) => React.ReactNode;
  renderCardBody: (props: CardRenderProps<T>) => React.ReactNode;
  getCardId: (item: T) => string | number;
  rowActions?: ((item: T) => RowAction<T>[]) | RowAction<T>[];
  currentPage?: number;
  totalPages?: number;
  totalItems?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
  emptyMessage?: string;
  loading?: boolean;
}

export default function CardGrid<T>({
  data,
  renderCardHeader,
  renderCardBody,
  getCardId,
  rowActions,
  currentPage = 1,
  totalPages = 1,
  totalItems = 0,
  pageSize = 3,
  onPageChange,
  emptyMessage = "No items found",
  loading = false,
}: CardGridProps<T>) {
  const [openActionId, setOpenActionId] = useState<string | number | null>(null);
  const [dropdownPos, setDropdownPos] = useState<{ top: number; right: number } | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // ✅ FIXED: Check both the trigger button AND the portal menu
  useEffect(() => {
    if (!openActionId) return;
    
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const isInsideTrigger = target.closest(`[data-card-actions="${openActionId}"]`);
      const isInsideMenu = target.closest(`[data-dropdown-menu="${openActionId}"]`);
      
      if (!isInsideTrigger && !isInsideMenu) {
        setOpenActionId(null);
        setDropdownPos(null);
      }
    };
    
    // ✅ FIXED: Use click instead of mousedown to avoid race condition
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [openActionId]);

  useEffect(() => {
    if (openActionId === null) return;
    const close = () => {
      setOpenActionId(null);
      setDropdownPos(null);
    };
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    return () => {
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
    };
  }, [openActionId]);

  const handleToggleActions = (e: React.MouseEvent, item: T) => {
    e.stopPropagation();
    e.preventDefault();
    
    const id = getCardId(item);
    
    if (openActionId === id) {
      setOpenActionId(null);
      setDropdownPos(null);
      return;
    }

    const acts = typeof rowActions === "function" ? rowActions(item) : rowActions || [];
    const separators = acts.filter((a) => a.separator).length;
    const estHeight = acts.length * 41 + separators * 9 + 8;

    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const top =
      spaceBelow < estHeight + 12
        ? Math.max(8, rect.top - estHeight - 8)
        : rect.bottom + 8;

    setOpenActionId(id);
    setDropdownPos({
      top,
      right: Math.max(8, window.innerWidth - rect.right),
    });
  };

  if (loading) {
    return (
      <div className="p-4 space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="p-4 rounded-xl bg-[var(--color-surface-hover)]/40 border border-[var(--color-surface-border)] animate-pulse">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="w-10 h-10 rounded-full bg-[var(--color-surface)] border border-[var(--color-surface-border)]" />
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="h-4 bg-[var(--color-surface-hover)] rounded w-3/4" />
                  <div className="h-3 bg-[var(--color-surface-hover)] rounded w-1/2" />
                </div>
              </div>
              <div className="w-8 h-8 rounded-lg bg-[var(--color-surface-hover)]" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="p-12 text-center">
        <div className="w-16 h-16 rounded-2xl bg-[var(--color-surface-hover)] border border-[var(--color-surface-border)] flex items-center justify-center mx-auto mb-4">
          <MoreVertical size={24} className="text-[var(--color-ink-subtle)]" />
        </div>
        <h3 className="text-base font-bold text-[var(--color-ink)] mb-2">{emptyMessage}</h3>
        <p className="text-sm text-[var(--color-ink-muted)]">Try adjusting your filters</p>
      </div>
    );
  }

  return (
    <>
      <div className="p-4 space-y-3">
        {data.map((item) => {
          const id = getCardId(item);
          const actions = rowActions && (typeof rowActions === "function" ? rowActions(item) : rowActions);

          return (
            <div
              key={id}
              className="p-4 rounded-xl bg-[var(--color-surface-hover)]/40 border border-[var(--color-surface-border)] hover:border-[var(--color-primary)]/30 transition-all shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="min-w-0 flex-1">
                    {renderCardHeader({
                      item,
                      onTitleClick: () => {},
                    })}
                  </div>
                </div>

                {actions && actions.length > 0 && (
                  <div className="relative flex-shrink-0" data-card-actions={id}>
                    <button
                      type="button"
                      onClick={(e) => handleToggleActions(e, item)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg text-[var(--color-ink-muted)] hover:bg-[var(--color-surface)] transition-all"
                      title="More actions"
                      aria-label="More actions"
                    >
                      <MoreVertical size={16} />
                    </button>
                  </div>
                )}
              </div>

              <div className="mt-3">
                {renderCardBody({
                  item,
                  onTitleClick: () => {},
                })}
              </div>
            </div>
          );
        })}
      </div>

      {totalPages > 1 && onPageChange && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          pageSize={pageSize}
          onPageChange={onPageChange}
          viewMode="mobile"
        />
      )}

      {/* ✅ Portal-rendered Row Actions Dropdown */}
      {mounted && openActionId !== null && dropdownPos && createPortal(
        <>
          {/* Backdrop - allows clicking through to close */}
          <div className="fixed inset-0 z-[9998]" onClick={() => setOpenActionId(null)} />
          
          {/* Dropdown Menu */}
          <div
            data-dropdown-menu={openActionId}
            className="fixed z-[9999] w-56 bg-[var(--color-surface)] border border-[var(--color-surface-border)] rounded-xl shadow-[var(--shadow-dropdown)] overflow-hidden animate-in fade-in zoom-in-95 duration-100"
            style={{ top: dropdownPos.top, right: dropdownPos.right }}
            onClick={(e) => e.stopPropagation()}
          >
            {(() => {
              const item = data.find((d) => getCardId(d) === openActionId);
              if (!item) return null;
              
              const actions = typeof rowActions === "function" ? rowActions(item) : rowActions || [];
              
              return actions.map((action, index) => (
                <Fragment key={`${action.label}-${index}`}>
                  {action.separator && index > 0 && (
                    <div className="h-px bg-[var(--color-surface-border)] my-1" />
                  )}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      
                      // Close menu first, then execute action
                      setOpenActionId(null);
                      setDropdownPos(null);
                      
                      // Execute the action
                      if (typeof action.onClick === "function") {
                        action.onClick(item);
                      }
                    }}
                    disabled={action.disabled}
                    className={`w-full flex items-center gap-2 px-4 py-2.5 text-xs font-medium transition-colors ${
                      action.disabled
                        ? "text-[var(--color-ink-subtle)] cursor-not-allowed"
                        : action.variant === "danger"
                        ? "text-[var(--color-danger-text)] hover:bg-[var(--color-danger-bg)]"
                        : action.variant === "primary"
                        ? "text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10"
                        : "text-[var(--color-ink)] hover:bg-[var(--color-surface-hover)]"
                    }`}
                  >
                    {action.icon && <action.icon size={14} />}
                    {action.label}
                  </button>
                </Fragment>
              ));
            })()}
          </div>
        </>,
        document.body
      )}
    </>
  );
}
