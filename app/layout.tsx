import type { Metadata } from "next";
import { getAppBaseUrl } from "@/lib/seo";
import "./globals.css";

const baseUrl = getAppBaseUrl();

export const metadata: Metadata = {
  title: "Разказвач",
  description:
    "Разказвач — уютни български приказки с аудио и интерактивни избори.",
  manifest: "/manifest.webmanifest",
  metadataBase: new URL(baseUrl),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="bg">
      <body className="min-h-dvh bg-white font-sans text-gray-900 antialiased">
        {children}
      </body>
    </html>
  );
}
