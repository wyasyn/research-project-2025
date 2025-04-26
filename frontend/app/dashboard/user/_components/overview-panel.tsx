"use client";
/* eslint-disable @next/next/no-img-element */
import { Calendar, Clock, User } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { useEffect, useState } from "react";
import { UserAttendanceSummary } from "@/types";
import { fetchUserAttendanceSummary } from "../../supervisor/_components/attendance";

export function OverviewPanel() {
  const [data, setData] = useState<UserAttendanceSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUserAttendanceSummary()
      .then(setData)
      .catch((e) => setError(e.message));
  }, []);

  if (error) return <p className="text-red-500">Error: {error}</p>;
  if (!data) return <p>Loading user attendance summary...</p>;
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="col-span-2">
        <CardHeader className="flex flex-row items-center space-y-0 pb-2">
          <div className="flex flex-1 flex-col">
            <CardTitle>Personal Overview</CardTitle>
            <CardDescription>
              Your profile and attendance summary
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center gap-4 sm:flex-row">
            <div className="relative h-24 w-24 overflow-hidden rounded-full">
              <img
                src={data.user.image || "/placeholder-image.jpg"}
                alt="Profile picture"
                className="aspect-square h-full w-full object-cover"
              />
            </div>
            <div className="space-y-1 text-center sm:text-left">
              <h3 className="text-xl font-semibold">{data.user.name}</h3>
              <p className="text-sm text-muted-foreground">{data.user.email}</p>
              <p className="text-sm text-muted-foreground">
                {data.organization_name}
              </p>
            </div>
          </div>
          <Separator className="my-4" />
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="flex flex-col items-center gap-1 rounded-lg border p-3">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                Total Sessions
              </span>
              <span className="text-xl font-semibold">
                {data.total_sessions}
              </span>
            </div>
            <div className="flex flex-col items-center gap-1 rounded-lg border p-3">
              <User className="h-5 w-5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Attended</span>
              <span className="text-xl font-semibold">
                {data.sessions_attended}
              </span>
            </div>
            <div className="flex flex-col items-center gap-1 rounded-lg border p-3">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                Attendance Rate
              </span>
              <span className="text-xl font-semibold">
                {data.attendance_rate}%
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card className="col-span-2">
        <CardHeader>
          <CardTitle>Recent Attendance</CardTitle>
          <CardDescription>Your last 5 attendance records</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.recent_attendance.map((record, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className={`h-2 w-2 rounded-full ${
                      record.status === "Present"
                        ? "bg-green-500"
                        : "bg-red-500"
                    }`}
                  />
                  <span className="font-medium">{record.date}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-muted-foreground">
                    {record.session_name}
                  </span>
                  <span
                    className={`text-sm ${
                      record.status === "Present"
                        ? "text-green-500"
                        : "text-red-500"
                    }`}
                  >
                    {record.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      <Card className="col-span-2 md:col-span-4">
        <CardHeader>
          <CardTitle>Monthly Attendance Progress</CardTitle>
          <CardDescription>
            Your attendance rate for the current month
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.monthly_progress.map((record, index) => (
              <div className="space-y-2" key={index}>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{record.month}</span>
                  <span className="text-sm font-medium">
                    {record.attendance_rate}%
                  </span>
                </div>
                <Progress value={record.attendance_rate} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
