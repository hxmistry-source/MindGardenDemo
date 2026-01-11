import type { Metadata } from "next";
import { Fraunces, Manrope } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
});

export const metadata: Metadata = {
  title: "MindGarden",
  description: "Grow a daily mental wellness garden in minutes.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${fraunces.variable} ${manrope.variable}`}>
      <body className="font-[var(--font-manrope)]">
        <div className="relative min-h-screen overflow-hidden">
          <div className="pointer-events-none absolute -left-40 top-24 h-80 w-80 rounded-full bg-[#f1d1b4]/50 blur-[120px]" />
          <div className="pointer-events-none absolute -right-32 bottom-10 h-72 w-72 rounded-full bg-[#6f8f5c]/30 blur-[120px]" />
          <main className="relative mx-auto flex min-h-screen w-full max-w-5xl flex-col px-6 py-10">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
