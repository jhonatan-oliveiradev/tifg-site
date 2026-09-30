import type { Metadata } from "next";
import "./globals.css";
import "./v2.css";

export const metadata: Metadata = {
  title: "The Internet Field Guide",
  description: "A field guide to strange creatures found on the internet.",
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
