import { getOrganizationDetails } from "@/lib/actions/organization";
import OrganizationForm from "../../_components/admin/organization-form";

export default async function Home() {
  // You could fetch initial data from your API here
  const organizationData = await getOrganizationDetails();

  const { error, ...organization } = organizationData;

  if (error) {
    return <p>{error}</p>;
  }

  const { id, name, description } = organization;

  if (!id || !name || !description) {
    return <p>Failed to fetch organization details.</p>;
  }

  return (
    <main className="container py-10">
      <OrganizationForm
        initialData={{
          id,
          name,
          description,
        }}
      />
    </main>
  );
}
