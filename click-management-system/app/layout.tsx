import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Click Cafe OS",
  description: "High-density cafe management system",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased overflow-hidden h-screen w-screen">
        {children}
      </body>
    </html>
  );
}
