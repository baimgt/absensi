import Sidebar from "@/components/layout/Sidebar";
import PageTransition from "@/components/ui/PageTransition";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-app min-h-screen">
      <div className="mx-auto flex max-w-[1400px] gap-6 p-6">
        <Sidebar />

        <main className="flex-1">
          <div className="rounded-[28px] bg-[#eef3ff]/80 p-7 shadow-sm ring-1 ring-black/5 backdrop-blur">
            <PageTransition>{children}</PageTransition>
          </div>
        </main>
      </div>
    </div>
  );
}
