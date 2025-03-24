"use client";

import { useState } from "react";
import {
  CalendarPlus,
  Download,
  FileSpreadsheet,
  FileIcon as FilePdf,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CreateSessionDialog } from "./create";

export function AttendanceManagement() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Mock data - in a real app, this would come from an API
  const sessions = [
    {
      id: "1",
      name: "Morning Check-in",
      date: "2025-03-23",
      time: "09:00 AM",
      location: "Main Office",
      attendees: 24,
      status: "Active",
    },
    {
      id: "2",
      name: "Team Meeting",
      date: "2025-03-23",
      time: "10:30 AM",
      location: "Conference Room A",
      attendees: 12,
      status: "Active",
    },
    {
      id: "3",
      name: "Project Review",
      date: "2025-03-22",
      time: "02:00 PM",
      location: "Conference Room B",
      attendees: 8,
      status: "Completed",
    },
    {
      id: "4",
      name: "Training Session",
      date: "2025-03-24",
      time: "11:00 AM",
      location: "Training Room",
      attendees: 15,
      status: "Scheduled",
    },
    {
      id: "5",
      name: "Department Meeting",
      date: "2025-03-25",
      time: "09:30 AM",
      location: "Conference Room C",
      attendees: 20,
      status: "Scheduled",
    },
  ];

  const filteredSessions = sessions.filter(
    (session) =>
      session.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      session.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search sessions..."
            className="w-full pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                Export to Excel
              </DropdownMenuItem>
              <DropdownMenuItem>
                <FilePdf className="mr-2 h-4 w-4" />
                Export to PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <CalendarPlus className="mr-2 h-4 w-4" />
            Create Session
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Attendance Sessions</CardTitle>
          <CardDescription>
            Manage your attendance sessions and track records
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Session Name</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Attendees</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSessions.map((session) => (
                <TableRow key={session.id}>
                  <TableCell className="font-medium">{session.name}</TableCell>
                  <TableCell>{session.date}</TableCell>
                  <TableCell>{session.time}</TableCell>
                  <TableCell>{session.location}</TableCell>
                  <TableCell>{session.attendees}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        session.status === "Active"
                          ? "default"
                          : session.status === "Completed"
                          ? "secondary"
                          : "outline"
                      }
                    >
                      {session.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Download className="mr-2 h-4 w-4" />
                          Export Records
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <CreateSessionDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
      />
    </div>
  );
}
