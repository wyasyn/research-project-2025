import { getUsers } from "@/lib/actions/users";
import UserView from "../user-view";

export default async function UsersList() {
  const result = await getUsers();

  if ("error" in result) {
    return <p>{result.error}</p>;
  }

  const users = result;

  if (users.length === 0) {
    return <p>No users found. Please add some in the admin panel.</p>;
  }

  return (
    <div className="p-3 space-y-3">
      {users.map((user) => (
        <UserView
          key={user.id}
          name={user.name}
          email={user.email}
          image_url={user.image_url}
        />
      ))}
    </div>
  );
}
