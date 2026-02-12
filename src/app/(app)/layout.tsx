import Sidebar from "@/components/layout/Sidebar";
import PageTransition from "@/components/ui/PageTransition";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-app">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
          
          {/* Sidebar */}
          <aside className="lg:sticky lg:top-6 lg:w-[280px] shrink-0">
            <Sidebar />
          </aside>

          {/* Main content */}
          <main className="flex-1">
            <div className="rounded-[28px] bg-[#eef3ff]/80 p-5 sm:p-7 shadow-sm ring-1 ring-black/5 backdrop-blur">
              <PageTransition>{children}</PageTransition>
            </div>
          </main>

        </div>
      </div>
    </div>
  );
}
