import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AuthProvider } from "@/hooks/Auth";
import { supabase } from "@/services/supabase";
import { Sidebar } from "@/components";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "EasyDX",
  description: "An AI Approach to Voiceovers in Gaming",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const accessToken = session?.access_token || null;
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="page-wrapper">
          <AuthProvider accessToken={accessToken}>{children}</AuthProvider>
        </div>
      </body>
    </html>
  );
}
