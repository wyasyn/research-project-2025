"use client";

import { useState } from "react";
import {
  Download,
  FileSpreadsheet,
  FileIcon as FilePdf,
  Calendar,
} from "lucide-react";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { AttendanceStatsChart } from "@/components/reports/attendance-stats-chart";
import { AttendanceByUserTable } from "@/components/reports/attendance-by-user-table";
import { AttendanceBySessionTable } from "@/components/reports/attendance-by-session-table";

export function ReportsAnalytics() {
  const [date, setDate] = useState<Date>();

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <Select defaultValue="all">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="custom">Custom Range</SelectItem>
            </SelectContent>
          </Select>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-[240px] justify-start text-left font-normal",
                  !date && "text-muted-foreground"
                )}
              >
                <Calendar className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <CalendarComponent
                mode="single"
                selected={date}
                onSelect={setDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export Report
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
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Attendance Overview</CardTitle>
          <CardDescription>
            Attendance statistics across all sessions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AttendanceStatsChart />
        </CardContent>
      </Card>

      <Tabs defaultValue="by-user" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="by-user">By User</TabsTrigger>
          <TabsTrigger value="by-session">By Session</TabsTrigger>
        </TabsList>
        <TabsContent value="by-user">
          <Card>
            <CardHeader>
              <CardTitle>Attendance by User</CardTitle>
              <CardDescription>
                View attendance records for each user
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AttendanceByUserTable />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="by-session">
          <Card>
            <CardHeader>
              <CardTitle>Attendance by Session</CardTitle>
              <CardDescription>
                View attendance records for each session
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AttendanceBySessionTable />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
