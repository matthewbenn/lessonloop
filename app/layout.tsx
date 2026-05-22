import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LessonLoop POC",
  description: "Coach-managed lesson plans with student magic-link access"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
