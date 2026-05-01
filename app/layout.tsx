import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MoneyMap PKR",
  description: "Mobile-first Islamic personal finance manager for Pakistan.",
  applicationName: "MoneyMap PKR",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#146c43",
  width: "device-width",
  initialScale: 1,
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
