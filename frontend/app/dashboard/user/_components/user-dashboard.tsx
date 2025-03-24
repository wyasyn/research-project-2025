"use client";

import { useState } from "react";
import {
  Calendar,
  Home,
  LineChart,
  LogOut,
  Settings,
  User,
} from "lucide-react";

import { AttendanceRecords } from "@/components/attendance-records";
import { OverviewPanel } from "@/components/overview-panel";
import { PerformanceAnalysis } from "@/components/performance-analysis";
import { UserSettings } from "@/components/user-settings";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@/components/ui/sidebar";

export function UserDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <SidebarProvider>
      <div className="grid min-h-screen w-full md:grid-cols-[280px_1fr]">
        <Sidebar>
          <SidebarHeader className="flex h-14 items-center border-b px-6">
            <div className="flex items-center gap-2 font-semibold">
              <User className="h-6 w-6" />
              <span>User Dashboard</span>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={activeTab === "dashboard"}
                  onClick={() => setActiveTab("dashboard")}
                >
                  <Home className="h-4 w-4" />
                  <span>Dashboard</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={activeTab === "attendance"}
                  onClick={() => setActiveTab("attendance")}
                >
                  <Calendar className="h-4 w-4" />
                  <span>Attendance Records</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={activeTab === "performance"}
                  onClick={() => setActiveTab("performance")}
                >
                  <LineChart className="h-4 w-4" />
                  <span>Performance</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={activeTab === "settings"}
                  onClick={() => setActiveTab("settings")}
                >
                  <Settings className="h-4 w-4" />
                  <span>Settings</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter className="border-t p-4">
            <Button variant="outline" className="w-full justify-start gap-2">
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </SidebarFooter>
        </Sidebar>
        <div className="flex flex-col">
          <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background px-6">
            <div className="w-full">
              <h1 className="text-lg font-semibold">
                {activeTab === "dashboard" && "Dashboard Overview"}
                {activeTab === "attendance" && "Attendance Records"}
                {activeTab === "performance" && "Performance Analysis"}
                {activeTab === "settings" && "User Settings"}
              </h1>
            </div>
          </header>
          <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
            {activeTab === "dashboard" && <OverviewPanel />}
            {activeTab === "attendance" && <AttendanceRecords />}
            {activeTab === "performance" && <PerformanceAnalysis />}
            {activeTab === "settings" && <UserSettings />}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
