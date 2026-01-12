import { isAxiosError } from "axios";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  useAddSubTaskMutation,
  useUpdateSubTaskMutation,
} from "~/hooks/use-task";
import { cn } from "~/lib/utils";
import type { Subtask } from "~/types";

export default function SubTaskDetails({
  subTasks,
  taskId,
  isManager,
}: {
  subTasks: Subtask[];
  taskId: string;
  isManager: boolean;
}) {
  const [newSubTask, setNewSubTask] = useState("");

  const { mutate: addSubTask, isPending } = useAddSubTaskMutation();
  const { mutate: updateSubTask, isPending: isUpdating } =
    useUpdateSubTaskMutation();

  const handleToggleTask = (subTaskId: string, checked: boolean) => {
    updateSubTask(
      {
        taskId,
        subTaskId,
        completed: checked,
      },
      {
        onSuccess: () => {
          toast.success("Sub task updated");
        },
        onError: (error) => {
          if (isAxiosError(error)) {
            toast.error(error.response?.data.message);
          }

          toast.error("Something went wrong, Please try again!");
        },
      }
    );
  };

  const handleAddSubtask = () => {
    addSubTask(
      { taskId, title: newSubTask },
      {
        onSuccess: () => {
          setNewSubTask("");
          toast.success("Sub Task added");
        },
        onError: (error) => {
          if (isAxiosError(error)) {
            toast.error(error.response?.data.message);
          }

          toast.error("Something went wrong, Please try again!");
        },
      }
    );
  };

  return (
    <div className="mb-6">
      <h3 className="text-sm font-medium text-muted-foreground mb-0">
        Sub Tasks
      </h3>
      <div className="space-y-2 mb-2">
        {subTasks.length > 0 ? (
          subTasks.map((subTask) => (
            <div key={subTask._id} className="flex items-center space-x-2">
              <Checkbox
                id={subTask._id}
                checked={subTask.completed}
                onCheckedChange={(checked) =>
                  handleToggleTask(subTask._id, !!checked)
                }
                disabled={isUpdating}
              />

              <Label
                className={cn(
                  "text-sm",
                  subTask.completed ? "line-through text-muted-foreground" : ""
                )}
              >
                {subTask.title}
              </Label>
            </div>
          ))
        ) : (
          <div className="text-sm text-muted-foreground">No Sub Task</div>
        )}
      </div>

      <div className="flex">
        <Input
          placeholder="Add a sub task"
          value={newSubTask}
          onChange={(e) => setNewSubTask(e.target.value)}
          className="mr-2"
          disabled={isPending || !isManager}
        />

        <Button onClick={handleAddSubtask} disabled={isPending || !isManager}>
          Add
        </Button>
      </div>
    </div>
  );
}
