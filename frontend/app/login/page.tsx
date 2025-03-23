import { LoginForm } from "@/components/login-form";
import { images } from "@/assets/images/images";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { verifyToken } from "@/lib/actions/auth";
import { redirect } from "next/navigation";

export default async function LoginPage() {
  const { userId } = await verifyToken();
  if (userId) {
    redirect("/dashboard");
  }
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <Button variant="ghost" size={"icon"} asChild>
            <Link href="/">
              <Image src={images.logo.src} alt="Logo" width={32} height={32} />
            </Link>
          </Button>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <LoginForm />
          </div>
        </div>
      </div>
      <div className="bg-muted relative hidden lg:block">
        <Image
          src={images.loginImage.src}
          alt="Image"
          className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
          fill
          placeholder="blur"
          blurDataURL={images.loginImage.blurDataURL}
        />
      </div>
    </div>
  );
}
