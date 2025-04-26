import { DashboardHeader } from "../../_components/dashboard-header";
import { ReportsAnalytics } from "../_components/reports/reports-analytics";

export default function page() {
  return (
    <div className="pb-12">
      <DashboardHeader
        heading="Reports & Analytics"
        text="View attendance statistics and generate reports."
      />
      <ReportsAnalytics />
    </div>
  );
}
