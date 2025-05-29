import type { Metadata } from "next";
import "./globals.css";
import { Space_Grotesk, Inter } from 'next/font/google';
// Removed global p5.sound import - will be handled client-side
// import Background from '@/components/canvas/Background';

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-space-grotesk',
  weight: ['300', '400', '500', '600', '700']
});

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter'
});

export const metadata: Metadata = {
  title: "Philosophical Toys Digital Atelier",
  description: "A digital atelier of philosophical toys and instruments, accompanied by research commentary and reflections",
  keywords: ["toys", "philosophy", "3D models", "interactive art", "research", "atelier", "reflection"],
  authors: [{ name: "Philosophical Toys Atelier" }],
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`relative min-h-screen overflow-hidden ${spaceGrotesk.variable} ${inter.variable}`}>
        {/* <Background /> */}
        <div className="relative z-10">
          {children}
        </div>
      </body>
    </html>
  );
}
