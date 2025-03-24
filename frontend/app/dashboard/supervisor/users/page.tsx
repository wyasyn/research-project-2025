import React from "react";
import { UserManagement } from "../_components/users/user-management";
import { DashboardHeader } from "../../_components/dashboard-header";

export default function page() {
  return (
    <main>
      <DashboardHeader
        heading="User Management"
        text="Manage users and their roles."
      />
      <UserManagement />
    </main>
  );
}
