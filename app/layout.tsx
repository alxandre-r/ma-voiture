/**
 * @file app/layout.tsx
 * @fileoverview Root layout component for the application.
 * 
 * This is the main layout that wraps all pages. It sets up:
 * - Font loading (Geist fonts)
 * - Theme provider (dark/light mode)
 * - Global styling and gradients
 * - Metadata for SEO
 */

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "next-themes";
import { NotificationProvider } from '@/contexts/NotificationContext';
import { FamilyProvider } from '@/contexts/FamilyContext';

// Load Geist fonts with Latin subset
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

/**
 * Application metadata for SEO and browser display.
 */
export const metadata: Metadata = {
  title: "Ma voiture",
  description: "Application de gestion de véhicules",
};

/**
 * RootLayout Component
 * 
 * Main application layout that wraps all pages.
 * Sets up theme provider and global styling.
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components (pages)
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {/* Theme provider with proper configuration */}
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem={true}
        >
          {/* Notification provider for global notifications */}
          <NotificationProvider>
            {/* Family provider for family context */}
            <FamilyProvider>
              {/* Main content container */}
              <div className="text-gray-800 dark:text-white bg-white dark:bg-gray-950 min-h-screen">
                {children}
              </div>
            </FamilyProvider>
          </NotificationProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

