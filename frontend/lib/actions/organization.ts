"use server";

import { cache } from "react";

import { cookies } from "next/headers";

const serverApi = process.env.NEXT_PUBLIC_BACKEND_URL;

interface Organization {
  id: number;
  name: string;
  description: string;
}

export const getOrganizationDetails = cache(async () => {
  try {
    const cookieStore = await cookies();
    const tokenObj = cookieStore.get("token");
    const response = await fetch(`${serverApi}/organizations/details`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${tokenObj?.value}`,
      },
      credentials: "include",
    });
    if (!response.ok) {
      return { error: `Failed to fetch supervisors: ${response.statusText}` };
    }
    const data = await response.json();

    const { id, name, description }: Organization = data.organization;

    return {
      id,
      name,
      description,
    };
  } catch (error) {
    console.error(error);
    if (error instanceof Error) {
      return { error: error.message };
    } else {
      return { error: String(error) };
    }
  }
});
