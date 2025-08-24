export const metadata = {
  title: "Razkazvach",
  description: "Lightning-fast kids stories (BG)",
  manifest: "/manifest.webmanifest",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="bg">
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
