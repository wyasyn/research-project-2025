import { getSupervisors } from "@/lib/actions/users";
import UserView from "../user-view";

export default async function SupervisorsList() {
  const result = await getSupervisors();
  if ("error" in result) {
    return <p>An error occurred getting data</p>;
  }
  const supervisors = result;

  if (supervisors.length === 0) {
    return <p>No supervisors found. Please add some in the admin panel.</p>;
  }

  return (
    <div className="p-3 space-y-3">
      {supervisors.map((supervisor) => (
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
