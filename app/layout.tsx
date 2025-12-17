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
            {/* Main content container with gradient background */}
            <div className="bg-fixed bg-gradient-to-b from-blue-200 to-white text-gray-800 
              dark:bg-gradient-to-b dark:from-gray-800 dark:via-gray-900 dark:to-gray-900 dark:text-white">

              {children}
            </div>
          </NotificationProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

