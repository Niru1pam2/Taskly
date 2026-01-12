import { EditIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";
import { useUpdateTaskDescriptionMutation } from "~/hooks/use-task";

interface props {
  description: string;
  taskId: string;
  isManager: boolean;
}

export default function TaskDescription({
  taskId,
  description,
  isManager,
}: props) {
  const [isEditing, setIsEditing] = useState(false);
  const [newDescription, setNewDescription] = useState(description);

  const { mutate, isPending } = useUpdateTaskDescriptionMutation();

  const updateDescription = () => {
    mutate(
      {
        taskId,
        description: newDescription,
      },
      {
        onSuccess: () => {
          setIsEditing(false);
          toast.success("Description updated successfully");
        },
        onError: () => {
          toast.error("Failed to update Description");
        },
      }
    );
  };

  return (
    <div className="flex items-center gap-2 justify-center">
      {isEditing ? (
        <Textarea
          className="text-xl font-semibold "
          value={newDescription}
          onChange={(e) => setNewDescription(e.target.value)}
          disabled={isPending || !isManager}
        />
      ) : (
        <h2 className="text-sm md:text-base text-pretty flex-1 font-semibold text-muted-foreground">
          {description}
        </h2>
      )}

      {isEditing ? (
        <Button
          className="py-0"
          size={"sm"}
          onClick={updateDescription}
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
