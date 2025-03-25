"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";

const serverApi = process.env.NEXT_PUBLIC_BACKEND_URL;

export async function login({
  email,
  password,
}: {
  email: string;
  password: string;
}) {
  try {
    const cookieStore = await cookies();
    const response = await fetch(`${serverApi}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      return { error: `Login failed: ${response.statusText}` };
    }

    const data = await response.json();
    const { access_token, message, error } = data;

    if (error) {
      return { error };
    }

    if (!access_token) {
      return { error: "Login failed: No access token received" };
    }

    if (message) {
      console.log(message);
    }

    cookieStore.set({
      name: "token",
      value: access_token,
      expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), // 7 days
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
    });
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Login error:", error);
    return { error: "An unexpected error occurred during login." };
  }
}

export async function logout() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete("token");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Logout error:", error);
    return { error: "An unexpected error occurred during logout." };
  }
}

export const verifyToken = cache(async () => {
  try {
    const cookieStore = await cookies();
    const tokenObj = cookieStore.get("token");

    if (!tokenObj) {
      redirect("/login");
    }

    const response = await fetch(
      `${serverApi}/auth/token-verify`,
      // include credentials in the request
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${tokenObj.value}`,
        },
        method: "GET",
        credentials: "include",
      }
    );

    if (!response.ok) {
      if (response.status === 401) {
        cookieStore.delete("token");
        redirect("/login");
      }
      return { error: `Token verification failed: ${response.statusText}` };
    }

    const data = await response.json();

    interface UserData {
      user_id: string;
      role: "admin" | "supervisor" | "user";
      message: string;
      error: string;
    }

    const { user_id, role, message, error }: UserData = data;

    if (error) {
      return { error };
    }

    if (message) {
      console.log(message);
    }
    return { userId: user_id, role };
  } catch (error) {
    console.error("Token verification error:", error);
    return { error: "An unexpected error occurred during token verification" };
  }
});

export const getUserData = cache(async () => {
  try {
    const cookieStore = await cookies();
    const tokenObj = cookieStore.get("token");

    if (!tokenObj) {
      redirect("/login");
    }

    const response = await fetch(`${serverApi}/users/details`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${tokenObj.value}`,
      },
      method: "GET",
      credentials: "include",
    });

    if (!response.ok) {
      if (response.status === 401) {
        cookieStore.delete("token");
        redirect("/login");
      }
      return { error: `User data fetch failed: ${response.statusText}` };
    }

    const data = await response.json();

    const { user_id, name, email, image_url, role, error } = data;

    if (error) {
      return { error };
    }

    const user = { userId: user_id, name, email, imageUrl: image_url, role };
    return { user };
  } catch (error) {
    console.error("User data fetch error:", error);
    return { error: "An unexpected error occurred during user data fetch" };
  }
});
