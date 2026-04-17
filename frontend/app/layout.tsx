import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LifeOS | Adaptive Behavior Engine",
  description: "The operating system for your life. Track goals, habits, focus sessions, and behavioral patterns with data-driven insights.",
};

/**
 * Root Layout — Bare shell providing HTML/body and global styles.
 * Route groups handle their own layout composition:
 * - (app): App shell with Sidebar + TopBar
 * - (landing): Full-width marketing layout
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
