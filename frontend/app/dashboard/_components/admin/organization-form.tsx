"use client";

import type React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { updateOrganization } from "@/lib/actions/organization";

const serverApi = process.env.NEXT_PUBLIC_BACKEND_URL;
if (!serverApi) {
  throw new Error("Backend API URL is not defined.");
}

interface OrganizationFormProps {
  initialData?: {
    id: number;
    name: string;
    description: string;
  };
}

export default function OrganizationForm({
  initialData = {
    id: 0,
    name: "",
    description: "",
  },
}: OrganizationFormProps) {
  const [formData, setFormData] = useState(initialData);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error, id, name, description } = await updateOrganization(
        formData
      );

      if (error) {
        toast.error(error);
        return;
      }

      if (!id || !name || !description) {
        toast.error("Failed to update organization details");
        return;
      }

      setFormData({
        id: id,
        name: name,
        description: description,
      });
      toast.success("Organization details updated successfully");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to update organization details"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setFormData(initialData);
  };

  return (
    <Card className="w-full max-w-[400px] mx-auto">
      <CardHeader>
        <CardTitle>Organization Details</CardTitle>
        <CardDescription>
          Update your organization&apos;s information
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Organization Name</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter organization name"
              required
              disabled={isSubmitting}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter organization description"
              rows={5}
              disabled={isSubmitting}
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-end mt-8 space-x-2">
          <Button
            variant="outline"
            type="button"
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
