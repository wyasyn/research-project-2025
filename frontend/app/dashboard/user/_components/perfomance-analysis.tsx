"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Chart,
  ChartArea,
  ChartContainer,
  ChartLegend,
  ChartLine,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Sample data for the charts
const monthlyData = [
  { month: "Jan", attended: 18, missed: 4 },
  { month: "Feb", attended: 20, missed: 2 },
  { month: "Mar", attended: 15, missed: 5 },
  { month: "Apr", attended: 22, missed: 0 },
  { month: "May", attended: 19, missed: 3 },
  { month: "Jun", attended: 17, missed: 5 },
];

const weeklyData = [
  { week: "Week 1", attended: 4, missed: 1 },
  { week: "Week 2", attended: 5, missed: 0 },
  { week: "Week 3", attended: 3, missed: 2 },
  { week: "Week 4", attended: 5, missed: 0 },
];

export function PerformanceAnalysis() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card className="col-span-2">
        <CardHeader>
          <CardTitle>Attendance Over Time</CardTitle>
          <CardDescription>Track your attendance patterns</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="monthly">
            <TabsList className="mb-4">
              <TabsTrigger value="monthly">Monthly</TabsTrigger>
              <TabsTrigger value="weekly">Weekly</TabsTrigger>
            </TabsList>
            <TabsContent value="monthly">
              <div className="h-[300px]">
                <ChartContainer
                  data={monthlyData}
                  xAxisKey="month"
                  yAxisWidth={40}
                  series={[
                    {
                      key: "attended",
                      label: "Sessions Attended",
                      color: "hsl(var(--chart-1))",
                    },
                    {
                      key: "missed",
                      label: "Sessions Missed",
                      color: "hsl(var(--chart-3))",
                    },
                  ]}
                >
                  <Chart>
                    <ChartLine />
                    <ChartArea />
                    <ChartTooltip>
                      <ChartTooltipContent />
                    </ChartTooltip>
                  </Chart>
                  <ChartLegend />
                </ChartContainer>
              </div>
            </TabsContent>
            <TabsContent value="weekly">
              <div className="h-[300px]">
                <ChartContainer
                  data={weeklyData}
                  xAxisKey="week"
                  yAxisWidth={40}
                  series={[
                    {
                      key: "attended",
                      label: "Sessions Attended",
                      color: "hsl(var(--chart-1))",
                    },
                    {
                      key: "missed",
                      label: "Sessions Missed",
                      color: "hsl(var(--chart-3))",
                    },
                  ]}
                >
                  <Chart>
                    <ChartLine />
                    <ChartArea />
                    <ChartTooltip>
                      <ChartTooltipContent />
                    </ChartTooltip>
                  </Chart>
                  <ChartLegend />
                </ChartContainer>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Attendance by Session Type</CardTitle>
          <CardDescription>Morning vs Afternoon attendance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ChartContainer
              data={[
                { type: "Morning", attended: 24, missed: 4 },
                { type: "Afternoon", attended: 20, missed: 8 },
              ]}
              xAxisKey="type"
              yAxisWidth={40}
              series={[
                {
                  key: "attended",
                  label: "Attended",
                  color: "hsl(var(--chart-1))",
                },
                {
                  key: "missed",
                  label: "Missed",
                  color: "hsl(var(--chart-3))",
                },
              ]}
            >
              <Chart>
                <ChartLine />
                <ChartArea />
                <ChartTooltip>
                  <ChartTooltipContent />
                </ChartTooltip>
              </Chart>
              <ChartLegend />
            </ChartContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Attendance Percentage</CardTitle>
          <CardDescription>Overall attendance rate</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-[300px] items-center justify-center">
            <div className="relative flex h-52 w-52 items-center justify-center rounded-full border-8 border-primary/20">
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-4xl font-bold">87.5%</span>
              </div>
              <svg className="h-full w-full" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="hsl(var(--primary))"
                  strokeWidth="10"
                  strokeDasharray="282.7"
                  strokeDashoffset="35.3"
                  transform="rotate(-90 50 50)"
                />
              </svg>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
