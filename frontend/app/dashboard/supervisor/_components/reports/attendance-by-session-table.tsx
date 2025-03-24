import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function AttendanceBySessionTable() {
  // Mock data - in a real app, this would come from an API
  const sessions = [
    {
      id: "1",
      name: "Morning Check-in",
      date: "2025-03-23",
      time: "09:00 AM",
      totalUsers: 25,
      present: 20,
      late: 3,
      absent: 2,
      attendanceRate: "80%",
    },
    {
      id: "2",
      name: "Team Meeting",
      date: "2025-03-23",
      time: "10:30 AM",
      totalUsers: 12,
      present: 10,
      late: 2,
      absent: 0,
      attendanceRate: "83%",
    },
    {
      id: "3",
      name: "Project Review",
      date: "2025-03-22",
      time: "02:00 PM",
      totalUsers: 8,
      present: 7,
      late: 1,
      absent: 0,
      attendanceRate: "88%",
    },
    {
      id: "4",
      name: "Training Session",
      date: "2025-03-24",
      time: "11:00 AM",
      totalUsers: 15,
      present: 12,
      late: 2,
      absent: 1,
      attendanceRate: "80%",
    },
    {
      id: "5",
      name: "Department Meeting",
      date: "2025-03-25",
      time: "09:30 AM",
      totalUsers: 20,
      present: 15,
      late: 3,
      absent: 2,
      attendanceRate: "75%",
    },
  ];

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Session</TableHead>
          <TableHead>Date & Time</TableHead>
          <TableHead>Total Users</TableHead>
          <TableHead>Present</TableHead>
          <TableHead>Late</TableHead>
          <TableHead>Absent</TableHead>
          <TableHead>Attendance Rate</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sessions.map((session) => (
          <TableRow key={session.id}>
            <TableCell className="font-medium">{session.name}</TableCell>
            <TableCell>{`${session.date}, ${session.time}`}</TableCell>
            <TableCell>{session.totalUsers}</TableCell>
            <TableCell>{session.present}</TableCell>
            <TableCell>{session.late}</TableCell>
            <TableCell>{session.absent}</TableCell>
            <TableCell>
              <Badge
                variant={
                  Number.parseInt(session.attendanceRate) >= 80
                    ? "default"
                    : Number.parseInt(session.attendanceRate) >= 60
                    ? "secondary"
                    : "destructive"
                }
              >
                {session.attendanceRate}
              </Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
