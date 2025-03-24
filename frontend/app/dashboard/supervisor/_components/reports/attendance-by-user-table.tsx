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

export function AttendanceByUserTable() {
  // Mock data - in a real app, this would come from an API
  const users = [
    {
      id: "1",
      name: "Alex Johnson",
      email: "alex@example.com",
      avatar: "/placeholder.svg?height=32&width=32",
      totalSessions: 24,
      present: 20,
      late: 3,
      absent: 1,
      attendanceRate: "83%",
    },
    {
      id: "2",
      name: "Sarah Williams",
      email: "sarah@example.com",
      avatar: "/placeholder.svg?height=32&width=32",
      totalSessions: 24,
      present: 18,
      late: 4,
      absent: 2,
      attendanceRate: "75%",
    },
    {
      id: "3",
      name: "Michael Brown",
      email: "michael@example.com",
      avatar: "/placeholder.svg?height=32&width=32",
      totalSessions: 24,
      present: 15,
      late: 5,
      absent: 4,
      attendanceRate: "62%",
    },
    {
      id: "4",
      name: "Emily Davis",
      email: "emily@example.com",
      avatar: "/placeholder.svg?height=32&width=32",
      totalSessions: 24,
      present: 22,
      late: 2,
      absent: 0,
      attendanceRate: "92%",
    },
    {
      id: "5",
      name: "David Wilson",
      email: "david@example.com",
      avatar: "/placeholder.svg?height=32&width=32",
      totalSessions: 24,
      present: 19,
      late: 3,
      absent: 2,
      attendanceRate: "79%",
    },
  ];

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>User</TableHead>
          <TableHead>Total Sessions</TableHead>
          <TableHead>Present</TableHead>
          <TableHead>Late</TableHead>
          <TableHead>Absent</TableHead>
          <TableHead>Attendance Rate</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user.id}>
            <TableCell className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium">{user.name}</div>
                <div className="text-xs text-muted-foreground">
                  {user.email}
                </div>
              </div>
            </TableCell>
            <TableCell>{user.totalSessions}</TableCell>
            <TableCell>{user.present}</TableCell>
            <TableCell>{user.late}</TableCell>
            <TableCell>{user.absent}</TableCell>
            <TableCell>
              <Badge
                variant={
                  Number.parseInt(user.attendanceRate) >= 80
                    ? "default"
                    : Number.parseInt(user.attendanceRate) >= 60
                    ? "secondary"
                    : "destructive"
                }
              >
                {user.attendanceRate}
              </Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
