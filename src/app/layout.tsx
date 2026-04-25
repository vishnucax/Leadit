import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Leadit | Anonymous College Platform",
  description: "Anonymous college storytelling, confessions, and discussions for LEAD College of Management. No login required.",
  keywords: ["anonymous", "college", "LEAD College", "campus", "confession", "discussion"],
  openGraph: {
    title: "Leadit | Anonymous College Platform",
    description: "Share anonymously. No login required.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} h-full`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col font-sans bg-background text-foreground antialiased">
        {children}
        <Toaster
          position="bottom-center"
          toastOptions={{
            style: {
              background: "white",
              border: "1px solid #e2e8f0",
              color: "#1e293b",
              borderRadius: "12px",
              boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
            },
          }}
        />
      </body>
    </html>
  );
}
