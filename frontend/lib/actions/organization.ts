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

export const updateOrganization = async ({
  id,
  name,
  description,
}: {
  id: number;
  name: string;
  description: string;
}) => {
  try {
    const cookieStore = await cookies();
    const tokenObj = cookieStore.get("token");
    const response = await fetch(`${serverApi}/organizations/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${tokenObj?.value}`,
      },
      body: JSON.stringify({
        id,
        name,
        description,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      return {
        error: `Failed to update organization: ${
          data?.error || response.statusText || `Status ${response.status}`
        }`,
      };
    }

    const organization = data.organization;
    return {
      id: organization.id,
      name: organization.name,
      description: organization.description,
    };
  } catch (error) {
    console.log(error);
    return { error: error instanceof Error ? error.message : String(error) };
  }
};
