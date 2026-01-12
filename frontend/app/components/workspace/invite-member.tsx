import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type z from "zod";
import { inviteMemberSchema } from "~/lib/schema";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { useState } from "react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { Check, Copy, Mail } from "lucide-react";
import { useInviteMemberMutation } from "~/hooks/use-workspace";
import { toast } from "sonner";
import { isAxiosError } from "axios";

interface props {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  workspaceId: string;
}

const ROLES = ["admin", "member", "viewer"] as const;

export type InviteMemberFormData = z.infer<typeof inviteMemberSchema>;

export default function InviteMemberDialog({
  isOpen,
  onOpenChange,
  workspaceId,
}: props) {
  const [inviteTab, setInviteTab] = useState("email");
  const [linkCopied, setLinkCopied] = useState(false);
  const form = useForm<InviteMemberFormData>({
    resolver: zodResolver(inviteMemberSchema),
    defaultValues: {
      email: "",
      role: "member",
    },
  });

  const { mutate, isPending } = useInviteMemberMutation();
  const onSubmit = async (data: InviteMemberFormData) => {
    if (!workspaceId) {
      return;
    }

    mutate(
      {
        workspaceId,
        ...data,
      },
      {
        onSuccess: () => {
          toast.success("Invite sent");
          form.reset();
          onOpenChange(false);
          setInviteTab("email");
        },
        onError: (error: any) => {
          if (isAxiosError(error)) {
            toast.error(error.response?.data.message);
          }
          toast.error(error.response?.data.message);
        },
      }
    );
  };

  const handleCopyInviteLink = () => {
    navigator.clipboard.writeText(
      `${window.location.origin}/workspace-invite/${workspaceId}`
    );
    setLinkCopied(true);

    setTimeout(() => {
      setLinkCopied(false);
    }, 3000);
  };

  return (
    <Dialog onOpenChange={onOpenChange} open={isOpen} modal>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite to Workspace</DialogTitle>
        </DialogHeader>

        <Tabs
          defaultValue="email"
          value={inviteTab}
          onValueChange={setInviteTab}
        >
          <TabsList>
            <TabsTrigger value="email" disabled={isPending}>
              Send Email
            </TabsTrigger>
            <TabsTrigger value="link" disabled={isPending}>
              Send Link
            </TabsTrigger>
          </TabsList>

          <TabsContent value="email">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)}>
                    <div className="flex flex-col space-y-6 w-full">
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email Address</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="role"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Role</FormLabel>
                            <FormControl>
                              <div className="flex gap-3 flex-wrap">
                                {ROLES.map((role) => (
                                  <Label
                                    key={role}
                                    className="flex items-center cursor-pointer gap-2"
                                  >
                                    <Input
                                      type="radio"
                                      value={role}
                                      checked={field.value === role}
                                      onChange={() => field.onChange(role)}
                                    />
                                    <span className="capitalize">{role}</span>
                                  </Label>
                                ))}
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <Button
                      className="mt-2 w-full"
                      type="submit"
                      disabled={isPending}
                    >
                      <Mail />
                      Send
                    </Button>
                  </form>
                </Form>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="link">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label>Share this link to invite people</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    readOnly
                    value={`${window.location.origin}/workspace-invite/${workspaceId}`}
                  />
                  <Button onClick={handleCopyInviteLink} disabled={isPending}>
                    {linkCopied ? (
                      <>
                        <Check />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy />
                        Copy
                      </>
                    )}
                  </Button>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Anyone with the link can join this workpsace
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
