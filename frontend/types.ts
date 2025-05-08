import { z } from "zod";

export const sessionFormSchema = z.object({
  title: z.string().min(3, "Session title must be at least 3 characters"),
  description: z.string().optional(),
  location: z.string().min(1, "Location is required"),
  date: z.date({ required_error: "Please select a date" }),
  start_time: z.string().min(1, "Please select a time"),
  duration_minutes: z.coerce
    .number()
    .min(5, "Duration must be at least 5 minutes")
    .max(480, "Duration cannot exceed 8 hours"),
});

export type SessionFormValues = z.infer<typeof sessionFormSchema>;

export interface AttendanceRecord {
  user_id: number;
  name: string;
  timestamp: string; // ISO string
}

export interface AttendanceSessionDetails {
  id: number;
  title: string;
  description: string | null;
  start_time: string; // ISO string
  duration_minutes: number;
  status: "scheduled" | "active" | "completed";
  location: string | null;
  records: AttendanceRecord[];
}

export interface SessionAttendanceSummary {
  session_id: number;
  title: string;
  date: string; // ISO date
  start_time: string; // ISO datetime
  duration_minutes: number;
  location: string | null;
  status: string; // “scheduled” | “active” | “completed”
  total_users: number;
  attended_sessions: number;
  attendance_percentage: number;
}

export interface WeeklyAttendanceWeek {
  week_start: string; // ISO date of week start (Monday or clipped)
  week_end: string; // ISO date of week end   (Sunday or clipped)
  attendee_count: number; // number of records in that week
}

export interface WeeklyAttendanceResponse {
  month: string; // "YYYY-MM"
  weeks: WeeklyAttendanceWeek[];
}

export interface UserAttendanceSummaryResponse {
  user: {
    id: number;
    name: string;
    email: string;
    image: string | null;
  };
  total_sessions: number;
  sessions_attended: number;
  attendance_rate: number;
  recent_attendance: {
    session_name: string;
    date: string; // ISO format
    status: "Present" | "Absent";
  }[];
  monthly_progress: {
    month: string; // "YYYY-MM"
    attendance_rate: number;
  }[];
}

type RecentAttendance = {
  session_name: string;
  date: string;
  status: string; // "Present"
};

type MonthlyProgress = {
  month: string; // e.g. "2025-04"
  attendance_rate: number;
};

export type UserAttendanceSummary = {
  user: {
    id: number;
    name: string;
    email: string;
    image: string | null;
  };
  organization_name: string;
  total_sessions: number;
  sessions_attended: number;
  attendance_rate: number;
  recent_attendance: RecentAttendance[];
  monthly_progress: MonthlyProgress[];
};

export const EditUserSchema = z.object({
  user_id: z.string().optional(),
  name: z.string().min(1, "Name is required").optional(),
  email: z.string().email("Invalid email").optional(),
  image_url: z.string().url("Invalid URL").optional(),
});

export interface SummaryProps {
  attendance_percentage: number;
  attended_sessions: number;
  email: string;
  image_url: string;
  name: string;
  total_sessions: number;
  user_id: number;
}
