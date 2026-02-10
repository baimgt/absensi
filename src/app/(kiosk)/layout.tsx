export default function KioskLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className="min-h-screen bg-black">
        {children}
      </body>
    </html>
  );
}
