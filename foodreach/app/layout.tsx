import type { Metadata } from "next";
import "./globals.css";
import "./enhancements.css";
import "./directory-print.css";

export const metadata: Metadata = {
  title: "Heartfood CT | Greater Hartford",
  description: "Find food resources that fit your schedule and transportation.",
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}

