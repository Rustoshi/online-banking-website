import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CityPrime Bank - Build Your Financial Future",
  description: "Experience modern banking with competitive rates, innovative tools, and personalized service designed to help you achieve your financial goals.",
  keywords: ["banking", "online banking", "savings", "loans", "credit cards", "financial services"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          {children}
        </AuthProvider>
        
        {/* JivoChat Live Chat Widget */}
        <Script
          id="jivo-chat"
          src="https://code.jivosite.com/widget/UTBVrbT5Uc"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
