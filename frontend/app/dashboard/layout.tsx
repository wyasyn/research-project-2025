import DashboardNav from "@/components/dashboard-nav";
import DashboardWrapper from "@/components/dashboard-wrapper";
import DashboardHomeHeader from "@/components/DashboardHomeHeader";
import { verifyToken } from "@/lib/actions/auth";
import { SidebarProvider } from "@/providers/sidebar-provider";
import { redirect } from "next/navigation";
import React from "react";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { error, role, userId } = await verifyToken();
  if (error) {
    return <div>{error}</div>;
  }
  if (role && userId) {
    return (
      <SidebarProvider>
        <DashboardWrapper>
          <DashboardHomeHeader />
          <DashboardNav />
          <main>{children}</main>
        </DashboardWrapper>
      </SidebarProvider>
    );
  }
  redirect("/login");
}
