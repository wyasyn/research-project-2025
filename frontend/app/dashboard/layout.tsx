import DashboardNav from "@/components/dashboard-nav";
import DashboardWrapper from "@/components/dashboard-wrapper";
import DashboardHomeHeader from "@/components/DashboardHomeHeader";
import DashboardLoading from "@/components/DashboardLoading";
import { verifyToken } from "@/lib/actions/auth";
import { getSidebarLinks } from "@/lib/utils";
import { SidebarProvider } from "@/providers/sidebar-provider";
import { redirect } from "next/navigation";
import React, { Suspense } from "react";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { error, role, userId } = await verifyToken();

  if (error || !role || !userId) {
    redirect("/login");
  }

  const list = getSidebarLinks(role);
  if (!list) {
    redirect("/login");
  }

  return (
    <SidebarProvider>
      <DashboardWrapper>
        <Suspense fallback={<DashboardLoading />}>
          <DashboardHomeHeader />
          <DashboardNav list={list} />
          <main>{children}</main>
        </Suspense>
      </DashboardWrapper>
    </SidebarProvider>
  );
}
