"use client";

import { useState } from "react";
import { OrganizationForm } from "@/components/organization-form";
import { AdminForm } from "@/components/admin-form";
import { ImageUpload } from "@/components/image-upload";
import { OnboardingComplete } from "@/components/onboarding-complete";
import { Card, CardContent } from "@/components/ui/card";
import { Steps } from "@/components/steps";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

export type Organization = {
  name: string;
  description: string;
  id?: number;
};

export type Admin = {
  name: string;
  email: string;
  user_id: string;
  organization_id: number;
  role: "admin";
  image_url?: string;
};

export default function OnboardingFlow() {
  const [step, setStep] = useState(1);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [complete, setComplete] = useState(false);

  const router = useRouter();

  const handleOrganizationSubmit = async (data: Organization) => {
    try {
      // Send organization data to API
      const response = await fetch(`${backendUrl}/organizations/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
        mode: "cors",
      });

      if (!response.ok) {
        toast.error("Failed to create organization");
        return;
      }

      const { message, organization, error } = await response.json();
      if (error) {
        toast.error(error);
        return;
      }
      if (message) {
        toast.success(message);
      }
      setOrganization({ ...data, id: organization.id });
      setStep(2);
    } catch (error) {
      console.error("Error creating organization:", error);
      toast.error("Failed to create organization");
    }
  };

  const handleAdminSubmit = (
    data: Omit<Admin, "organization_id" | "role" | "image_url">
  ) => {
    if (!organization?.id) return;

    setAdmin({
      ...data,
      organization_id: organization.id,
      role: "admin",
    });
    setStep(3);
  };

  const handleImageSubmit = async (imageUrl: string) => {
    if (!admin || !organization?.id) return;

    try {
      // Update admin with image URL
      const updatedAdmin = { ...admin, image_url: imageUrl };

      // Send admin data to API
      const response = await fetch(`${backendUrl}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedAdmin),
      });

      if (!response.ok) {
        toast.error("Failed to create admin");
        return;
      }

      setAdmin(updatedAdmin);
      setComplete(true);
      setStep(4);
      router.refresh();
    } catch (error) {
      console.error("Error creating admin:", error);
      toast.error("Failed to create admin");
    }
  };

  return (
    <div className="space-y-8 p-8 mx-auto">
      <Steps currentStep={step} />

      <Card className="border-none">
        <CardContent className="pt-6">
          {step === 1 && (
            <OrganizationForm onSubmit={handleOrganizationSubmit} />
          )}

          {step === 2 && <AdminForm onSubmit={handleAdminSubmit} />}

          {step === 3 && <ImageUpload onSubmit={handleImageSubmit} />}

          {complete && (
            <OnboardingComplete organization={organization} admin={admin} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
