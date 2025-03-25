import OrganizationForm from "../../_components/admin/organization-form";

export default function Home() {
  // You could fetch initial data from your API here
  const organizationData = {
    name: "Acme Inc",
    description: "A leading provider of innovative solutions",
  };

  return (
    <main className="container py-10">
      <OrganizationForm initialData={organizationData} />
    </main>
  );
}
