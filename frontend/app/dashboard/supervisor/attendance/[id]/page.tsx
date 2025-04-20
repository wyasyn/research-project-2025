import { redirect } from "next/navigation";
import { BackButton } from "@/components/back-button";
import { AttendanceManagement } from "@/components/attendance-management";
import { getSessionDetails } from "../../_components/attendance";

type Params = Promise<{ id: string }>;

export default async function SessionPage(props: { params: Params }) {
  const params = await props.params;

  const sessionId = parseInt(params.id);

  if (!sessionId) {
    redirect("/dashboard/supervisor/attendance");
  }

  const { session } = await getSessionDetails(sessionId);

  if (!session) {
    redirect("/dashboard/supervisor/attendance");
  }

  return (
    <main className="container mx-auto py-8 px-4">
      <div className="flex items-center mb-8">
        <BackButton />
        <h1 className="text-3xl font-bold ml-4">
          Session: {session.title || `#${session.id}`}
        </h1>
      </div>

      <AttendanceManagement sessionId={sessionId} />
    </main>
  );
}
