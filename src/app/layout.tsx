import type { Metadata, Viewport } from "next";
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
  title: "Next on My Dev-Life — 59 apps",
  description:
    "A Netflix-style board tracking 59 apps: released, coming soon, and confirmed.",
};

/** `viewportFit: cover` + the notch padding below keeps content off the notch. */
export const viewport: Viewport = {
  themeColor: "#08080b",
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full scroll-smooth antialiased`}
    >
      <body className="min-h-full bg-ink font-sans [padding-left:env(safe-area-inset-left)] [padding-right:env(safe-area-inset-right)]">
        {children}
      </body>
    </html>
  );
}
