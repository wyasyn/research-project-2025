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

export function RecentActivityTable() {
  // Mock data - in a real app, this would come from an API
  const recentActivity = [
    {
      id: "1",
      user: {
        name: "Alex Johnson",
        email: "alex@example.com",
        avatar: "/placeholder.svg?height=32&width=32",
      },
      session: "Morning Check-in",
      status: "Present",
      time: "Today, 9:00 AM",
    },
    {
      id: "2",
      user: {
        name: "Sarah Williams",
        email: "sarah@example.com",
        avatar: "/placeholder.svg?height=32&width=32",
      },
      session: "Team Meeting",
      status: "Late",
      time: "Today, 10:15 AM",
    },
    {
      id: "3",
      user: {
        name: "Michael Brown",
        email: "michael@example.com",
        avatar: "/placeholder.svg?height=32&width=32",
      },
      session: "Project Review",
      status: "Absent",
      time: "Yesterday, 2:00 PM",
    },
    {
      id: "4",
      user: {
        name: "Emily Davis",
        email: "emily@example.com",
        avatar: "/placeholder.svg?height=32&width=32",
      },
      session: "Morning Check-in",
      status: "Present",
      time: "Yesterday, 9:05 AM",
    },
  ];

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>User</TableHead>
          <TableHead>Session</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Time</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {recentActivity.map((activity) => (
          <TableRow key={activity.id}>
            <TableCell className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage
                  src={activity.user.avatar}
                  alt={activity.user.name}
                />
                <AvatarFallback>{activity.user.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium">{activity.user.name}</div>
                <div className="text-xs text-muted-foreground">
                  {activity.user.email}
                </div>
              </div>
            </TableCell>
            <TableCell>{activity.session}</TableCell>
            <TableCell>
              <Badge
                variant={
                  activity.status === "Present"
                    ? "default"
                    : activity.status === "Late"
                    ? "secondary"
                    : "destructive"
                }
              >
                {activity.status}
              </Badge>
            </TableCell>
            <TableCell>{activity.time}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
