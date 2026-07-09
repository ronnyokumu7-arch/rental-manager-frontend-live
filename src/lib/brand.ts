export const brand = {
  name: "Rental Manager",
  colors: {
    // ── Brand Identity (The "Billion Dollar" Indigo) ──────────────────
    primary:       "#6366f1", // Indigo 500
    primaryHover:  "#4f46e5", // Indigo 600
    primaryMuted:  "#e0e7ff", // Indigo 100
    primaryText:   "#3730a3", // Indigo 800

    // ── Backgrounds (Light Mode) ──────────────────────────────────────
    bg:            "#fafafa", // Zinc 50 (App background)
    surface:       "#ffffff", // Card background
    surfaceHover:  "#f4f4f5", // Zinc 100 (Hover state)
    surfaceBorder: "#e4e4e7", // Zinc 200 (Subtle divider)
    surfaceBorderStrong: "#d4d4d8", // Zinc 300 (Active/Focus)

    // ── Ink (Text Colors) ─────────────────────────────────────────────
    ink:           "#09090b", // Zinc 950 (Primary text)
    inkMuted:      "#52525b", // Zinc 600 (Secondary text)
    inkSubtle:     "#a1a1aa", // Zinc 400 (Tertiary text)
    inkInverse:    "#ffffff",

    // ── Semantic Colors (Light Mode) ──────────────────────────────────
    success:       "#10b981", // Emerald 500
    successBg:     "#d1fae5", // Emerald 100
    successText:   "#065f46", // Emerald 800
    
    warning:       "#f59e0b", // Amber 500
    warningBg:     "#fef3c7", // Amber 100
    warningText:   "#92400e", // Amber 800
    
    danger:        "#ef4444", // Red 500
    dangerBg:      "#fee2e2", // Red 100
    dangerText:    "#991b1b", // Red 800

    // ── Depth & Elevation (Shadows) ───────────────────────────────────
    shadowSm:      "0 1px 2px 0 rgb(0 0 0 / 0.05)",
    shadowMd:      "0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05)",
    shadowLg:      "0 10px 15px -3px rgb(0 0 0 / 0.05), 0 4px 6px -4px rgb(0 0 0 / 0.05)",
    shadowXl:      "0 20px 25px -5px rgb(0 0 0 / 0.05), 0 8px 10px -6px rgb(0 0 0 / 0.05)",
    
    // Component Specific Shadows
    shadowCard:    "0 0 0 1px var(--color-surface-border), var(--shadow-sm)",
    shadowCardHover: "0 0 0 1px var(--color-surface-border-strong), var(--shadow-md)",
    shadowModal:   "0 25px 50px -12px rgb(0 0 0 / 0.15), 0 0 0 1px var(--color-surface-border)",
    shadowDropdown:"0 10px 15px -3px rgb(0 0 0 / 0.05), 0 4px 6px -4px rgb(0 0 0 / 0.05), 0 0 0 1px var(--color-surface-border)",
    shadowFocus:   "0 0 0 2px var(--color-surface), 0 0 0 4px var(--color-primary)",
  },
  typography: {
    font: "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
    display: "text-4xl font-bold tracking-tight",
    h1: "text-3xl font-bold tracking-tight",
    h2: "text-2xl font-semibold tracking-tight",
    h3: "text-lg font-semibold",
    h4: "text-base font-medium",
    body: "text-sm leading-relaxed",
    small: "text-xs text-ink-muted",
    mono: "font-mono",
  },
  spacing: {
    sidebar: "260px",
    sidebarCollapsed: "72px",
    cardPadding: "p-6",
    gap: "gap-6",
    pageX: "px-6",
    pageY: "py-6",
  },
  radius: {
    sm: "rounded-lg",     // Buttons, inputs
    md: "rounded-xl",     // Cards, dropdowns
    lg: "rounded-2xl",    // Modals, large cards
    full: "rounded-full", // Badges, avatars
  },
} as const;
