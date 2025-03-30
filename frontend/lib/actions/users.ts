"use server";

import { cache } from "react";
import { cookies } from "next/headers";

const serverApi = process.env.NEXT_PUBLIC_BACKEND_URL;
if (!serverApi) {
  throw new Error("Backend API URL is not defined.");
}

interface User {
  id: number;
  user_id: string;
  name: string;
  email: string;
  image_url: string;
}

interface UserResponse {
  users?: User[];
  organizationId?: number;
  error?: string;
}

interface UserResult {
  id: number;
  name: string;
  email: string;
  role: "admin" | "supervisor" | "user";
  image_url: string;
}

export const getSupervisors = cache(async (): Promise<UserResponse> => {
  try {
    const cookieStore = await cookies();
    const tokenObj = cookieStore.get("token");

    if (!tokenObj?.value) {
      return { error: "Authentication token is missing." };
    }

    const response = await fetch(`${serverApi}/users/supervisors`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${tokenObj?.value}`,
      },
      credentials: "include",
    });

    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      console.error("Non-JSON response received:", await response.text());
      return {
        error: `Unexpected response from server: ${response.status} ${response.statusText}`,
      };
    }

    const data = await response.json();
    if (!response.ok) {
      return {
        error: `Failed to fetch supervisors: ${
          data.error || response.statusText
        }`,
      };
    }

    return {
      users: data.supervisors,
      organizationId: data.organization_id,
      ...(data.error ? { error: data.error } : {}),
    };
  } catch (error) {
    console.error(error);
    return { error: error instanceof Error ? error.message : String(error) };
  }
});

export const getUsers = cache(async (): Promise<UserResponse> => {
  try {
    const cookieStore = await cookies();
    const tokenObj = cookieStore.get("token");

    if (!tokenObj?.value) {
      return { error: "Authentication token is missing." };
    }

    const response = await fetch(`${serverApi}/users/staff`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${tokenObj?.value}`,
      },
      credentials: "include",
    });

    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      console.error("Non-JSON response received:", await response.text());
      return {
        error: `Unexpected response from server: ${response.status} ${response.statusText}`,
      };
    }

    const data = await response.json();
    if (!response.ok) {
      return {
        error: `Failed to fetch users: ${data.error || response.statusText}`,
      };
    }

    return {
      users: data.users,
      organizationId: data.organization_id,
      ...(data.error ? { error: data.error } : {}),
    };
  } catch (error) {
    console.error(error);
    return { error: error instanceof Error ? error.message : String(error) };
  }
});

export const getStats = cache(async () => {
  try {
    const cookieStore = await cookies();
    const tokenObj = cookieStore.get("token");

    const response = await fetch(`${serverApi}/users/stats`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${tokenObj?.value}`,
      },
      credentials: "include",
    });

    if (!response.ok) {
      return { error: `Failed to fetch stats: ${response.statusText}` };
    }

    const data = await response.json();
    if (data.error) {
      return { error: data.error };
    }

    return {
      num_supervisors: data.num_supervisors,
      num_staff: data.num_staff,
      num_logs: data.num_logs,
    };
  } catch (error) {
    console.error(error);
    return { error: error instanceof Error ? error.message : String(error) };
  }
});

export const searchUser = cache(async (query: string) => {
  try {
    const cookieStore = await cookies();
    const tokenObj = cookieStore.get("token");

    const response = await fetch(`${serverApi}/users/search?query=${query}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${tokenObj?.value}`,
      },
      credentials: "include",
    });

    if (!response.ok) {
      return { error: `Failed to search users: ${response.statusText}` };
    }

    const data = await response.json();

    if (data.error) {
      return { error: data.error };
    }

    const users: UserResult[] = data.users;
    return { users: users };
  } catch (error) {
    console.error(error);
    return { error: error instanceof Error ? error.message : String(error) };
  }
});
