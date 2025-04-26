"use client";

import { TrendingUp } from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { useEffect, useState } from "react";
import { WeeklyAttendanceResponse } from "@/types";
import { fetchWeeklyAttendance } from "../attendance";

export function AttendanceStatsChart() {
  const [data, setData] = useState<WeeklyAttendanceResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchWeeklyAttendance()
      .then(setData)
      .catch((e) => setError(e.message));
  }, []);

  if (error) return <p className="text-destructive">Error: {error}</p>;
  if (!data)
    return (
      <p>
        Loading attendance statistics...
        <br />
        <span className="text-muted-foreground">
          This may take a few seconds.
        </span>
      </p>
    );
  const chartData = data.weeks.map((week, i) => ({
    week: `Week ${i + 1}`,
    present: week.attendee_count,
  }));

  const chartConfig = {
    present: {
      label: "Present",
      color: "hsl(var(--chart-1))",
    },
  } satisfies ChartConfig;

  return (
    <Card className="w-full max-w-[768px]">
      <CardHeader>
        <CardTitle>Bar Chart</CardTitle>
        <CardDescription>{data.month} Attendance Statistics</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart accessibilityLayer data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="week"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
            />

            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Bar dataKey="present" fill="var(--color-desktop)" radius={8} />
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <TrendingUp className="h-4 w-4" />
          <span>Attendance Statistics</span>
        </div>
        <p className="text-muted-foreground">
          This chart shows the attendance statistics for the month of{" "}
          {data.month}.
        </p>
      </CardFooter>
    </Card>
  );
}
