import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/Toaster";

export const metadata: Metadata = { title: "TaskNest", description: "Keep every academic deadline in one place." };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
