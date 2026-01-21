import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "NotesFlow - Professional Note-Taking for Everyone",
  description: "A professional notes application for regular and professional use. Organize your thoughts, boost productivity, and never lose an idea.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={`${inter.className} bg-gray-50 dark:bg-slate-950 text-gray-900 dark:text-white`}>
        <Header />
        <ThemeProvider>{children}</ThemeProvider>
        <Footer />

      </body>
    </html>
  );
}
