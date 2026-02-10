// src/app/layout.tsx
import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="min-h-screen bg-[#e9efff] text-slate-900 antialiased">
        {children}
      </body>
    </html>
  );
}
