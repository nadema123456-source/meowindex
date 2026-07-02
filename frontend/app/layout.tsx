import type { Metadata } from "next";
import { Baloo_2 } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const baloo = Baloo_2({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-baloo",
});

export const metadata: Metadata = {
  title: "MeowIndex",
  description: "Cat adoption aggregator from Czech shelters",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={baloo.variable}>
      <body className="flex min-h-screen flex-col bg-cream text-ink">
        <Navbar />
        <main className="w-full flex-1 px-4 py-8 sm:px-6">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
