import { Binoculars, Logs, Users } from "lucide-react";
import AdminOverviewCard from "./overview-card";
import { getStats } from "@/lib/actions/users";

export default async function OverviewStats() {
  const { num_logs, num_staff, num_supervisors, error } = await getStats();

  if (error) {
    return <p>An error occurred getting data: {error}</p>;
  }

  return (
    <div className="grid max-[400px]:grid-cols-1 grid-cols-2  gap-4">
      {/* Add admin overview cards here */}

      <AdminOverviewCard
        icon={<Binoculars />}
        title="Supervisors"
        count={num_supervisors ?? 0}
      />
      <AdminOverviewCard
        icon={<Users />}
        title="Users"
        count={num_staff ?? 0}
      />
      <AdminOverviewCard icon={<Logs />} title="Logs" count={num_logs ?? 0} />
    </div>
  );
}
