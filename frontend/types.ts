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

export interface UserAttendanceSummary {
  user_id: number;
  name: string;
  email: string;
  image_url: string | null;
  total_sessions: number;
  attended_sessions: number;
  attendance_percentage: number;
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
