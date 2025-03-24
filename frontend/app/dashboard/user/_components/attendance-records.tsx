"use client";

import { useState } from "react";
import { Download } from "lucide-react";

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
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Sample attendance data
const attendanceData = [
  {
    id: 1,
    date: "2023-03-15",
    session: "Morning Session",
    status: "Present",
    checkInTime: "08:55 AM",
    checkOutTime: "12:30 PM",
  },
  {
    id: 2,
    date: "2023-03-14",
    session: "Afternoon Session",
    status: "Present",
    checkInTime: "01:25 PM",
    checkOutTime: "05:05 PM",
  },
  {
    id: 3,
    date: "2023-03-13",
    session: "Morning Session",
    status: "Absent",
    checkInTime: "-",
    checkOutTime: "-",
  },
  {
    id: 4,
    date: "2023-03-12",
    session: "Morning Session",
    status: "Present",
    checkInTime: "09:02 AM",
    checkOutTime: "12:28 PM",
  },
  {
    id: 5,
    date: "2023-03-11",
    session: "Afternoon Session",
    status: "Present",
    checkInTime: "01:30 PM",
    checkOutTime: "05:00 PM",
  },
  {
    id: 6,
    date: "2023-03-10",
    session: "Morning Session",
    status: "Present",
    checkInTime: "08:50 AM",
    checkOutTime: "12:25 PM",
  },
  {
    id: 7,
    date: "2023-03-09",
    session: "Afternoon Session",
    status: "Late",
    checkInTime: "01:45 PM",
    checkOutTime: "05:10 PM",
  },
  {
    id: 8,
    date: "2023-03-08",
    session: "Morning Session",
    status: "Present",
    checkInTime: "08:58 AM",
    checkOutTime: "12:30 PM",
  },
  {
    id: 9,
    date: "2023-03-07",
    session: "Afternoon Session",
    status: "Absent",
    checkInTime: "-",
    checkOutTime: "-",
  },
  {
    id: 10,
    date: "2023-03-06",
    session: "Morning Session",
    status: "Present",
    checkInTime: "09:00 AM",
    checkOutTime: "12:30 PM",
  },
];

export function AttendanceRecords() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [sessionFilter, setSessionFilter] = useState<string | null>(null);

  // Filter the attendance data based on search term and filters
  const filteredData = attendanceData.filter((record) => {
    const matchesSearch = record.date
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter ? record.status === statusFilter : true;
    const matchesSession = sessionFilter
      ? record.session === sessionFilter
      : true;
    return matchesSearch && matchesStatus && matchesSession;
  });

  const handleDownload = () => {
    // In a real application, this would generate a CSV or PDF file
    alert("Downloading attendance records...");
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Attendance Records</CardTitle>
            <CardDescription>
              View and filter your attendance history
            </CardDescription>
          </div>
          <Button onClick={handleDownload} className="gap-2">
            <Download className="h-4 w-4" />
            Download Records
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex flex-col gap-4 sm:flex-row">
          <div className="flex flex-1 items-center gap-2">
            <Input
              placeholder="Search by date..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-xs"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Select
              value={sessionFilter || ""}
              onValueChange={(value) => setSessionFilter(value || null)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by session" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Sessions</SelectLabel>
                  <SelectItem value="all">All Sessions</SelectItem>
                  <SelectItem value="Morning Session">
                    Morning Session
                  </SelectItem>
                  <SelectItem value="Afternoon Session">
                    Afternoon Session
                  </SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>

            <Select
              value={statusFilter || ""}
              onValueChange={(value) => setStatusFilter(value || null)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Status</SelectLabel>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="Present">Present</SelectItem>
                  <SelectItem value="Absent">Absent</SelectItem>
                  <SelectItem value="Late">Late</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Session</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Check In</TableHead>
                <TableHead>Check Out</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.length > 0 ? (
                filteredData.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>{record.date}</TableCell>
                    <TableCell>{record.session}</TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          record.status === "Present"
                            ? "bg-green-100 text-green-800"
                            : record.status === "Late"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {record.status}
                      </span>
                    </TableCell>
                    <TableCell>{record.checkInTime}</TableCell>
                    <TableCell>{record.checkOutTime}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    No records found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
