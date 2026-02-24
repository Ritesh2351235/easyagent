import { Sidebar } from "@/components/layout/sidebar";
import { MobileTopBar } from "@/components/layout/mobile-top-bar";
import { SidebarProvider } from "@/components/layout/sidebar-context";
import { ToastProvider } from "@/components/ui/toast";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ToastProvider>
      <SidebarProvider>
        <div className="flex h-dvh">
          <Sidebar />
          <div className="flex flex-1 flex-col min-w-0">
            <MobileTopBar />
            <main className="flex-1 overflow-y-auto bg-bg p-4 md:p-6">
              {children}
            </main>
          </div>
        </div>
      </SidebarProvider>
    </ToastProvider>
  );
}
