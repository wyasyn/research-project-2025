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
