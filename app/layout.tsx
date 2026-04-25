import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ChatWidget } from "@/components/ChatWidget";
import { SlackPreviewPanel } from "@/components/SlackPreviewPanel";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  axes: ["opsz", "SOFT"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "CJ Real Estate — Sydney Inner West Specialists",
  description:
    "Buying, selling, leasing and managing properties across Rhodes, Newington, Meadowbank and Sydney's Inner West.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${inter.variable}`}>
      <body>
        <SiteHeader />
        <main>{children}</main>
        <SiteFooter />
        <ChatWidget />
        <SlackPreviewPanel />
      </body>
    </html>
  );
}
