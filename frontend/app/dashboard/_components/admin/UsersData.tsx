import { getUsers } from "@/lib/actions/users";
import UserView from "../user-view";
import { Modal } from "./model";
import AddUserForm from "./add-user-form";

export default async function UsersList() {
  const { users, organizationId, error } = await getUsers("user");

  if (error) {
    return <p>{error}</p>;
  }

  if (!users || !organizationId) {
    return <p>Failed to fetch user data.</p>;
  }

  if (users.length === 0) {
    return (
      <section className="flex flex-col items-center justify-center h-full p-4 space-y-3 text-center">
        <h2 className="text-lg font-semibold">No users found</h2>
        <p className="text-sm ">Add a new user to get started.</p>
        <Modal title="Add Supervisor">
          <AddUserForm role="user" organization_id={organizationId} />
        </Modal>
      </section>
    );
  }

  return (
    <section>
      <div>
        <Modal title="Add Supervisor">
          <AddUserForm role="user" organization_id={organizationId} />
        </Modal>
      </div>
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
    </section>
  );
}
