import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SessionAttendanceSummary } from "@/types";
import { useEffect, useState } from "react";
import { fetchSessionsAttendanceSummary } from "../attendance";

export function AttendanceBySessionTable() {
  const [sessions, setSessions] = useState<SessionAttendanceSummary[] | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSessionsAttendanceSummary()
      .then(setSessions)
      .catch((e) => setError(e.message));
  }, []);

  if (error) return <p style={{ color: "red" }}>Error: {error}</p>;
  if (!sessions) return <p>Loading…</p>;

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Session</TableHead>
          <TableHead>Date & Time</TableHead>
          <TableHead>Total Users</TableHead>
          <TableHead>Present</TableHead>
          <TableHead>Location</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Attendance Rate</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sessions.map((session) => (
          <TableRow key={session.session_id}>
            <TableCell className="font-medium">{session.title}</TableCell>
            <TableCell>
              {new Date(session.date).toLocaleDateString()} @{" "}
              {new Date(session.start_time).toLocaleTimeString()}
            </TableCell>
            <TableCell>{session.total_users}</TableCell>
            <TableCell>{session.attended_sessions}</TableCell>
            <TableCell>{session.location}</TableCell>
            <TableCell>{session.status}</TableCell>
            <TableCell>
              <Badge
                variant={
                  session.attendance_percentage >= 80
                    ? "default"
                    : session.attendance_percentage >= 60
                    ? "secondary"
                    : "destructive"
                }
              >
                {session.attendance_percentage}%
              </Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
