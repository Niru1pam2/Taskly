import { useAuth } from "~/providers/auth-context";
import type { Workspace } from "~/types";
import { Button } from "../ui/button";
import {
  BellIcon,
  DoorClosed,
  PlusCircle,
  UserIcon,
  Loader2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Link, useLoaderData, useLocation, useNavigate } from "react-router";
import WorkspaceAvatar from "../workspace/workspace-avatar";
import { ModeToggle } from "../mode-toggle";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { getMyActivities } from "~/hooks/use-task";
import { formatDistanceToNow } from "date-fns";
import { ScrollArea } from "../ui/scroll-area"; // Optional: Use standard div if you don't have ScrollArea
import { Separator } from "../ui/separator";

interface props {
  onWorkspaceSelected: (workspace: Workspace) => void;
  selectedWorkspace: Workspace | null;
  onCreateWorkspace: () => void;
}

export default function Header({
  onCreateWorkspace,
  onWorkspaceSelected,
  selectedWorkspace,
}: props) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { workspaces } = useLoaderData() as { workspaces: Workspace[] };

  // 1. Ensure safe default for array
  const { data: myActivites = [], isPending } = getMyActivities() as {
    data: any[];
    isPending: boolean;
  };

  const isOnWorkspacePage = useLocation().pathname.includes("/workspace");

  const handleOnClick = (workspace: Workspace) => {
    onWorkspaceSelected(workspace);
    if (isOnWorkspacePage) {
      navigate(`/workspaces/${workspace._id}`);
    } else {
      const basePath = location.pathname;
      navigate(`${basePath}?workspaceId=${workspace._id}`);
    }
  };

  return (
    <div className="bg-background sticky top-0 z-50 border-b">
      <div className="flex h-14 items-center justify-between px-4 sm:px-6 lg:px-8 py-4">
        {/* Workspace Selector */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant={"outline"}>
              {selectedWorkspace ? (
                <>
                  {selectedWorkspace.color && (
                    <WorkspaceAvatar
                      color={selectedWorkspace.color}
                      name={selectedWorkspace.name}
                    />
                  )}
                  <span className="font-medium">{selectedWorkspace.name}</span>
                </>
              ) : (
                <span>Select Workspace</span>
              )}
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent>
            <DropdownMenuLabel>Workspace</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              {workspaces.length === 0 && (
                <p className="p-2 text-sm">No workspace</p>
              )}
              {workspaces?.map((workspace) => (
                <DropdownMenuItem
                  key={workspace._id}
                  onClick={() => handleOnClick(workspace)}
                >
                  {workspace.color && (
                    <WorkspaceAvatar
                      color={workspace.color}
                      name={workspace.name}
                    />
                  )}
                  <span className="ml-2">{workspace.name}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={onCreateWorkspace}>
                <PlusCircle className="size-4 mr-2" />
                Create Workspace
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="flex items-center gap-2">
          <ModeToggle />

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size={"icon"} className="relative">
                <BellIcon className="h-4 w-4" />
                {myActivites.length > 0 && (
                  <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-red-600 border-2 border-background" />
                )}
              </Button>
            </PopoverTrigger>

            <PopoverContent className="w-80 p-0" align="end">
              <div className="p-4 border-b">
                <h4 className="font-semibold leading-none">Notifications</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Recent activity on your tasks
                </p>
              </div>

              <div className="max-h-87.5 overflow-y-auto">
                {isPending ? (
                  <div className="flex justify-center p-6">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : myActivites.length === 0 ? (
                  <div className="p-8 text-center text-sm text-muted-foreground">
                    No new notifications
                  </div>
                ) : (
                  <div className="grid">
                    {myActivites.map((activity: any) => (
                      <div
                        key={activity._id}
                        className="flex gap-3 p-4 hover:bg-muted/50 transition-colors border-b last:border-0"
                      >
                        {/* Actor Avatar */}
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={activity.user?.profilePicture} />
                          <AvatarFallback>
                            {activity.user?.name?.charAt(0) || "U"}
                          </AvatarFallback>
                        </Avatar>

                        <div className="space-y-1">
                          <p className="text-sm leading-snug">
                            <span className="font-semibold">
                              {activity.user?.name}
                            </span>{" "}
                            <span className="text-muted-foreground">
                              {activity.details?.description ||
                                "updated a task"}
                            </span>
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {activity.createdAt
                              ? formatDistanceToNow(
                                  new Date(activity.createdAt),
                                  {
                                    addSuffix: true,
                                  }
                                )
                              : "Just now"}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </PopoverContent>
          </Popover>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger className="outline-none">
              <Avatar>
                <AvatarImage src={user?.profilePicture} />
                <AvatarFallback>
                  {user?.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link
                  to={"/user/profile"}
                  className="cursor-pointer w-full flex gap-2"
                >
                  <UserIcon className="h-4 w-4" />
                  Profile
                </Link>
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={logout}
                className="cursor-pointer flex gap-2 text-red-600 focus:text-red-600"
              >
                <DoorClosed className="h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
