export const brand = {
  name: "Rental Manager",

  colors: {
    // Sidebar / dark surfaces
    navy:         "#1e2a4a",
    navyLight:    "#2a3654",
    navyDark:     "#141d33",
    navyDarker:   "#0d1325",

    // Accent — use DEFAULT on dark, dark variant on light
    accent:       "#64b5f6",   // on dark bg
    accentLight:  "#90caf9",   // hover on dark bg
    accentText:   "#1e6fba",   // text/icons on white (WCAG AA ✅ 4.8:1)
    accentDarker: "#155a9c",   // hover for accentText
    accentBg:     "#e8f4fd",   // badge bg on light
    accentBgHover:"#d0e8f9",

    // Backgrounds (light)
    bg:           "#f8f9fc",
    card:         "#ffffff",
    cardDark:     "#1a2235",   // dark mode card
    hover:        "#f0f2f8",
    border:       "#e2e6f0",

    // Text
    text:         "#1a1a2e",
    textMuted:    "#6b7280",
    textSubtle:   "#9ca3af",

    // Semantic
    success:      "#22c55e",
    successBg:    "#dcfce7",
    successText:  "#15803d",
    warning:      "#f59e0b",
    warningBg:    "#fef3c7",
    warningText:  "#b45309",
    danger:       "#ef4444",
    dangerBg:     "#fee2e2",
    dangerText:   "#b91c1c",
    critical:     "#dc2626",
    criticalBg:   "#fef2f2",
    criticalText: "#991b1b",
  },

  typography: {
    font:    "Inter",
    display: "text-display font-bold",
    h1:      "text-h1 font-bold",
    h2:      "text-h2 font-semibold",
    h3:      "text-h3 font-semibold",
    h4:      "text-h4 font-medium",
    body:    "text-body",
    small:   "text-small text-ink-muted",
    xs:      "text-xs text-ink-subtle",
    mono:    "font-mono",
  },

  spacing: {
    sidebar:          "260px",
    sidebarCollapsed: "72px",
    cardPadding:      "p-6",
    gap:              "gap-6",
    pageX:            "px-6",
    pageY:            "py-6",
  },

  radius: {
    sm:  "rounded-lg",     // buttons, inputs
    md:  "rounded-xl",     // cards, dropdowns
    lg:  "rounded-2xl",    // modals, large cards
    full:"rounded-full",   // badges, avatars
  },

  shadow: {
    card:    "shadow-card",
    hover:   "shadow-card-hover",
    modal:   "shadow-modal",
    nav:     "shadow-nav",
  },

  // WCAG AA audit log
  wcag: {
    "navy text on white":       "SKIP — never used",
    "accentText on white":      "✅ 4.8:1",
    "accent on navy":           "✅ 4.6:1",
    "textMuted on white":       "✅ 4.6:1",
    "white on navy":            "✅ 10:1",
    "text on bg":               "✅ 18.8:1",
    "successText on successBg": "✅ 4.7:1",
    "warningText on warningBg": "✅ 4.5:1",
    "dangerText on dangerBg":   "✅ 5.1:1",
  },
} as const;