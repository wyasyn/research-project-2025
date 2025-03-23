"use client";

import { Card, CardContent } from "@/components/ui/card";
import { useState } from "react";
import { toast } from "sonner";
import AdminSteps from "./AdminSteps";
import AddUserFormPartOne from "./add-user";
import { ImageUpload } from "@/components/image-upload";
import { useRouter } from "next/navigation";

export type User = {
  name: string;
  email: string;
  user_id: string;
  organization_id: number;
  role: "supervisor" | "user";
  image_url?: string;
  password: string;
};

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

export default function AddUserForm({
  organization_id,
  role,
}: {
  organization_id: number;
  role: "supervisor" | "user";
}) {
  const [step, setStep] = useState(1);
  const [user, setUser] = useState<User | null>(null);
  const [complete, setComplete] = useState(false);
  const router = useRouter();

  const handleUserSubmit = (
    data: Omit<User, "organization_id" | "role" | "image_url">
  ) => {
    if (!organization_id) return;
    setUser({
      ...data,
      organization_id: organization_id,
      role: role,
      image_url: "",
    });
    setStep(2);
  };

  const handleImageSubmit = async (imageUrl: string) => {
    if (!user || !organization_id) return;

    try {
      // Update user with image URL
      const updatedUser = { ...user, image_url: imageUrl };

      // Send user data to API
      const response = await fetch(`${backendUrl}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedUser),
      });

      if (!response.ok) {
        toast.error("Failed to create admin");
        return;
      }

      setUser(updatedUser);
      setComplete(true);
      router.refresh();
      setStep(3);
    } catch (error) {
      console.error("Error creating admin:", error);
      toast.error("Failed to create admin");
    }
  };
  return (
    <div className="space-y-8 p-8 mx-auto">
      <AdminSteps currentStep={step} />
      <Card className="border-none">
        <CardContent className="pt-6">
          {step === 1 && <AddUserFormPartOne onSubmit={handleUserSubmit} />}

          {step === 2 && <ImageUpload onSubmit={handleImageSubmit} />}

          {complete && (
            <p className="p-10 rounded-lg bg-primary/15 text-primary border-primary text-lg font-bold text-center">
              Registration Complete
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
