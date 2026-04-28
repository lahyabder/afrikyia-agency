import type { Metadata } from "next";
import { Geist, Geist_Mono, Almarai } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const almarai = Almarai({
  variable: "--font-almarai",
  subsets: ["arabic"],
  weight: ["300", "400", "700", "800"],
});

export const metadata: Metadata = {
  title: "AFRIKYia | L’Artifice Intelligent - Digital Cultural Platform",
  description: "Afrikyia is a global digital cultural platform that redefines intelligence through the fusion of culture, creativity, and technology. Discover the vision of L’Artifice Intelligent.",
};

import { LanguageProvider } from '@/context/LanguageContext';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${almarai.variable} antialiased`}
      >
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
