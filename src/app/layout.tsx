import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/auth-context";
import { Toaster } from "react-hot-toast";

// 1. Configure Sans-Serif Font (Primary UI) - Next.js optimizes this automatically (zero layout shift)
const sansFont = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800"],
});

// 2. Configure Monospace Font (Technical IDs, code, license plates, etc.)
const monoFont = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "Rental Manager",
  description: "Enterprise-grade vehicle rental and fleet management platform.",
  icons: {
    icon: "/favicon.ico", // Update with your actual favicon path
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html 
      lang="en" 
      suppressHydrationWarning
      className={`${sansFont.variable} ${monoFont.variable}`}
    >
      <body className="
        font-sans 
        antialiased 
        bg-[var(--color-bg)] 
        text-[var(--color-ink)] 
        selection:bg-[var(--color-primary-muted)] 
        selection:text-[var(--color-primary-text)]
        scroll-smooth
        transition-colors duration-300 ease-in-out
      ">
        <AuthProvider>
          <Toaster 
            position="top-right" 
            toastOptions={{
              // Premium Toaster styling that perfectly matches your design system
              className: `
                font-sans 
                bg-[var(--color-surface)] 
                text-[var(--color-ink)] 
                border border-[var(--color-surface-border)] 
                shadow-[var(--shadow-dropdown)] 
                rounded-xl 
                px-4 py-3
              `,
              // Success toast specific override
              success: {
                iconTheme: {
                  primary: "var(--color-success)",
                  secondary: "var(--color-surface)",
                },
              },
              // Error toast specific override
              error: {
                iconTheme: {
                  primary: "var(--color-danger)",
                  secondary: "var(--color-surface)",
                },
              },
            }}
          />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
