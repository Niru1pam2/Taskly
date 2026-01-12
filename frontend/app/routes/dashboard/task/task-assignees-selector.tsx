import { isAxiosError } from "axios";
import { useState } from "react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import { useUpdateTaskAssigneesMutation } from "~/hooks/use-task";
import type { ProjectMemberRole, Task, User } from "~/types";
import { useAuth } from "~/providers/auth-context"; // ✅ Import Auth
import { cn } from "~/lib/utils"; // ✅ Import Utils for cleaner classes
import { Plus } from "lucide-react";

export default function TaskAssigneesSelector({
  task,
  assignees,
  projectMembers,
}: {
  task: Task;
  assignees: User[];
  projectMembers: { user: User; role: ProjectMemberRole }[];
}) {
  const { user } = useAuth();

  const currentMember = projectMembers.find((m) => m.user._id === user?._id);
  const isManager = currentMember?.role === "manager";

  const [selectedIds, setSelectedIds] = useState(
    assignees.map((assignee) => assignee._id)
  );

  const [dropDownOpen, setDropDownOpen] = useState(false);

  const { mutate, isPending } = useUpdateTaskAssigneesMutation();

  const handleSelectAll = () => {
    const allIds = projectMembers.map((m) => m.user._id);
    setSelectedIds(allIds);
  };

  const handleUnSelectAll = () => {
    setSelectedIds([]);
  };

  const handleSelect = (id: string) => {
    let newSelected: string[] = [];

    if (selectedIds.includes(id)) {
      newSelected = selectedIds.filter((sid) => sid !== id);
    } else {
      newSelected = [...selectedIds, id];
    }

    setSelectedIds(newSelected);
  };

  const handleSave = () => {
    mutate(
      {
        taskId: task._id,
        assigneeIds: selectedIds,
      },
      {
        onSuccess: () => {
          setDropDownOpen(false);
          toast.success("Assignees updated successfully");
        },
        onError: (error) => {
          if (isAxiosError(error)) {
            toast.error(error.response?.data.message);
          } else {
            toast.error("Internal server error");
          }
          console.log(error);
        },
      }
    );
  };

  return (
    <div className="mb-6 relative">
      <div className="flex items-center gap-2 mb-3">
        <div className="flex -space-x-2 overflow-hidden">
          {selectedIds.length === 0 ? (
            <div className="h-8 w-8 rounded-full bg-muted border-2 border-background flex items-center justify-center">
              <span className="text-[10px] text-muted-foreground">?</span>
            </div>
          ) : (
            projectMembers
              .filter((member) => selectedIds.includes(member.user._id))
              .map((m) => (
                <div
                  key={m.user._id}
                  title={m.user.name}
                  className="inline-block h-8 w-8 rounded-full ring-2 ring-background z-0 hover:z-10 transition-all"
                >
                  <Avatar className="h-full w-full">
                    <AvatarImage src={m.user.profilePicture} />
                    <AvatarFallback className="text-xs">
                      {m.user.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                </div>
              ))
          )}
        </div>

        <Button
          variant="outline"
          size="sm"
          className="h-8 w-8 rounded-full p-0 flex items-center justify-center"
          onClick={() => setDropDownOpen(!dropDownOpen)}
          disabled={!isManager} // ✅ 3. Disable if not manager
          title={
            !isManager ? "Only managers can assign members" : "Manage assignees"
          }
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {dropDownOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setDropDownOpen(false)}
          />

          <div className="absolute z-50 mt-1 w-64 bg-popover text-popover-foreground border rounded-md shadow-md animate-in fade-in-0 zoom-in-95">
            <div className="flex justify-between px-3 py-2 border-b bg-muted/50 rounded-t-md">
              <Button
                variant="ghost"
                size="sm"
                className="h-auto px-2 py-1 text-xs"
                onClick={handleSelectAll}
              >
                Select All
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-auto px-2 py-1 text-xs text-destructive hover:text-destructive"
                onClick={handleUnSelectAll}
              >
                Clear
              </Button>
            </div>

            <div className="max-h-60 overflow-y-auto py-1">
              {projectMembers.map((m) => (
                <label
                  key={m.user._id}
                  className="flex items-center px-3 py-2 cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                  <Checkbox
                    checked={selectedIds.includes(m.user._id)}
                    onCheckedChange={() => handleSelect(m.user._id)}
                    className="mr-3"
                  />

                  <Avatar className="h-6 w-6 mr-2">
                    <AvatarImage src={m.user.profilePicture} />
                    <AvatarFallback className="text-[10px]">
                      {m.user.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>

                  <span className="text-sm truncate">{m.user.name}</span>
                </label>
              ))}
            </div>

            <div className="flex justify-end gap-2 px-3 py-2 border-t bg-muted/50 rounded-b-md">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                onClick={() => setDropDownOpen(false)}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                className="h-7 text-xs"
                onClick={handleSave}
                disabled={isPending}
              >
                {isPending ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
