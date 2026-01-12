import { ChartBarBig, ChartLine, ChartPie } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  XAxis,
  YAxis,
  Legend,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type {
  ProjectStatusData,
  StatsCardProps,
  TaskPriorityData,
  TaskTrendsData,
  WorkspaceProductivityData,
} from "~/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import {
  ChartContainer,
  ChartLegend,
  ChartTooltip,
  ChartTooltipContent,
} from "../ui/chart";

interface Props {
  stats: StatsCardProps;
  taskTrendsData: TaskTrendsData[];
  projectStatusData: ProjectStatusData[];
  taskPriorityData: TaskPriorityData[];
  workspaceProductivityData: WorkspaceProductivityData[];
}

export default function StatisticsCharts({
  projectStatusData,
  taskPriorityData,
  taskTrendsData,
  workspaceProductivityData,
}: Props) {
  // Standard height for all charts to ensure alignment
  const chartHeightClass = "h-[300px] w-full";

  return (
    <div className="grid gap-6 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 mb-8">
      {/* --- Task Trends (Line Chart) --- */}
      <Card className="col-span-1 lg:col-span-2">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div className="space-y-0.5">
            <CardTitle className="text-base font-medium">Task Trends</CardTitle>
            <CardDescription>Daily Task Status (Last 7 Days)</CardDescription>
          </div>
          <ChartLine className="h-4 w-4 text-muted-foreground" />
        </CardHeader>

        <CardContent>
          <ChartContainer
            className={chartHeightClass}
            config={{
              completed: { label: "Completed", color: "#10b981" },
              inProgress: { label: "In Progress", color: "#f59e0b" },
              toDo: { label: "To Do", color: "#3b82f6" },
            }}
          >
            <LineChart
              data={taskTrendsData}
              margin={{ top: 5, right: 10, left: -20, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#E5E7EB"
              />
              <XAxis
                dataKey="name"
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickMargin={10}
              />
              <YAxis
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Legend verticalAlign="top" height={36} iconType="circle" />

              <Line
                type="monotone"
                dataKey="completed"
                stroke="#10b981"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="inProgress"
                stroke="#f59e0b"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="toDo"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* --- Project Status (Pie Chart) --- */}
      <Card className="col-span-1">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div className="space-y-0.5">
            <CardTitle className="text-base font-medium">
              Project Status
            </CardTitle>
            <CardDescription>Distribution across workspace</CardDescription>
          </div>
          <ChartPie className="h-4 w-4 text-muted-foreground" />
        </CardHeader>

        <CardContent>
          <ChartContainer
            className={chartHeightClass}
            config={{
              Completed: { label: "Completed", color: "#10b981" },
              "In Progress": { label: "In Progress", color: "#3b82f6" },
              Planning: { label: "Planning", color: "#f59e0b" },
            }}
          >
            <PieChart>
              <Pie
                data={projectStatusData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={2}
                dataKey="value"
                nameKey="name"
              >
                {projectStatusData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color}
                    strokeWidth={0}
                  />
                ))}
              </Pie>
              <ChartTooltip content={<ChartTooltipContent hideLabel />} />
              <Legend
                layout="horizontal"
                verticalAlign="bottom"
                align="center"
                wrapperStyle={{ paddingTop: "20px" }}
              />
            </PieChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* --- Task Priority (Pie Chart) --- */}
      <Card className="col-span-1">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div className="space-y-0.5">
            <CardTitle className="text-base font-medium">
              Task Priority
            </CardTitle>
            <CardDescription>Breakdown by urgency</CardDescription>
          </div>
          <ChartPie className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <ChartContainer
            className={chartHeightClass}
            config={{
              High: { label: "High", color: "#ef4444" },
              Medium: { label: "Medium", color: "#f59e0b" },
              Low: { label: "Low", color: "#6b7280" },
            }}
          >
            <PieChart>
              <Pie
                data={taskPriorityData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={2}
                dataKey="value"
                nameKey="name"
              >
                {taskPriorityData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color}
                    strokeWidth={0}
                  />
                ))}
              </Pie>
              <ChartTooltip content={<ChartTooltipContent hideLabel />} />
              <Legend
                layout="horizontal"
                verticalAlign="bottom"
                align="center"
                wrapperStyle={{ paddingTop: "20px" }}
              />
            </PieChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* --- Workspace Productivity (Bar Chart) --- */}
      <Card className="col-span-1 lg:col-span-2">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div className="space-y-0.5">
            <CardTitle className="text-base font-medium">
              Productivity by Project
            </CardTitle>
            <CardDescription>Completion rates per project</CardDescription>
          </div>
          <ChartBarBig className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <ChartContainer
            className={chartHeightClass}
            config={{
              total: { label: "Total Tasks", color: "#e5e7eb" },
              completed: { label: "Completed", color: "#3b82f6" },
            }}
          >
            <BarChart
              data={workspaceProductivityData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#E5E7EB"
              />
              <XAxis
                dataKey="name"
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickMargin={10}
              />
              <YAxis
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Legend verticalAlign="top" height={36} />
              <Bar
                dataKey="total"
                fill="#e5e7eb" // Light gray for background bar
                radius={[4, 4, 0, 0]}
                barSize={30}
              />
              <Bar
                dataKey="completed"
                fill="#3b82f6" // Blue for progress
                radius={[4, 4, 0, 0]}
                barSize={30}
              />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
