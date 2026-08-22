// src/lib/brand.ts
export const brand = {
  name: "Rental Garage",
  
  colors: {
    // ── PRIMARY: Deep Royal Indigo (Wealth, Trust, Authority) ─────────
    primary:       "#4338CA", // Indigo 700 - Rich, confident
    primaryHover:  "#3730A3", // Indigo 800 - Deeper on hover
    primaryLight:  "#818CF8", // Indigo 400 - For subtle accents
    primaryMuted:  "rgba(67, 56, 202, 0.08)", // Ultra-subtle backgrounds
    primaryGlow:   "rgba(67, 56, 202, 0.15)", // For glow effects
    
    // ── SECONDARY: Warm Gold (Premium, Luxury, Value) ─────────────────
    secondary:     "#D97706", // Amber 600 - Warm, premium feel
    secondaryLight: "#FBBF24", // Amber 400
    secondaryMuted: "rgba(217, 119, 6, 0.10)",

    // ── SURFACE: Layered Depth (No more washed-out white!) ────────────
    // Layer 1: Page background - Cool, sophisticated
    bg:            "#F1F5F9", // Slate 100 - Deep, elegant
    bgElevated:    "#E2E8F0", // Slate 200
    
    // Layer 2: Cards & Containers - Crisp white with warmth
    surface:       "#FFFFFF", // Pure white - Cards pop
    surfaceHover:  "#F8FAFC", // Slate 50 - Subtle hover
    surfaceActive: "#F1F5F9",
    
    // Layer 3: Borders - Visible but elegant
    surfaceBorder:        "rgba(15, 23, 42, 0.10)", // Subtle but present
    surfaceBorderStrong:  "rgba(15, 23, 42, 0.16)",
    surfaceBorderLight:   "rgba(15, 23, 42, 0.06)",

    // ── INK: Deep Contrast (Readability is wealth) ────────────────────
    ink:           "#0F172A", // Slate 900 - Primary text (deepest)
    inkSecondary:  "#1E293B", // Slate 800
    inkMuted:      "#475569", // Slate 600 - Secondary text
    inkSubtle:     "#94A3B8", // Slate 400 - Tertiary
    inkFaint:      "#CBD5E1", // Slate 300 - Disabled
    inkInverse:    "#FFFFFF",

    // ── SEMANTIC: Clear, Confident Signals ────────────────────────────
    success:       "#059669", // Emerald 600 - Trustworthy green
    successBg:     "rgba(5, 150, 105, 0.10)",
    successText:   "#047857",
    successBorder: "rgba(5, 150, 105, 0.20)",
    
    warning:       "#D97706", // Amber 600
    warningBg:     "rgba(217, 119, 6, 0.10)",
    warningText:   "#B45309",
    warningBorder: "rgba(217, 119, 6, 0.20)",
    
    danger:        "#DC2626", // Red 600
    dangerBg:      "rgba(220, 38, 38, 0.10)",
    dangerText:    "#991B1B",
    dangerBorder:  "rgba(220, 38, 38, 0.20)",
    
    info:          "#2563EB", // Blue 600
    infoBg:        "rgba(37, 99, 235, 0.10)",
    infoText:      "#1D4ED8",

    // ── SHADOWS: Deep, Warm, Dimensional ─────────────────────────────
    // Multi-layered shadows create premium depth
    shadowSm:      "0 1px 2px 0 rgba(15, 23, 42, 0.04)",
    shadowMd:      "0 4px 6px -1px rgba(15, 23, 42, 0.06), 0 2px 4px -2px rgba(15, 23, 42, 0.04)",
    shadowLg:      "0 10px 15px -3px rgba(15, 23, 42, 0.08), 0 4px 6px -4px rgba(15, 23, 42, 0.04)",
    shadowXl:      "0 20px 25px -5px rgba(15, 23, 42, 0.10), 0 8px 10px -6px rgba(15, 23, 42, 0.06)",
    shadow2Xl:     "0 25px 50px -12px rgba(15, 23, 42, 0.16)",
    
    // Cards: Border + Shadow = Premium depth
    shadowCard:    "0 0 0 1px rgba(15, 23, 42, 0.06), 0 1px 2px 0 rgba(15, 23, 42, 0.04)",
    shadowCardHover: "0 0 0 1px rgba(67, 56, 202, 0.12), 0 8px 25px -8px rgba(67, 56, 202, 0.12)",
    shadowModal:   "0 25px 50px -12px rgba(15, 23, 42, 0.20), 0 0 0 1px rgba(15, 23, 42, 0.08)",
    shadowDropdown:"0 10px 15px -3px rgba(15, 23, 42, 0.08), 0 4px 6px -4px rgba(15, 23, 42, 0.04), 0 0 0 1px rgba(15, 23, 42, 0.06)",
    shadowFocus:   "0 0 0 2px #FFFFFF, 0 0 0 4px #4338CA",
    shadowGlow:    "0 0 30px rgba(67, 56, 202, 0.15)",

    // ── GRADIENTS: Rich, Dimensional Surfaces ─────────────────────────
    gradients: {
      primary:     "linear-gradient(135deg, #4338CA 0%, #3730A3 100%)",
      secondary:   "linear-gradient(135deg, #D97706 0%, #B45309 100%)",
      surface:     "linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 100%)",
      hover:       "linear-gradient(180deg, #F8FAFC 0%, #F1F5F9 100%)",
      dark:        "linear-gradient(160deg, #0F172A 0%, #1E293B 100%)",
      // Stat card gradients
      statPrimary: "linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 100%)",
      statSuccess: "linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)",
      statWarning: "linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)",
      statDanger:  "linear-gradient(135deg, #FEF2F2 0%, #FEE2E2 100%)",
    },
  },

  typography: {
    font: "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
    // Display - For hero sections
    display: "text-4xl sm:text-5xl font-bold tracking-tight",
    // Headings
    h1: "text-3xl sm:text-4xl font-bold tracking-tight",
    h2: "text-2xl sm:text-3xl font-semibold tracking-tight",
    h3: "text-xl sm:text-2xl font-semibold",
    h4: "text-lg font-semibold",
    h5: "text-base font-semibold",
    // Body
    body: "text-base leading-relaxed",
    bodySmall: "text-sm leading-relaxed",
    // Utilities
    small: "text-xs text-[var(--color-ink-muted)]",
    mono: "font-mono text-sm",
    label: "text-xs font-semibold uppercase tracking-wider text-[var(--color-ink-muted)]",
  },

  spacing: {
    sidebar: "260px",
    sidebarCollapsed: "72px",
    card: "p-4 sm:p-6",
    gap: "gap-4 sm:gap-6",
    pageX: "px-4 sm:px-6",
    pageY: "py-4 sm:py-6",
  },

  radius: {
    sm: "rounded-lg",      // 8px - Buttons, inputs
    md: "rounded-xl",      // 12px - Cards, dropdowns
    lg: "rounded-2xl",     // 16px - Modals, large cards
    xl: "rounded-3xl",     // 24px - Special containers
    full: "rounded-full",  // Badges, avatars
  },

  // ── PREMIUM ANIMATION EASINGS ────────────────────────────────────────
  easing: {
    spring: "cubic-bezier(0.16, 1, 0.3, 1)",
    smooth: "cubic-bezier(0.4, 0, 0.2, 1)",
    bounce: "cubic-bezier(0.34, 1.56, 0.64, 1)",
  },

  // ── DARK MODE OVERRIDES ──────────────────────────────────────────────
  dark: {
    bg: "#0A0B12",
    surface: "#10121B",
    surfaceHover: "#171926",
    surfaceBorder: "rgba(255, 255, 255, 0.06)",
    ink: "#F8FAFC",
    inkMuted: "#94A3B8",
    primary: "#6366F1",
    primaryMuted: "rgba(99, 102, 241, 0.15)",
    shadowCard: "0 0 0 1px rgba(255, 255, 255, 0.04), 0 2px 4px 0 rgba(0, 0, 0, 0.4)",
  },
} as const;
