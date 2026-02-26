import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Geopolitical Events Dashboard",
  description: "Real-time geopolitical events and hotspots tracker",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
