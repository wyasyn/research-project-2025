import EditUserForm from "@/components/EditUserForm";

type SearchParams = Promise<{ id: string }>;
export default async function SettingsPage(props: {
  searchParams: SearchParams;
}) {
  const searchParams = await props.searchParams;

  const id = searchParams.id;
  return (
    <div className="p-8">
      <EditUserForm userId={parseInt(id)} />
    </div>
  );
}
