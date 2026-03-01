import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Loretto Student Dashboard",
  description: "Student dashboard for Loretto School of Childhood",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
