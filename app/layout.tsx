import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "next-themes";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ma voiture",
  description: "Application de gestion de véhicules",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider attribute='class' defaultTheme='system' enableSystem disableTransitionOnChange>
          <div className="bg-fixed bg-gradient-to-b from-blue-200 to-white text-gray-800 
            dark:bg-gradient-to-b dark:from-gray-800 dark:via-gray-900 dark:to-gray-900 dark:text-white">

            {children}
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}

