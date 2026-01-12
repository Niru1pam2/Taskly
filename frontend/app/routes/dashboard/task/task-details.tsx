import { formatDistanceToNow } from "date-fns";
import { ArrowLeft, EyeIcon, EyeOff, Trash2 } from "lucide-react";
import { useNavigate, useParams } from "react-router";
import { toast } from "sonner";
import Loader from "~/components/loader";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  uesWatchTaskMutation,
  useArchiveTaskMutation,
  useDeleteTaskMutation,
  useTaskByIdQuery,
} from "~/hooks/use-task";
import { useAuth } from "~/providers/auth-context";
import type { Project, Task } from "~/types";
import CommentSection from "./comment-section";
import SubTaskDetails from "./sub-task";
import TaskActivity from "./task-activity";
import TaskAssigneesSelector from "./task-assignees-selector";
import TaskDescription from "./task-description";
import TaskPrioritySelector from "./task-priority-selector";
import TaskStatusSelector from "./task-status-selector";
import TaskTitle from "./task-title";
import Watchers from "./watchers";
import UploadFile from "./upload-task-file";
import FileDescription from "./task-file-description";

export default function TaskDetails() {
  const { user } = useAuth();

  const { taskId } = useParams<{
    taskId: string;
    projectId: string;
    workspaceId: string;
  }>();

  const navigate = useNavigate();

  const { data, isLoading } = useTaskByIdQuery(taskId!) as {
    data: {
      task: Task;
      project: Project;
    };
    isLoading: boolean;
  };

  const { mutate: watchTask, isPending: isWatching } = uesWatchTaskMutation();
  const { mutate: archiveTask, isPending: isArchived } =
    useArchiveTaskMutation();
  const { mutate: deleteTask, isPending: isDeleting } = useDeleteTaskMutation();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center gap-2">
        <h2 className="text-2xl font-bold">Task not found</h2>
        <Button variant="outline" onClick={() => navigate(-1)}>
          Go Back
        </Button>
      </div>
    );
  }

  const { task, project } = data;

  const userId = user?._id;

  const member = project.members.find((member) => {
    const memberUserId = member?.user?._id;
    if (!memberUserId || !userId) return false;
    return memberUserId.toString() === userId.toString();
  });

  const isManager = member?.role === "manager";

  const isUserWatching = task.watchers?.some((watcher) => {
    if (!watcher?._id || !userId) return false;
    return watcher._id.toString() === userId.toString();
  });

  const goBack = () => navigate(-1);

  const handleWatchTask = () => {
    watchTask(
      { taskId: task._id },
      {
        onSuccess: () =>
          toast.success(isUserWatching ? "Unwatched Task" : "Watching Task"),
        onError: (error: any) => {
          toast.error(error.response?.data.message);
        },
      }
    );
  };

  const handleArchiveTask = () => {
    archiveTask(
      { taskId: task._id },
      {
        onSuccess: () =>
          toast.success(task.isArchived ? "Task unarchived" : "Task archived"),
        onError: (error: any) => {
          toast.error(error.response?.data.message);
        },
      }
    );
  };

  const handleDeleteTask = () => {
    deleteTask(
      { taskId: task._id },
      {
        onSuccess: () => {
          toast.success("Task deleted");
          navigate(-1);
        },
        onError: (error: any) => {
          toast.error(error.response?.data.message);
        },
      }
    );
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High":
        return "destructive";
      case "Medium":
        return "default";
      case "Low":
        return "secondary";
      default:
        return "outline";
    }
  };

  return (
    <div className="container mx-auto max-w-7xl p-4 py-6 md:p-8">
      {/* --- Top Navigation Header --- */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button
            onClick={goBack}
            variant="ghost"
            className="pl-0 hover:bg-transparent hover:underline"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>

          {task.isArchived && (
            <Badge
              variant="secondary"
              className="border-dashed border-gray-400"
            >
              Archived
            </Badge>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleWatchTask}
            disabled={isWatching}
          >
            {isUserWatching ? (
              <>
                <EyeOff className="mr-2 h-4 w-4" />
                Unwatch
              </>
            ) : (
              <>
                <EyeIcon className="mr-2 h-4 w-4" />
                Watch
              </>
            )}
          </Button>

          {/* Only Managers can Archive/Delete */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleArchiveTask}
            disabled={isArchived || !isManager} // Added manager check here too if you want
          >
            {task.isArchived ? "Unarchive" : "Archive"}
          </Button>
        </div>
      </div>

      {/* --- Main Grid Layout --- */}
      <div className="grid grid-cols-1 gap-8 xl:grid-cols-3">
        {/* --- LEFT COLUMN (Main Content) --- */}
        <div className="space-y-6 xl:col-span-2">
          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
              <div className="space-y-1">
                <Badge
                  variant={getPriorityColor(task.priority)}
                  className="capitalize"
                >
                  {task.priority} Priority
                </Badge>
                <div className="text-sm text-muted-foreground">
                  Created{" "}
                  {formatDistanceToNow(new Date(task.createdAt), {
                    addSuffix: true,
                  })}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <TaskStatusSelector status={task.status} taskId={task._id} />
                <Button
                  variant="destructive"
                  size="icon"
                  className="h-9 w-9"
                  onClick={handleDeleteTask}
                  title="Delete Task"
                  disabled={isDeleting || !isManager}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="mb-8">
              <TaskTitle
                title={task.title}
                taskId={task._id}
                isManager={isManager}
              />
            </div>
            <div className="mb-8">
              <h3 className="mb-2 text-sm font-medium text-muted-foreground">
                Description
              </h3>
              <TaskDescription
                description={task.description || ""}
                taskId={task._id}
                isManager={isManager}
              />
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 bg-muted/20 p-4 rounded-lg">
              <div className="space-y-2">
                <h4 className="text-xs font-semibold uppercase text-muted-foreground">
                  Assignees
                </h4>
                <TaskAssigneesSelector
                  task={task}
                  assignees={task.assignees}
                  projectMembers={project.members as any}
                />
              </div>
              <div className="space-y-2">
                <h4 className="text-xs font-semibold uppercase text-muted-foreground">
                  Priority
                </h4>
                <TaskPrioritySelector
                  priority={task.priority}
                  taskId={task._id}
                  disabled={!isManager}
                />
              </div>
            </div>
            <div className="mt-8 border-t pt-8">
              <SubTaskDetails
                subTasks={task.subtasks || []}
                taskId={task._id}
                isManager={isManager}
              />
            </div>

            <div className="grid space-y-5">
              <UploadFile taskId={task._id} />

              <FileDescription task={task} />
            </div>
          </div>

          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <CommentSection
              taskId={task._id}
              members={project.members as any}
            />
          </div>
        </div>

        {/* --- RIGHT COLUMN (Sidebar) --- */}
        <div className="flex flex-col gap-6 xl:col-span-1">
          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <h3 className="mb-4 font-semibold">Watchers</h3>
            <Watchers watchers={task.watchers || []} />
          </div>

          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <h3 className="mb-4 font-semibold">Activity</h3>
            <div className="max-h-125 overflow-y-auto pr-2 custom-scrollbar">
              <TaskActivity resourceId={task._id} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
