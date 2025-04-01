import { getUsers } from "@/lib/actions/users";
import UserView from "../user-view";

export default async function SupervisorsList() {
  const { users, organizationId, error } = await getUsers("supervisor");
  if (error) {
    return <p>{error}</p>;
  }

  if (!users || !organizationId) {
    return <p>Failed to fetch supervisors data.</p>;
  }

  if (users.length === 0) {
    return <p>No supervisors found. Please add some in the admin panel.</p>;
  }

  return (
    <div className="p-3 grid sm:grid-cols-2 md:grid-cols-1 xl:grid-cols-2 gap-y-4 gap-x-8">
      {users.map((supervisor) => (
        <UserView
          key={supervisor.id}
          name={supervisor.name}
          email={supervisor.email}
          image_url={supervisor.image_url}
        />
      ))}
    </div>
  );
}
