import type { Metadata, Viewport } from "next";
import { Poppins, Geist_Mono } from "next/font/google";
import "./globals.css";
import SessionWatcher from "@/components/SessionWatcher";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#267D48",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "Layanan BRMP Agroklimat dan Hidrologi",
  description:
    "Portal Layanan Terintegrasi BRMP Agroklimat dan Hidrologi — standarisasi, konsultasi, peminjaman alat, magang, dan edukasi pertanian untuk mendukung kedaulatan pangan Indonesia.",
  icons: {
    icon: "/images/logo_brmp.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${poppins.variable} h-full antialiased scroll-smooth`}
      data-scroll-behavior="smooth"
    >
      <body className="min-h-full flex flex-col overflow-x-hidden">
        <SessionWatcher />
        {children}
      </body>
    </html>
  );
}
