import { Geist, Geist_Mono } from "next/font/google";
import { ReportProvider } from "@/context/ReportContext";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "BTA EAA Report",
  description: "Automated accessibility evaluation",
  icons: {
    icon: "/accessibility-icon.ico", // Standard favicon
    shortcut: "/accessibility-icon.ico", // Browser shortcut icon
    apple: "/favicon.png", // Apple Touch Icon
  },
};



export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/accessibility-icon.ico" sizes="any" />
        <link rel="icon" type="image/png" href="/favicon.png" />
        <link rel="apple-touch-icon" href="/favicon.png" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ReportProvider> {/* ✅ Wrap your entire app with the provider */}
          {children}
        </ReportProvider>
      </body>
    </html>
  );
}
