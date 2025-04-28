import { LoginForm } from "@/components/login-form";
import { verifyToken } from "@/lib/actions/auth";
import { redirect } from "next/navigation";

export default async function LoginPage() {
  const { userId } = await verifyToken();
  if (userId) {
    redirect("/dashboard");
  }
  return (
    <>
      <LoginForm />
    </>
  );
}
