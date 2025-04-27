/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState, useEffect, FormEvent } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ImageUpload } from "./image-upload";
import { useRouter } from "next/navigation";

// Zod schema now requires image_url too
const registerSchema = z.object({
  user_id: z.string().min(1, "User ID is required."),
  name: z.string().min(1, "Full Name is required."),
  email: z.string().email("Invalid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
  organization_id: z
    .string()
    .min(1, "Organization must be selected.")
    .transform(Number),
  image_url: z.string().min(1, "Image is required").url("Invalid image URL."),
});

interface Organization {
  id: number;
  name: string;
}

const serverApi = process.env.NEXT_PUBLIC_BACKEND_URL!;

// === Part 1: User Details Step ===
interface UserDetailsStepProps {
  form: Record<string, string>;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  orgs: Organization[];
  onSelect: (val: string) => void;
  errors: Record<string, string>;
}

function UserDetailsStep({
  form,
  onChange,
  orgs,
  onSelect,
  errors,
}: UserDetailsStepProps) {
  return (
    <>
      {["user_id", "name", "email", "password"].map((field) => (
        <div key={field}>
          <Label htmlFor={field}>{field.replace("_", " ").toUpperCase()}</Label>
          <Input
            id={field}
            name={field}
            type={
              field === "email"
                ? "email"
                : field === "password"
                ? "password"
                : "text"
            }
            value={form[field]}
            onChange={onChange}
          />
          {errors[field] && (
            <p className="text-red-600 text-sm">{errors[field]}</p>
          )}
        </div>
      ))}
      <div>
        <Label htmlFor="organization">Organization</Label>
        <Select onValueChange={onSelect}>
          <SelectTrigger id="organization" className="mb-2">
            <SelectValue placeholder="Select organization" />
          </SelectTrigger>
          <SelectContent>
            {orgs.map((o) => (
              <SelectItem key={o.id} value={o.id.toString()}>
                {o.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.organization_id && (
          <p className="text-red-600 text-sm">{errors.organization_id}</p>
        )}
      </div>
    </>
  );
}

// === Part 2: Image Upload Step ===
interface ImageStepProps {
  onImage: (url: string) => void;
  errors: Record<string, string>;
}
function ImageStep({ onImage, errors }: ImageStepProps) {
  return (
    <>
      <Label>Profile Image</Label>
      <ImageUpload onSubmit={onImage} />
      {errors.image_url && (
        <p className="text-red-600 text-sm">{errors.image_url}</p>
      )}
    </>
  );
}

// === Part 3: Review Step ===
interface ReviewStepProps {
  form: Record<string, string>;
  orgs: Organization[];
}
function ReviewStep({ form, orgs }: ReviewStepProps) {
  const org = orgs.find((o) => o.id.toString() === form.organization_id);
  return (
    <>
      <div className="space-y-2">
        <Label>User ID</Label>
        <p className="mt-1">{form.user_id}</p>
        <Label>Full Name</Label>
        <p className="mt-1">{form.name}</p>
        <Label>Email</Label>
        <p className="mt-1">{form.email}</p>
        <Label>Organization</Label>
        <p className="mt-1">{org?.name}</p>
        <Label>Profile Image</Label>
        <img
          src={form.image_url}
          alt="Profile"
          className="w-24 h-24 rounded-full mt-2 object-cover"
        />
      </div>
    </>
  );
}

export default function RegisterForm() {
  const [step, setStep] = useState(1);
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [form, setForm] = useState<Record<string, string>>({
    user_id: "",
    name: "",
    email: "",
    password: "",
    organization_id: "",
    image_url: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const router = useRouter();

  useEffect(() => {
    fetch(`${serverApi}/organizations/`)
      .then((r) => r.json())
      .then((d) => setOrgs(d.organizations));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  const handleSelect = (val: string) =>
    setForm({ ...form, organization_id: val });
  const handleImage = (url: string) => {
    setForm({ ...form, image_url: url });
    setStep(3); // skip to review
  };

  const handleNext = () => setStep((s) => Math.min(s + 1, 3));
  const handleBack = () => setStep((s) => Math.max(s - 1, 1));

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const result = registerSchema.safeParse(form);

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        fieldErrors[issue.path[0] as string] = issue.message;
      });
      setErrors(fieldErrors);
      // if we're not on the review step, jump there to show error
      setStep(3);
      return;
    }
    // all fields valid
    setErrors({});
    const valid = result.data;
    const response = await fetch(`${serverApi}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(valid),
    });
    if (response.status === 409) {
      setErrors({ form: "User ID or email already exists" });
      return;
    }
    if (response.status === 422) {
      const data = await response.json();
      setErrors({ form: data.message || "Invalid data" });
      return;
    }

    if (response.ok) router.push("/login");
    else {
      const data = await response.json();
      setErrors({ form: data.message || "Registration failed" });
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 max-w-md mx-auto p-4 rounded-lg shadow-md w-full"
    >
      <p className="text-lg font-semibold text-sky-400">
        Step {step}:{" "}
        {step === 1
          ? "User Details"
          : step === 2
          ? "Upload Image"
          : "Review & Submit"}
      </p>
      {step === 1 && (
        <UserDetailsStep
          form={form}
          onChange={handleChange}
          orgs={orgs}
          onSelect={handleSelect}
          errors={errors}
        />
      )}
      {step === 2 && <ImageStep onImage={handleImage} errors={errors} />}
      {step === 3 && <ReviewStep form={form} orgs={orgs} />}

      <div className="flex justify-between">
        {step > 1 && (
          <Button type="button" variant="outline" onClick={handleBack}>
            Back
          </Button>
        )}
        {step < 3 && (
          <Button type="button" onClick={handleNext}>
            Next
          </Button>
        )}
        {step === 3 && (
          <button
            type="submit"
            className="bg-emerald-500 text-white px-6 py-2 rounded-2xl hover:bg-emerald-600 transition"
          >
            Submit
          </button>
        )}
      </div>
      {errors.form && <p className="text-red-600">{errors.form}</p>}
    </form>
  );
}
