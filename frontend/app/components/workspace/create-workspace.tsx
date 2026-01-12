import { zodResolver } from "@hookform/resolvers/zod";
import type { Z } from "node_modules/react-router/dist/development/router-CwNp5l9u.mjs";
import { useForm } from "react-hook-form";
import type z from "zod";
import { workspaceSchema } from "~/lib/schema";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { cn } from "~/lib/utils";
import { Button } from "../ui/button";
import { useCreateWorkspace } from "~/hooks/use-workspace";
import { toast } from "sonner";
import { useNavigate } from "react-router";
import { isAxiosError } from "axios";

interface props {
  isCreatingWorkspace: boolean;
  setIsCreatingWorkspace: (isCreatingWorkspace: boolean) => void;
}

const colors = {
  red: "#FF0000",
  green: "#008000",
  blue: "#0000FF",
  yellow: "#FFFF00",
  orange: "#FFA500",
  purple: "#800080",
  pink: "#FFC0CB",
  black: "#000000",
  white: "#FFFFFF",
};

export type workspaceForm = z.infer<typeof workspaceSchema>;

export default function CreateWorkspace({
  isCreatingWorkspace,
  setIsCreatingWorkspace,
}: props) {
  const navigate = useNavigate();
  const form = useForm<workspaceForm>({
    resolver: zodResolver(workspaceSchema),
    defaultValues: {
      name: "",
      color: colors.blue,
      description: "",
    },
  });

  const { mutate, isPending } = useCreateWorkspace();

  const onSubmit = (data: workspaceForm) => {
    mutate(data, {
      onSuccess: (data: any) => {
        setIsCreatingWorkspace(false);
        form.reset();
        toast.success("Workspace created");
        navigate(`/workspaces/${data._id}`);
      },

      onError: (error) => {
        if (isAxiosError(error)) {
          const errorMessage = error.response?.data.message;
          toast.error(errorMessage);
        } else {
          toast.error("Internal server error");
        }
      },
    });
  };

  return (
    <Dialog
      open={isCreatingWorkspace}
      onOpenChange={setIsCreatingWorkspace}
      modal={true}
    >
      <DialogContent className="max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Workspace</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Workspace name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="Workspace name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Color</FormLabel>
                    <FormControl>
                      <div className="flex gap-3 flex-wrap">
                        {Object.entries(colors).map(([_, hex]) => (
                          <div
                            key={_}
                            onClick={() => field.onChange(hex)}
                            className={cn(
                              "size-6 rounded-full cursor-pointer",
                              field.value === hex &&
                                "ring-2 ring-offset-2 ring-blue-500"
                            )}
                            style={{
                              backgroundColor: hex,
                            }}
                          ></div>
                        ))}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Creating..." : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
