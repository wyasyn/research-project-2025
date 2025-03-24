import { DashboardHeader } from "../../_components/dashboard-header";
import { RecentActivityTable } from "./recent-activity";
import SupervisorStats from "./supervisor-stats";

export default function OverviewSupervisor() {
  return (
    <section>
      <DashboardHeader
        heading="Dashboard"
        text="Welcome to your supervisor dashboard."
      />
      <SupervisorStats />
      <RecentActivityTable />
    </section>
  );
}
