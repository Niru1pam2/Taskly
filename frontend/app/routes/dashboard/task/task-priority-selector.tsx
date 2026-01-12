import { isAxiosError } from "axios";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { useUpdateTaskPriorityMutation } from "~/hooks/use-task";
import type { TaskPriority } from "~/types";

export default function TaskPrioritySelector({
  priority,
  taskId,
  disabled,
}: {
  priority: TaskPriority;
  taskId: string;
  disabled: boolean;
}) {
  const { mutate, isPending } = useUpdateTaskPriorityMutation();

  const handlePriorityChange = (value: string) => {
    mutate(
      { taskId, priority: value as TaskPriority },
      {
        onSuccess: () => {
          toast.success("Priority updated");
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
      value={priority || ""}
      onValueChange={handlePriorityChange}
      disabled={isPending || disabled}
    >
      <SelectTrigger>
        <SelectValue placeholder={priority} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="Low">Low</SelectItem>
        <SelectItem value="Medium">Medium</SelectItem>
        <SelectItem value="High">High</SelectItem>
      </SelectContent>
    </Select>
  );
}
