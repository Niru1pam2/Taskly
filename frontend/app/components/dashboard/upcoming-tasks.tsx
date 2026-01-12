import { Link, useSearchParams } from "react-router";
import type { Task } from "~/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { cn } from "~/lib/utils";
import { CheckCircleIcon, Circle } from "lucide-react";
import { format } from "date-fns";

export default function UpcomingTasks({ data }: { data: Task[] }) {
  const [searchParams] = useSearchParams();
  const workspaceId = searchParams.get("workspaceId");
  return (
    <Card>
      <CardHeader>
        <CardTitle>Upcoming Tasks</CardTitle>
        <CardDescription>Here are the tasks that are due soon</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {data.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            No upcoming tasks
          </p>
        ) : (
          data.map((task) => (
            <Link
              to={`/workspaces/${workspaceId}/projects/${task.project}/tasks/${task._id}`}
              className="flex items-start space-x-3 border-b pb-3 last:border-0"
            >
              <div
                className={cn(
                  "mt-0.5 rounded-full p-1",
                  task.priority === "High" && "bg-red-100 text-red-700",
                  task.priority === "Medium" && "bg-yellow-100 text-yellow-700",
                  task.priority === "Low" && "bg-green-100 text-green-700"
                )}
              >
                {task.status === "Done" ? <CheckCircleIcon /> : <Circle />}
              </div>

              <div className="space-y-1">
                <p className="font-medium text-sm">{task.title}</p>
                <div className="flex items-center text-xs text-muted-foreground">
                  <span>{task.status}</span>
                  {task.dueDate && (
                    <>
                      <span className="mx-1"> - </span>
                      <span>
                        {format(new Date(task.dueDate), "MMM d, yyyy")}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </Link>
          ))
        )}
      </CardContent>
    </Card>
  );
}
