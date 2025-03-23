"use server";

import { cache } from "react";

import { cookies } from "next/headers";

const serverApi = process.env.NEXT_PUBLIC_BACKEND_URL;

interface Supervisor {
  id: number;
  name: string;
  user_id: string;
  email: string;
  image_url: string;
}

export const getSupervisors = cache(async () => {
  try {
    const cookieStore = await cookies();
    const tokenObj = cookieStore.get("token");
    const response = await fetch(`${serverApi}/users/supervisors`, {
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
    const supervisors: Supervisor[] = data.supervisors;
    return supervisors;
  } catch (error) {
    console.error(error);
    if (error instanceof Error) {
      return { error: error.message };
    } else {
      return { error: String(error) };
    }
  }
});

export const getUsers = cache(async () => {
  try {
    const cookieStore = await cookies();
    const tokenObj = cookieStore.get("token");
    const response = await fetch(`${serverApi}/users/staff`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${tokenObj?.value}`,
      },
      credentials: "include",
    });
    if (!response.ok) {
      return { error: `Failed to fetch users: ${response.statusText}` };
    }
    const data = await response.json();

    const users: Supervisor[] = data.staff;
    return users;
  } catch (error) {
    console.error(error);
    if (error instanceof Error) {
      return { error: error.message };
    } else {
      return { error: String(error) };
    }
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
      return { error: `Failed to fetch users: ${response.statusText}` };
    }
    const data = await response.json();

    if (data.error) {
      return { error: data.error };
    }

    const {
      num_supervisors,
      num_staff,
      num_logs,
    }: { num_supervisors: number; num_staff: number; num_logs: number } = data;
    return { num_supervisors, num_staff, num_logs };
  } catch (error) {
    console.error(error);
    if (error instanceof Error) {
      return { error: error.message };
    } else {
      return { error: String(error) };
    }
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

    const users: Supervisor[] = data.results;
    return users;
  } catch (error) {
    console.error(error);
    if (error instanceof Error) {
      return { error: error.message };
    } else {
      return { error: String(error) };
    }
  }
});
