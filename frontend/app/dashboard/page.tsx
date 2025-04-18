import { verifyToken } from "@/lib/actions/auth";
import { getSidebarLinks } from "@/lib/utils";
import { redirect } from "next/navigation";

export default async function DashboardIndexPage() {
  const { error, role, userId } = await verifyToken();

  if (error || !role || !userId) {
    redirect("/login");
  }

  const list = getSidebarLinks(role);
  if (!list || !list[0]) {
    redirect("/login");
  }

  redirect(list[0].link);
}
