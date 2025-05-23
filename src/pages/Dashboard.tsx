import React from "react";
import { Outlet, Navigate } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { useAuth } from "@/hooks/auth";
import { GradientBlur } from "@/components/decorations/GradientBlur";
import { FloatingDots } from "@/components/decorations/FloatingDots";

const Dashboard = () => {
  const { session, user } = useAuth();

  if (!session || !user) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-950 to-gray-900 overflow-hidden relative">
      <FloatingDots />
      <GradientBlur position="top-right" color="green" className="translate-x-1/4 -translate-y-1/4" />
      <GradientBlur position="bottom-left" color="emerald" className="-translate-x-1/4 translate-y-1/4" />
      
      <SidebarProvider>
        <div className="flex w-full flex-1 relative z-10">
          <DashboardSidebar />
          <div className="flex-1 flex flex-col min-h-screen">
            <DashboardHeader />
            <main className="flex-1 p-4 md:p-6 overflow-auto">
              <Outlet />
            </main>
          </div>
        </div>
      </SidebarProvider>
    </div>
  );
};

export default Dashboard;
