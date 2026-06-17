import type { Metadata } from "next";
import { Inter, IBM_Plex_Sans, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/ui/Toast";
import { StoreSync } from "@/components/layout/StoreSync";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

const plex = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-plex",
});

const grotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-grotesk",
});

export const metadata: Metadata = {
  title: "MaterialOps — Recovery Command Center",
  description:
    "Post-event material recovery operations platform for Mercedes-Benz Stadium and surrounding event zones.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${plex.variable} ${grotesk.variable}`}>
      <body>
        <StoreSync />
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
