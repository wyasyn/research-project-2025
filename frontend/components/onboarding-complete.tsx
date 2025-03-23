/* eslint-disable @next/next/no-img-element */
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Organization, Admin } from "@/components/onboarding-flow";
import Link from "next/link";

interface OnboardingCompleteProps {
  organization: Organization | null;
  admin: Admin | null;
}

export function OnboardingComplete({
  organization,
  admin,
}: OnboardingCompleteProps) {
  return (
    <div className="flex flex-col items-center justify-center space-y-6 py-8 text-center">
      <div className="rounded-full bg-primary/10 p-3">
        <CheckCircle className="h-12 w-12 text-primary" />
      </div>

      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Setup Complete!</h2>
        <p className="text-muted-foreground">
          Your organization has been created successfully.
        </p>
      </div>

      <div className="w-full max-w-md rounded-lg bg-muted p-4 text-left">
        <div className="space-y-4">
          <div>
            <h3 className="font-medium">Organization Details</h3>
            <p className="text-sm text-muted-foreground">
              Name: {organization?.name}
            </p>
            <p className="text-sm text-muted-foreground">
              ID: {organization?.id}
            </p>
          </div>

          <div>
            <h3 className="font-medium mb-3">Admin Account</h3>
            <div className="flex items-center gap-3">
              {admin?.image_url && (
                <div className="h-10 w-10 overflow-hidden rounded-full">
                  <img
                    src={admin.image_url || "/placeholder.svg"}
                    alt={admin.name}
                    className="h-full w-full object-cover"
                  />
                </div>
              )}
              <div>
                <p className="text-sm font-medium">{admin?.name}</p>
                <p className="text-xs text-muted-foreground">{admin?.email}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Button className="w-full max-w-md" asChild>
        <Link href={"/dashboard"}>Go to Dashboard</Link>
      </Button>
    </div>
  );
}
