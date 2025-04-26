import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { UserAttendanceSummary } from "@/types";
import { useEffect, useState } from "react";
import { fetchUsersAttendanceSummary } from "../attendance";

export function AttendanceByUserTable() {
  const [data, setData] = useState<UserAttendanceSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUsersAttendanceSummary()
      .then(setData)
      .catch((e) => setError(e.message));
  }, []);

  if (error) return <p style={{ color: "red" }}>Error: {error}</p>;
  if (!data) return <p>Loading…</p>;
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>User</TableHead>
          <TableHead>Total Sessions</TableHead>
          <TableHead>Present</TableHead>

          <TableHead>Attendance Rate</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((user) => (
          <TableRow key={user.user_id}>
            <TableCell className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage
                  src={user.image_url || "/placeholder-image.jpg"}
                  alt={user.name}
                />
                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium">{user.name}</div>
                <div className="text-xs text-muted-foreground">
                  {user.email}
                </div>
              </div>
            </TableCell>
            <TableCell>{user.total_sessions}</TableCell>
            <TableCell>{user.attended_sessions}</TableCell>

            <TableCell>
              <Badge
                variant={
                  user.attendance_percentage >= 80
                    ? "default"
                    : user.attendance_percentage >= 60
                    ? "secondary"
                    : "destructive"
                }
              >
                {user.attendance_percentage}%
              </Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
