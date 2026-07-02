import type { Metadata } from "next";
import { Baloo_2 } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PastelBackground from "@/components/PastelBackground";

const baloo = Baloo_2({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-baloo",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  ),
  title: {
    default: "MeowIndex — cat adoption from Czech shelters",
    template: "%s | MeowIndex",
  },
  description:
    "Adoptable cats from shelters across Czechia in one colorful catalog — updated automatically, free to browse.",
  openGraph: {
    siteName: "MeowIndex",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={baloo.variable}>
      <body className="flex min-h-screen flex-col bg-cream text-ink">
        <PastelBackground />
        <Navbar />
        <main className="w-full flex-1 px-4 py-8 sm:px-6">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
