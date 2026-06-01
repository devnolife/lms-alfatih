import type { Metadata, Viewport } from "next";
import { Fredoka, Nunito } from "next/font/google";
import "./globals.css";

const fredoka = Fredoka({
  variable: "--font-feather",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const nunito = Nunito({
  variable: "--font-din",
  subsets: ["latin"],
  weight: ["500", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: '"python" is "fun" — Belajar Coding Seru!',
  description:
    "Belajar coding Python seseru bermain game petualangan. Ketik kode langsung di browser, selesaikan tantangan berhadiah XP!",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#58cc02",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${fredoka.variable} ${nunito.variable}`}>
      <body className="dotted-bg min-h-screen antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
