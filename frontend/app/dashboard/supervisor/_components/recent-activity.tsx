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
import { getLatestRecords } from "./attendance";
import { formatFriendlyTime } from "@/lib/utils";

export async function RecentActivityTable() {
  const { latestRecords, error } = await getLatestRecords();

  if (error) {
    return <p>{error}</p>;
  }

  if (latestRecords && latestRecords.length === 0) {
    return <p>No records found</p>;
  }

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
        {latestRecords &&
          latestRecords.length > 0 &&
          latestRecords.map((activity) => (
            <TableRow key={activity.user_id}>
              <TableCell className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    src={activity.image_url || "/placeholder-image..jpg"}
                    alt={activity.name}
                    className="object-cover"
                  />
                  <AvatarFallback>{activity.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">{activity.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {activity.email}
                  </div>
                </div>
              </TableCell>
              <TableCell>{activity.session_title}</TableCell>
              <TableCell>
                <Badge
                  variant={
                    activity.status === "completed"
                      ? "default"
                      : activity.status === "active"
                      ? "secondary"
                      : "destructive"
                  }
                >
                  {activity.status}
                </Badge>
              </TableCell>
              <TableCell>{formatFriendlyTime(activity.timestamp)}</TableCell>
            </TableRow>
          ))}
      </TableBody>
    </Table>
  );
}
