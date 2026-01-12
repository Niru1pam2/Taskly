import { isAxiosError } from "axios";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { useUpdateTaskStatusMutation } from "~/hooks/use-task";
import type { TaskStatus } from "~/types";

export default function TaskStatusSelector({
  status,
  taskId,
}: {
  status: TaskStatus;
  taskId: string;
}) {
  const { mutate, isPending } = useUpdateTaskStatusMutation();

  const handleStatusChange = (value: string) => {
    mutate(
      { taskId, status: value as TaskStatus },
      {
        onSuccess: () => {
          toast.success("Status updated");
        },
        onError: (error: any) => {
          if (isAxiosError(error)) {
            toast.error(error.response?.data.message);
          }
          toast.error("Server Error");
          console.log(error);
        },
      }
    );
  };

  return (
    <Select
      value={status || ""}
      onValueChange={handleStatusChange}
      disabled={isPending}
    >
      <SelectTrigger>
        <SelectValue placeholder={status} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="To Do">Todo</SelectItem>
        <SelectItem value="In Progress">In Progress</SelectItem>
        <SelectItem value="Done">Done</SelectItem>
        <SelectItem value="Review">Review</SelectItem>
      </SelectContent>
    </Select>
  );
}
