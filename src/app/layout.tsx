import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Lingo — English, every day",
  description: "Belajar bahasa Inggris sedikit demi sedikit, setiap hari.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" data-theme="light">
      <body className="antialiased">{children}</body>
    </html>
  );
}
