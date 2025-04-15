// ./app/layout.tsx
import { Geist } from "next/font/google";

import { AppProvider } from "@/components/app-provider";
import "./globals.css";

const geistSans = Geist({
  display: "swap",
  subsets: ["latin"],
});

export const metadata = {
  title: "BigWater - Gestion de Vidéos",
  description: "Plateforme de gestion de vidéos pour professionnels",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${geistSans.className} dark`} suppressHydrationWarning>
      <body className="bg-background text-foreground">
        <AppProvider>
          {children}
        </AppProvider>
      </body>
    </html>
  );
}