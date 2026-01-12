import {
  Archive,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  ListTodo,
  LogOut,
  Settings,
  Users,
  Workflow,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";
import { cn } from "~/lib/utils";
import { useAuth } from "~/providers/auth-context";
import type { Workspace } from "~/types";
import { Button } from "../ui/button";
import { ScrollArea } from "../ui/scroll-area";
import SidebarNav from "./sidebar-nav";
import { useLogoutMutation } from "~/hooks/use-auth";
import { toast } from "sonner";

export default function Sidebar({
  currentWorkspace,
}: {
  currentWorkspace: Workspace | null;
}) {
  const { mutate: signOut, isPending } = useLogoutMutation();
  const { logout } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const logoutUser = () => {
    signOut(undefined, {
      onSuccess: () => {
        logout();
        toast.success("Logged out successfully");
      },
      onError: () => {
        toast.error("Failed to logout. Please try again.");
      },
    });
  };

  const navItems = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "My Tasks",
      href: "/my-tasks",
      icon: ListTodo,
    },
    {
      title: "Workspaces",
      href: "/workspaces",
      icon: Workflow,
    },
    {
      title: "Members",
      href: "/members", // Make sure you have a route for this
      icon: Users,
    },
    {
      title: "Archived", // Fixed typo: Achieved -> Archived
      href: "/archived", // Make sure you have a route for this
      icon: Archive,
    },
    {
      title: "Settings",
      href: "/settings",
      icon: Settings,
    },
  ];

  return (
    <div
      className={cn(
        "flex flex-col border-r bg-card transition-all duration-300 min-h-screen ",
        isCollapsed ? "w-16 " : "w-64"
      )}
    >
      {/* Header */}
      <div className="flex h-16 items-center border-b px-4 justify-between">
        <Link
          to="/dashboard"
          className="flex items-center gap-2 overflow-hidden"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Zap className="h-5 w-5 fill-current" />
          </div>
          {!isCollapsed && (
            <span className="font-bold text-lg whitespace-nowrap">Taskly</span>
          )}
        </Link>

        {/* Desktop Toggle Button */}
        <Button
          className="hidden md:flex h-8 w-8"
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? (
            <ChevronRight className="size-4" />
          ) : (
            <ChevronLeft className="size-4" />
          )}
        </Button>
      </div>

      {/* Nav Items */}
      <ScrollArea className="flex-1 py-4">
        <SidebarNav
          items={navItems}
          isCollapsed={isCollapsed}
          className="px-2"
          currentWorkspace={currentWorkspace}
        />
      </ScrollArea>

      {/* Footer / Logout */}
      <div className="p-4 border-t">
        <Button
          onClick={logoutUser}
          variant="ghost"
          className={cn(
            "w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50",
            isCollapsed && "justify-center px-0"
          )}
        >
          <LogOut className={cn("size-4", !isCollapsed && "mr-2")} />
          {!isCollapsed && <span>Logout</span>}
        </Button>
      </div>
    </div>
  );
}
