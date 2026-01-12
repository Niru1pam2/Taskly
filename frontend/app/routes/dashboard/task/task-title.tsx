import { EditIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { useUpdateTaskTitleMutation } from "~/hooks/use-task";

interface props {
  title: string;
  taskId: string;
  isManager: boolean;
}

export default function TaskTitle({ taskId, title, isManager }: props) {
  const [isEditing, setIsEditing] = useState(false);
  const [newTitle, setNewTitle] = useState(title);

  const { mutate, isPending } = useUpdateTaskTitleMutation();

  const updateTitle = () => {
    mutate(
      {
        taskId,
        title: newTitle,
      },
      {
        onSuccess: () => {
          setIsEditing(false);
          toast.success("Title updated successfully");
        },
        onError: () => {
          toast.error("Failed to update title");
        },
      }
    );
  };

  return (
    <div className="flex items-center gap-2 justify-center">
      {isEditing ? (
        <Input
          className="text-xl font-semibold "
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          disabled={isPending || !isManager}
        />
      ) : (
        <h2 className="text-xl flex-1 font-semibold">{title}</h2>
      )}

      {isEditing ? (
        <Button
          className="py-0"
          size={"sm"}
          onClick={updateTitle}
          disabled={isPending || !isManager}
        >
          Save
        </Button>
      ) : (
        <EditIcon
          className="size-3 cursor-pointer"
          onClick={() => setIsEditing(true)}
        />
      )}
    </div>
  );
}
