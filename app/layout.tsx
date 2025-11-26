import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div className="bg-gradient-to-b h-screen from-blue-200 to-white text-gray-800 
        dark:bg-gradient-to-b dark:from-gray-800 dark:via-gray-900 dark:to-gray-900 dark:text-white">
          {children}
        </div>
      </body>
    </html>
  );
}
