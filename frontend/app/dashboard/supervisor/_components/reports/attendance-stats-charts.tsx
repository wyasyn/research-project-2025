"use client";

import { Card } from "@/components/ui/card";
import {
  Chart,
  ChartContainer,
  ChartLegend,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

export function AttendanceStatsChart() {
  // Mock data - in a real app, this would come from an API
  const data = [
    {
      name: "Monday",
      present: 42,
      late: 8,
      absent: 5,
    },
    {
      name: "Tuesday",
      present: 38,
      late: 10,
      absent: 7,
    },
    {
      name: "Wednesday",
      present: 45,
      late: 5,
      absent: 5,
    },
    {
      name: "Thursday",
      present: 40,
      late: 12,
      absent: 3,
    },
    {
      name: "Friday",
      present: 35,
      late: 8,
      absent: 12,
    },
  ];

  return (
    <Card className="p-4">
      <ChartContainer
        title="Weekly Attendance"
        description="Attendance statistics for the current week"
        height={350}
      >
        <Chart>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{
                top: 16,
                right: 16,
                left: 0,
                bottom: 0,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" />
              <YAxis />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    className="border-none bg-background p-2 shadow-lg"
                    items={({ payload }) => {
                      return [
                        {
                          label: "Present",
                          value: payload?.[0]?.value,
                          color: "hsl(var(--chart-1))",
                        },
                        {
                          label: "Late",
                          value: payload?.[1]?.value,
                          color: "hsl(var(--chart-2))",
                        },
                        {
                          label: "Absent",
                          value: payload?.[2]?.value,
                          color: "hsl(var(--chart-3))",
                        },
                      ];
                    }}
                  />
                }
              />
              <Bar
                dataKey="present"
                fill="hsl(var(--chart-1))"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="late"
                fill="hsl(var(--chart-2))"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="absent"
                fill="hsl(var(--chart-3))"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </Chart>
        <ChartLegend
          className="mt-4 justify-center"
          items={[
            {
              label: "Present",
              color: "hsl(var(--chart-1))",
            },
            {
              label: "Late",
              color: "hsl(var(--chart-2))",
            },
            {
              label: "Absent",
              color: "hsl(var(--chart-3))",
            },
          ]}
        />
      </ChartContainer>
    </Card>
  );
}
