// src/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import React from "react";
import { Providers } from "@/components/Providers"; // Import du composant client
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Grattage",
  description: "Alexandre Web App",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
