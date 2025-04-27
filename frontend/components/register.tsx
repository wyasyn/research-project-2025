"use client";

import React, { useState, useEffect, FormEvent } from "react";
import { z, ZodError } from "zod";
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

// Zod schema for form validation, with organization_id as integer
const registerSchema = z.object({
  user_id: z.string().min(1, "User ID is required."),
  name: z.string().min(1, "Full Name is required."),
  email: z.string().email("Invalid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
  organization_id: z
    .string()
    .min(1, "Organization must be selected.")
    .transform((val) => Number(val)),
  image_url: z.preprocess((val) => {
    if (typeof val === "string" && val !== "") {
      return val;
    }
    return undefined;
  }, z.string().url("Invalid image URL.").optional()),
});

interface Organization {
  id: number;
  name: string;
}

const serverApi = process.env.NEXT_PUBLIC_BACKEND_URL;
if (!serverApi) {
  throw new Error("Backend API URL is not defined.");
}

export default function RegisterForm() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [form, setForm] = useState({
    user_id: "",
    name: "",
    email: "",
    password: "",
    organization_id: "",
    image_url: "",
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  useEffect(() => {
    async function loadOrgs() {
      try {
        const res = await fetch(`${serverApi}/organizations/`);
        const data = await res.json();
        setOrganizations(data.organizations);
      } catch (e) {
        console.error("Failed to load orgs", e);
      }
    }
    loadOrgs();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleOrgSelect = (value: string) => {
    setForm({ ...form, organization_id: value });
  };

  const handleImageSubmit = (url: string) => {
    setForm({ ...form, image_url: url });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setFieldErrors({});

    // Validate and coerce with Zod
    let validData;
    try {
      validData = registerSchema.parse(form);
    } catch (err) {
      if (err instanceof ZodError) {
        const errors: Record<string, string> = {};
        err.issues.forEach((issue) => {
          const field = issue.path[0] as string;
          if (!errors[field]) errors[field] = issue.message;
        });
        setFieldErrors(errors);
        setLoading(false);
        return;
      }
    }

    // Submit to backend, sending organization_id as integer
    try {
      const res = await fetch(`${serverApi}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validData),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Registration failed");
      }
      setSuccess(true);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="p-6 rounded-xl">
        <h2 className="text-2xl font-semibold mb-4">
          Registration Successful!
        </h2>
        <p>You can now log in with your new credentials.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-6">
      <div>
        <Label htmlFor="user_id">User ID</Label>
        <Input
          id="user_id"
          name="user_id"
          value={form.user_id}
          onChange={handleChange}
          required
        />
        {fieldErrors.user_id && (
          <p className="text-red-600 text-sm">{fieldErrors.user_id}</p>
        )}
      </div>

      <div>
        <Label htmlFor="name">Full Name</Label>
        <Input
          id="name"
          name="name"
          value={form.name}
          onChange={handleChange}
          required
        />
        {fieldErrors.name && (
          <p className="text-red-600 text-sm">{fieldErrors.name}</p>
        )}
      </div>

      <div>
        <Label htmlFor="email">Email Address</Label>
        <Input
          id="email"
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          required
        />
        {fieldErrors.email && (
          <p className="text-red-600 text-sm">{fieldErrors.email}</p>
        )}
      </div>

      <div>
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          name="password"
          value={form.password}
          onChange={handleChange}
          required
        />
        {fieldErrors.password && (
          <p className="text-red-600 text-sm">{fieldErrors.password}</p>
        )}
      </div>

      <div>
        <Label htmlFor="organization">Organization</Label>
        <Select onValueChange={handleOrgSelect}>
          <SelectTrigger id="organization" className="w-full">
            <SelectValue placeholder="Select organization" />
          </SelectTrigger>
          <SelectContent>
            {organizations.map((org) => (
              <SelectItem key={org.id} value={org.id.toString()}>
                {org.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {fieldErrors.organization_id && (
          <p className="text-red-600 text-sm">{fieldErrors.organization_id}</p>
        )}
      </div>

      <div>
        <Label>Profile Image</Label>
        <ImageUpload onSubmit={handleImageSubmit} />
        {fieldErrors.image_url && (
          <p className="text-red-600 text-sm">{fieldErrors.image_url}</p>
        )}
      </div>

      {error && <p className="text-red-600">{error}</p>}

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Registering..." : "Register"}
      </Button>
    </form>
  );
}
