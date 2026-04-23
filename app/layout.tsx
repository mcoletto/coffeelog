import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import { Lora } from "next/font/google";
import "./globals.css";
import { BottomNav } from "@/components/layout/BottomNav";
import { Toaster } from "@/components/ui/sonner";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });
const lora  = Lora({ subsets: ["latin"], variable: "--font-serif", style: ["normal", "italic"] });

export const metadata: Metadata = {
  title: "CoffeeLog",
  description: "Mi diario de cafés",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "CoffeeLog",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#FAF6F0",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${geist.variable} ${lora.variable}`}>
      <body className="min-h-screen bg-background">
        <main className="max-w-md mx-auto min-h-screen pb-24 relative">
          {children}
        </main>
        <div className="max-w-md mx-auto">
          <BottomNav />
        </div>
        <Toaster />
      </body>
    </html>
  );
}
