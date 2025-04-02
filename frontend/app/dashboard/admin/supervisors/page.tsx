import { getUsers } from "@/lib/actions/users";
import SupervisorsTable from "./_component/supervisors-table";

export default async function page() {
  const { error, users, organizationId } = await getUsers("supervisor");
  if (error) {
    return <p>{error}</p>;
  }
  if (!users || !organizationId) {
    return <p>Failed to fetch supervisors data.</p>;
  }
  return (
    <SupervisorsTable supervisors={users} organizationId={organizationId} />
  );
}
