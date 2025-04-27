"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";
import { editUser } from "@/lib/actions/users";
import { EditUserSchema } from "@/types";

type EditUserFormProps = {
  userId: number;
  user: {
    id: number;
    name: string;
    email: string;
    image_url: string;
    user_id: string;
  };
};

export default function EditUserForm({ userId, user }: EditUserFormProps) {
  const [formData, setFormData] = useState({
    user_id: user.user_id,
    name: user.name,
    email: user.email,
    image_url: user.image_url,
  });

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const validation = EditUserSchema.safeParse(formData);

    if (!validation.success) {
      setError(validation.error.errors[0].message);
      return;
    }

    try {
      const { error, success } = await editUser(userId, formData);
      if (error) {
        setError(error);
        return;
      }
      if (success) {
        setSuccess("User updated successfully!");
        setFormData({
          user_id: "",
          name: "",
          email: "",
          image_url: "",
        });
        router.refresh();
        return;
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred.");
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-4">
      <h2 className="text-2xl font-bold">Edit User</h2>

      <input
        type="text"
        name="user_id"
        placeholder="User ID (supervisors only)"
        value={formData.user_id}
        onChange={handleChange}
        className="w-full p-2 border rounded"
      />

      <input
        type="text"
        name="name"
        placeholder="Name"
        value={formData.name}
        onChange={handleChange}
        className="w-full p-2 border rounded"
      />

      <input
        type="email"
        name="email"
        placeholder="Email"
        value={formData.email}
        onChange={handleChange}
        className="w-full p-2 border rounded"
      />

      <input
        type="text"
        name="image_url"
        placeholder="Image URL"
        value={formData.image_url}
        onChange={handleChange}
        className="w-full p-2 border rounded"
      />

      {error && <p className="text-red-500">{error}</p>}
      {success && <p className="text-green-500">{success}</p>}

      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
      >
        Update User
      </button>
    </form>
  );
}
