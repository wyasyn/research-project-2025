"use server";

import { revalidatePath } from "next/cache";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";

const serverApi = process.env.NEXT_PUBLIC_BACKEND_URL;

if (!serverApi) {
  throw new Error("Backend API URL is not defined.");
}

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
    const { access_token, refresh_token, message, error } = data;

    if (error) {
      return { error };
    }

    if (!access_token || !refresh_token) {
      return { error: "Login failed: Missing tokens" };
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

    cookieStore.set({
      name: "refresh_token",
      value: refresh_token,
      expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30), // 30 days
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

export async function refreshAccessToken() {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get("refresh_token");

    if (!refreshToken) {
      const headersList = await headers();
      const referer = headersList.get("referer") || "";
      if (!referer.includes("/login")) {
        redirect("/login");
      }
      return;
    }

    const response = await fetch(`${serverApi}/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${refreshToken.value}`,
      },
      credentials: "include",
    });

    if (!response.ok) {
      await deleteTokens();
    }

    const data = await response.json();
    const { access_token } = data;

    cookieStore.set({
      name: "token",
      value: access_token,
      expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
    });

    return access_token;
  } catch (error) {
    await deleteTokens();
    console.log(error);
  }
}

export const verifyToken = cache(async () => {
  try {
    const cookieStore = await cookies();
    let tokenObj = cookieStore.get("token");

    if (!tokenObj) {
      tokenObj = { name: "token", value: await refreshAccessToken() };
    }

    const response = await fetch(`${serverApi}/auth/verify`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${tokenObj.value}`,
      },
      method: "GET",
      credentials: "include",
    });

    if (!response.ok) {
      if (response.status === 401) {
        await deleteTokens();
      }
      return { error: `Token verification failed: ${response.statusText}` };
    }

    const result = await response.json();

    interface StatusMessage {
      status: "error" | "success";
    }

    interface DataProps {
      user_id: string;
      role: "admin" | "supervisor" | "user";
    }

    interface ApiResponse extends StatusMessage {
      data?: DataProps; // Optional because errors might not return `data`
      message: string;
    }

    const { status, data, message } = result as ApiResponse;

    if (status === "error") {
      return { error: message };
    }

    if (!data) {
      return { error: "Failed to retrieve user information" };
    }

    return {
      userId: data.user_id,
      role: data.role,
    };
  } catch (error) {
    console.error("Token verification error:", error);
    return { error: "An unexpected error occurred during token verification" };
  }
});

export const deleteTokens = async () => {
  try {
    const cookieStore = await cookies();

    if (cookieStore.has("token")) {
      cookieStore.delete("token");
    }

    if (cookieStore.has("refresh_token")) {
      cookieStore.delete("refresh_token");
    }

    const headersList = await headers();
    const referer = headersList.get("referer") || "";
    if (!referer.includes("/login")) {
      redirect("/login");
    }
    return;
  } catch (error) {
    console.log(error);
  }
};
