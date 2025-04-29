"use server";
import { cache } from "react";
import { cookies } from "next/headers";

const serverApi = process.env.BACKEND_URL;
if (!serverApi) {
  throw new Error("Backend API URL is not defined.");
}

interface User {
  id: number;
  user_id: string;
  name: string;
  email: string;
  image_url: string;
  role: "admin" | "supervisor" | "user";
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

export const getUsers = cache(
  async (role?: "supervisor" | "user"): Promise<UserResponse> => {
    try {
      const cookieStore = await cookies();
      const tokenObj = cookieStore.get("token");

      if (!tokenObj?.value) {
        return { error: "Authentication token is missing." };
      }

      // Construct URL dynamically to avoid role=undefined issue
      const url = new URL(`${serverApi}/users`);
      if (role) {
        url.searchParams.append("role", role);
      }

      const response = await fetch(url.toString(), {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${tokenObj.value}`,
        },
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
          error: `Failed to fetch users: ${
            data?.error || response.statusText || `Status ${response.status}`
          }`,
        };
      }

      return {
        users: data.users,
        organizationId: data.organization_id,
      };
    } catch (error) {
      console.error(error);
      return { error: error instanceof Error ? error.message : String(error) };
    }
  }
);

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

export const getUser = async () => {
  try {
    const cookieStore = await cookies();
    const tokenObj = cookieStore.get("token");

    if (!tokenObj?.value) {
      return { error: "Authentication token is missing." };
    }

    const response = await fetch(`${serverApi}/users/details`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${tokenObj?.value}`,
      },
      credentials: "include",
    });

    if (!response.ok) {
      return { error: `Failed to fetch user: ${response.statusText}` };
    }

    const data = await response.json();

    if (data.error) {
      return { error: data.error };
    }
    const user = data.user as {
      id: number;
      user_id: string;
      name: string;
      email: string;
      image_url: string;
      role: "admin" | "supervisor" | "user";
    };
    return { user: user };
  } catch (error) {
    console.error(error);
    return { error: error instanceof Error ? error.message : String(error) };
  }
};

export const deleteUser = async (id: number) => {
  try {
    const cookieStore = await cookies();
    const tokenObj = cookieStore.get("token");

    if (!tokenObj?.value) {
      return { error: "Authentication token is missing." };
    }

    const response = await fetch(`${serverApi}/users/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${tokenObj?.value}`,
      },
      credentials: "include",
    });

    if (!response.ok) {
      return { error: `Failed to delete user: ${response.statusText}` };
    }

    const data = await response.json();

    if (data.error) {
      return { error: data.error };
    }

    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: error instanceof Error ? error.message : String(error) };
  }
};

export const editUser = async (
  userId: number,
  formData: {
    user_id?: string;
    name?: string;
    email?: string;
    image_url?: string;
  }
) => {
  try {
    const cookieStore = await cookies();
    const tokenObj = cookieStore.get("token");

    if (!tokenObj?.value) {
      return { error: "Authentication token is missing." };
    }

    const response = await fetch(`${serverApi}/users/edit/${userId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${tokenObj?.value}`,
      },
      body: JSON.stringify(formData),
    });

    if (!response.ok) {
      return { error: `Failed to edit user: ${response.statusText}` };
    }

    const data = await response.json();

    if (data.error) {
      return { error: data.error };
    }

    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: error instanceof Error ? error.message : String(error) };
  }
};
