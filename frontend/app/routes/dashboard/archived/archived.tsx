import { format } from "date-fns";
import { Briefcase, Calendar, CheckCircle2, Archive } from "lucide-react";
import Loader from "~/components/loader";
import { Badge } from "~/components/ui/badge";
import { Card, CardContent } from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";
import { useGetArchivedTasks } from "~/hooks/use-workspace";
import { cn } from "~/lib/utils";
import type { Task } from "~/types";

export default function Archived() {
  // 1. Get the raw response from the hook
  const { data, isPending } = useGetArchivedTasks();
  // const { mutate, isPending } = useUnarchiveTask();

  // 2. Extract the array. Since your backend returns { archivedTasks: [...] }
  // we must access .archivedTasks here.
  const tasks = (data as { archivedTasks: Task[] })?.archivedTasks || [];

  if (isPending) {
    return <Loader />;
  }

  console.log(data);

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case "urgent":
        return "bg-red-100 text-red-700 hover:bg-red-100/80";
      case "high":
        return "bg-orange-100 text-orange-700 hover:bg-orange-100/80";
      case "medium":
        return "bg-blue-100 text-blue-700 hover:bg-blue-100/80";
      default:
        return "bg-slate-100 text-slate-700 hover:bg-slate-100/80";
    }
  };

  return (
    <div className="space-y-8 w-full">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Archived Tasks</h1>
        <p className="text-muted-foreground">
          View tasks that have been archived.
        </p>
      </div>

      <Separator />

      {tasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center h-[50vh]">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted/50">
            <Archive className="h-10 w-10 text-muted-foreground" />
          </div>
          <h3 className="mt-4 text-lg font-semibold">No archived tasks</h3>
          <p className="text-sm text-muted-foreground max-w-sm mt-2">
            Tasks you archive will appear here safely stored away.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {tasks.map((task) => (
            <Card
              key={task._id}
              className="hover:shadow-sm transition-all opacity-75 hover:opacity-100"
            >
              <CardContent className="p-4 flex flex-col md:flex-row gap-4 md:items-center justify-between">
                {/* Task Details */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded">
                      {task._id}
                    </span>
                    <span className="font-medium text-muted-foreground">
                      {task.title}
                    </span>
                  </div>
                  {task.project && (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Briefcase className="h-3 w-3" />
                      {/* Handle populated object vs ID string */}
                      <span>
                        {typeof task.project === "string"
                          ? "Project"
                          : task.project.title}
                      </span>
                    </div>
                  )}
                </div>

                {/* Status & Date */}
                <div className="flex flex-wrap items-center gap-4 text-sm">
                  <Badge
                    variant="secondary"
                    className={cn(
                      "capitalize",
                      getPriorityColor(task.priority)
                    )}
                  >
                    {task.priority}
                  </Badge>

                  <div className="flex items-center gap-1 text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4" />
                    <span className="capitalize">{task.status}</span>
                  </div>

                  <div className="flex items-center gap-1.5 text-muted-foreground text-xs bg-muted/50 px-2 py-1 rounded-md">
                    <Calendar className="h-3 w-3" />
                    <span>
                      {task.updatedAt
                        ? format(new Date(task.updatedAt), "PPP")
                        : "--"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
