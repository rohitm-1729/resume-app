import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
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
  title: "Resume Tailor",
  description: "AI-powered resume tailoring",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-zinc-50`}
      >
        <nav className="border-b border-zinc-200 bg-white px-6 py-3">
          <div className="mx-auto flex max-w-4xl items-center gap-6">
            <span className="font-semibold text-zinc-900">Resume Tailor</span>
            <Link
              href="/"
              className="text-sm text-zinc-600 hover:text-zinc-900 transition-colors"
            >
              Generate
            </Link>
            <Link
              href="/profile"
              className="text-sm text-zinc-600 hover:text-zinc-900 transition-colors"
            >
              Profile
            </Link>
          </div>
        </nav>
        <main className="mx-auto max-w-4xl px-6 py-8">{children}</main>
      </body>
    </html>
  );
}
