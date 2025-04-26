"use server";

import { cache } from "react";

import { cookies } from "next/headers";
import { SessionFormValues } from "@/types";
import { revalidatePath } from "next/cache";

import type {
  AttendanceSessionDetails,
  SessionAttendanceSummary,
  UserAttendanceSummary,
  WeeklyAttendanceResponse,
} from "@/types";

const serverApi = process.env.NEXT_PUBLIC_BACKEND_URL;

export interface LatestAttendanceRecord {
  user_id: number;
  name: string;
  email: string;
  image_url: string | null;
  session_title: string;
  timestamp: string;
  status: "scheduled" | "active" | "completed";
}

export interface AttendanceSession {
  id: number;
  title: string;
  date: string; // ISO format e.g., "2025-04-20"
  start_time: string; // ISO format e.g., "2025-04-20T09:00:00"
  duration_minutes: number;
  status: "scheduled" | "active" | "completed";
  attendees: number;
  location: string;
}

export interface PaginationMetadata {
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
}

interface GetAllSessionsResponse {
  sessions?: AttendanceSession[];
  pagination?: PaginationMetadata;
  error?: string;
}

export const getTotalSessions = cache(async () => {
  try {
    const cookieStore = await cookies();
    const tokenObj = cookieStore.get("token");
    const response = await fetch(`${serverApi}/attendance/total-sessions`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${tokenObj?.value}`,
      },
      credentials: "include",
    });

    if (!response.ok) {
      return {
        error: `Failed to fetch total sessions: ${response.statusText}`,
      };
    }

    const data = await response.json();

    const totalSessions: number = data.total_sessions;

    return {
      totalSessions,
    };
  } catch (error) {
    console.log(error);
    return { error: "Failed to get total sessions" };
  }
});

export const getLatestRecords = cache(async () => {
  try {
    const cookieStore = await cookies();
    const tokenObj = cookieStore.get("token");
    const response = await fetch(`${serverApi}/attendance/latest-records`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${tokenObj?.value}`,
      },
      credentials: "include",
    });

    if (!response.ok) {
      return {
        error: `Failed to fetch total sessions: ${response.statusText}`,
      };
    }

    const data: LatestAttendanceRecord[] = await response.json();
    return {
      latestRecords: data,
    };
  } catch (error) {
    console.log(error);
    return {
      error: "Failed to get latest records",
    };
  }
});

export const getAllSessions = cache(
  async (page = 1): Promise<GetAllSessionsResponse> => {
    try {
      const cookieStore = await cookies();
      const tokenObj = cookieStore.get("token");
      const response = await fetch(
        `${serverApi}/attendance/sessions?page=${page}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${tokenObj?.value}`,
          },
          credentials: "include",
        }
      );

      if (!response.ok) {
        return {
          error: `Failed to fetch total sessions: ${response.statusText}`,
        };
      }

      const data = await response.json();

      return {
        sessions: data.sessions,
        pagination: data.pagination,
      };
    } catch (error) {
      console.log(error);

      return {
        error: "Failed to get all sessions",
      };
    }
  }
);

export async function createSession(formData: SessionFormValues) {
  try {
    const cookieStore = await cookies();
    const tokenObj = cookieStore.get("token");

    if (!tokenObj) {
      return { success: false, error: "Authentication required" };
    }

    // Format the data for the API
    const apiData = {
      title: formData.title,
      description: formData.description || "",
      location: formData.location,
      start_time: new Date(
        `${formData.date.toISOString().split("T")[0]}T${formData.start_time}`
      ).toISOString(),
      duration_minutes: formData.duration_minutes,
      date: formData.date.toISOString().split("T")[0],
    };

    // Call the API
    const response = await fetch(`${serverApi}/attendance/sessions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${tokenObj?.value}`,
      },
      body: JSON.stringify(apiData),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.message || "Failed to create session",
      };
    }
    revalidatePath("/dashboard/supervisor/attendance");
    return {
      success: true,
      data: {
        id: data.session_id,
        ...formData,
      },
    };
  } catch (error) {
    console.error("Error creating session:", error);
    return {
      success: false,
      error: "An unexpected error occurred",
    };
  }
}

export async function markAttendance(userId: number, sessionId: number) {
  const cookieStore = await cookies();
  const tokenObj = cookieStore.get("token");

  if (!tokenObj) {
    return { success: false, error: "Authentication required" };
  }
  const response = await fetch(`${serverApi}/attendance/mark`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${tokenObj?.value}`,
    },
    body: JSON.stringify({
      user_id: userId,
      session_id: sessionId,
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    return {
      error: data.message || "Failed to mark attendance",
    };
  }

  return {
    message: data.message,
  };
}

export async function getSessionDetails(sessionId: number): Promise<{
  session?: AttendanceSessionDetails;
  error?: string;
}> {
  try {
    const cookieStore = await cookies();
    const tokenObj = cookieStore.get("token");

    const response = await fetch(
      `${serverApi}/attendance/sessions/${sessionId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${tokenObj?.value}`,
        },
        credentials: "include",
      }
    );

    if (!response.ok) {
      return {
        error: `Failed to fetch session: ${response.statusText}`,
      };
    }

    const data: AttendanceSessionDetails = await response.json();

    return {
      session: data,
    };
  } catch (error) {
    console.error("Error fetching session details:", error);
    return {
      error: "Failed to fetch session details",
    };
  }
}

export async function fetchUsersAttendanceSummary(): Promise<
  UserAttendanceSummary[]
> {
  const cookieStore = await cookies();
  const tokenObj = cookieStore.get("token");
  if (!tokenObj) {
    throw new Error("No auth token found — please log in.");
  }
  const res = await fetch(`${serverApi}/attendance/users/attendance-summary`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${tokenObj?.value}`,
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `HTTP ${res.status}`);
  }
  return res.json();
}

export async function fetchSessionsAttendanceSummary(): Promise<
  SessionAttendanceSummary[]
> {
  const cookieStore = await cookies();
  const tokenObj = cookieStore.get("token");
  if (!tokenObj) {
    throw new Error("No auth token found — please log in.");
  }
  const res = await fetch(`${serverApi}/attendance/sessions/summary`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${tokenObj?.value}`,
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `HTTP ${res.status}`);
  }
  return res.json();
}

export async function fetchWeeklyAttendance(
  month?: string
): Promise<WeeklyAttendanceResponse> {
  const cookieStore = await cookies();
  const tokenObj = cookieStore.get("token");
  if (!tokenObj) {
    throw new Error("No auth token found — please log in.");
  }
  const url = new URL(`${serverApi}/attendance/weekly`);
  if (month) url.searchParams.set("month", month);

  const res = await fetch(url.toString(), {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${tokenObj?.value}`,
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `HTTP ${res.status}`);
  }

  return res.json();
}

export async function fetchUserAttendanceSummary(): Promise<UserAttendanceSummary> {
  const cookieStore = await cookies();
  const tokenObj = cookieStore.get("token");
  if (!tokenObj) {
    throw new Error("No auth token found — please log in.");
  }

  const res = await fetch(`${serverApi}/users/summary`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${tokenObj.value}`,
    },
    cache: "no-store",
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `HTTP ${res.status}`);
  }

  return res.json();
}
