import type { Metadata } from "next";
import { notoSans } from "../lib/fonts";
import "./globals.css";
import { SidebarProvider } from "@/components/ui/sidebar";
import AppSidebar from "@/components/layout/app-sidebar";

export const metadata: Metadata = {
  title: "MunchMates",
  description: "Find recipes with the ingredients you have at home!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${notoSans.variable} antialiased`}>
        <main style={{ minHeight: '80vh', padding: '1rem' }}>{children}</main>
      </body>
    </html>
  );
}
