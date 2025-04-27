import EditUserForm from "@/components/EditUserForm";
import { getUser } from "@/lib/actions/users";
import { redirect } from "next/navigation";

type SearchParams = Promise<{ id: string }>;
export default async function SettingsPage(props: {
  searchParams: SearchParams;
}) {
  const searchParams = await props.searchParams;

  const id = searchParams.id;
  const { user } = await getUser();
  if (parseInt(id) !== user?.id) {
    redirect("/");
  }
  if (!user) {
    redirect("/login");
  }
  return (
    <div className="p-8">
      <EditUserForm user={user} userId={parseInt(id)} />
    </div>
  );
}
