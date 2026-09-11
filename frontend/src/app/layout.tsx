import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Project Management Dashboard",
  description: "Manage projects, boards, and tasks",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
