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

import localFont from 'next/font/local';
import './globals.css';
import { ThemeProvider } from 'next-themes';

import { NotificationProvider } from '@/contexts/NotificationContext';

import type { Metadata } from 'next';

const harmonyOSSans = localFont({
  src: [
    { path: '../public/fonts/HarmonyOS_Sans_Thin.ttf', weight: '100', style: 'normal' },
    { path: '../public/fonts/HarmonyOS_Sans_Thin_Italic.ttf', weight: '100', style: 'italic' },
    { path: '../public/fonts/HarmonyOS_Sans_Light.ttf', weight: '300', style: 'normal' },
    { path: '../public/fonts/HarmonyOS_Sans_Light_Italic.ttf', weight: '300', style: 'italic' },
    { path: '../public/fonts/HarmonyOS_Sans_Regular.ttf', weight: '400', style: 'normal' },
    { path: '../public/fonts/HarmonyOS_Sans_Regular_Italic.ttf', weight: '400', style: 'italic' },
    { path: '../public/fonts/HarmonyOS_Sans_Medium.ttf', weight: '500', style: 'normal' },
    { path: '../public/fonts/HarmonyOS_Sans_Medium_Italic.ttf', weight: '500', style: 'italic' },
    { path: '../public/fonts/HarmonyOS_Sans_Bold.ttf', weight: '700', style: 'normal' },
    { path: '../public/fonts/HarmonyOS_Sans_Bold_Italic.ttf', weight: '700', style: 'italic' },
    { path: '../public/fonts/HarmonyOS_Sans_Black.ttf', weight: '900', style: 'normal' },
    { path: '../public/fonts/HarmonyOS_Sans_Black_Italic.ttf', weight: '900', style: 'italic' },
  ],
  variable: '--font-harmony',
});

/**
 * Application metadata for SEO and browser display.
 */
export const metadata: Metadata = {
  title: 'Ma voiture',
  description: 'Application de gestion de véhicules',
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
    <html lang="fr" suppressHydrationWarning className={harmonyOSSans.variable}>
      <body className="antialiased">
        {/* Theme provider with proper configuration */}
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem={true}>
          {/* Main content container */}
          <div className="text-gray-800 dark:text-white bg-white dark:bg-gray-950 min-h-screen">
            <NotificationProvider>{children}</NotificationProvider>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
