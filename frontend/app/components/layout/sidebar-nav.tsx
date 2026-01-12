import type { LucideIcon } from "lucide-react";
import { cn } from "~/lib/utils";
import type { Workspace } from "~/types";
import { Button } from "../ui/button";
import { useLocation, useNavigate } from "react-router";

interface Props {
  items: {
    title: string;
    href: string;
    icon: LucideIcon;
  }[];
  isCollapsed: boolean;
  className?: string;
  currentWorkspace: Workspace | null;
}

export default function SidebarNav({
  className,
  currentWorkspace,
  isCollapsed,
  items,
}: Props) {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className={cn("flex flex-col gap-y-2", className)}>
      {items.map((item) => {
        const Icon = item.icon;

        const isActive = location.pathname === item.href;

        const handleClick = () => {
          if (item.href === "/workspaces") {
            navigate(item.href);
            return;
          }

          // 2. If we have a workspace selected, append it as a QUERY PARAM (?workspaceId=...)
          // NOT as a path slash (which causes 404s)
          if (currentWorkspace && currentWorkspace._id) {
            navigate(`${item.href}?workspaceId=${currentWorkspace._id}`);
          } else {
            // 3. Fallback for no workspace selected
            navigate(item.href);
          }
        };

        return (
          <Button
            key={item.href}
            onClick={handleClick}
            variant={isActive ? "secondary" : "ghost"} // 'secondary' usually looks better for active state than 'outline'
            className={cn(
              "justify-start w-full", // Default layout
              isActive &&
                "bg-purple-100 text-purple-700 hover:bg-purple-100/80 hover:text-purple-700 font-medium", // Active Styling
              isCollapsed ? "justify-center px-2" : "px-4" // Collapse logic
            )}
            title={isCollapsed ? item.title : undefined} // Tooltip for collapsed state
          >
            <Icon
              className={cn(
                "size-4",
                // If not collapsed, add margin to separate from text
                !isCollapsed && "mr-2"
              )}
            />

            {!isCollapsed && <span className="truncate">{item.title}</span>}
          </Button>
        );
      })}
    </nav>
  );
}
