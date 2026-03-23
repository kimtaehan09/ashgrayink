
'use client';

import AdminSidebar from "@/components/admin/admin-sidebar";
import { Toaster } from "@/components/ui/toaster";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AuthProvider } from '@/contexts/auth-context';
import AuthGuard from '@/components/auth-guard';

function AdminLayoutComponent({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <AuthGuard>
        <SidebarProvider>
          <div className="flex min-h-screen bg-background">
            <AdminSidebar />
            <div className="flex flex-col flex-1">
              <header className="md:hidden flex items-center justify-between p-4 border-b">
                <span className="font-semibold text-lg">Admin Panel</span>
                <SidebarTrigger />
              </header>
              <main className="flex-1 p-4 md:p-6 lg:p-8">{children}</main>
            </div>
            <Toaster />
          </div>
        </SidebarProvider>
      </AuthGuard>
    </AuthProvider>
  );
}

export default AdminLayoutComponent;
