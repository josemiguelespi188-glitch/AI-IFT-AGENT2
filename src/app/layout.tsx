import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "IFT AI Agent – Investor Relations",
  description:
    "Industry FinTech AI-powered investor relations agent for the Axiskey platform",
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-ift-navy text-ift-light antialiased">
        {children}
      </body>
    </html>
  );
}
