import { format } from "date-fns";
import {
  ArrowUpRight,
  Calendar,
  CheckCircle2,
  Circle,
  Clock,
  FilterIcon,
  Search,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router";
import Loader from "~/components/loader";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Input } from "~/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { useGetMyTasksQuery } from "~/hooks/use-task";
import type { Task } from "~/types";

export default function MyTasks() {
  const [searchParams, setSearchParams] = useSearchParams();

  // URL Params State
  const filter = searchParams.get("filter") || "all";
  const sort = searchParams.get("sort") || "desc";
  const searchParam = searchParams.get("search") || "";

  // Local State for Debouncing
  const [searchInput, setSearchInput] = useState(searchParam);

  const { data: myTasks, isLoading } = useGetMyTasksQuery() as {
    data: Task[];
    isLoading: boolean;
  };

  // Helper to update URL
  const updateParams = (key: string, value: string) => {
    setSearchParams(
      (prev) => {
        if (value) {
          prev.set(key, value);
        } else {
          prev.delete(key);
        }
        return prev;
      },
      { replace: true }
    );
  };

  // Sync Input with Debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== searchParam) {
        updateParams("search", searchInput);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput, searchParam]);

  // Handle Back Button / External URL Changes
  useEffect(() => {
    if (searchParam !== searchInput) {
      setSearchInput(searchParam);
    }
  }, [searchParam]);

  const handleFilterChange = (newFilter: string) =>
    updateParams("filter", newFilter);
  const handleSortChange = () =>
    updateParams("sort", sort === "asc" ? "desc" : "asc");

  // --- Filtering Logic ---
  const filteredTasks =
    myTasks?.length > 0
      ? myTasks
          .filter((task) => {
            if (filter === "all") return true;
            if (filter === "toDo") return task.status === "To Do";
            if (filter === "in-progress") return task.status === "In Progress";
            if (filter === "done") return task.status === "Done";
            if (filter === "archived") return task.isArchived;
            if (filter === "high") return task.priority === "High";
            return true;
          })
          .filter(
            (task) =>
              task.title.toLowerCase().includes(searchParam.toLowerCase()) ||
              (task.description &&
                task.description
                  .toLowerCase()
                  .includes(searchParam.toLowerCase()))
          )
      : [];

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (a.dueDate && b.dueDate) {
      const dateA = new Date(a.dueDate).getTime();
      const dateB = new Date(b.dueDate).getTime();
      return sort === "asc" ? dateA - dateB : dateB - dateA;
    }
    return 0;
  });

  // --- Grouping for Board View ---
  const taskColumns = {
    "To Do": sortedTasks.filter((t) => t.status === "To Do"),
    "In Progress": sortedTasks.filter((t) => t.status === "In Progress"),
    Done: sortedTasks.filter((t) => t.status === "Done"),
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High":
        return "destructive";
      case "Medium":
        return "default"; // or "warning" if you have it
      case "Low":
        return "secondary";
      default:
        return "outline";
    }
  };

  if (isLoading) return <Loader />;

  return (
    <div className="space-y-6">
      {/* --- Header Section --- */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Tasks</h1>
          <p className="text-sm text-muted-foreground">
            Manage your tasks across all projects
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          {/* Search Bar */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tasks..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-9 pr-8"
            />
            {searchInput && (
              <button
                onClick={() => setSearchInput("")}
                className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Controls Group */}
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleSortChange}>
              {sort === "asc" ? "Oldest" : "Newest"}
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <FilterIcon className="mr-2 h-3.5 w-3.5" />
                  Filter:{" "}
                  <span className="ml-1 capitalize">
                    {filter.replace("-", " ")}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleFilterChange("all")}>
                  All Tasks
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleFilterChange("toDo")}>
                  To Do
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleFilterChange("in-progress")}
                >
                  In Progress
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleFilterChange("done")}>
                  Done
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Other</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => handleFilterChange("high")}>
                  High Priority
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleFilterChange("archived")}
                >
                  Archived
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      <Tabs defaultValue="list" className="w-full">
        <div className="flex items-center justify-between mb-4">
          <TabsList>
            <TabsTrigger value="list">List View</TabsTrigger>
            <TabsTrigger value="board">Board View</TabsTrigger>
          </TabsList>
          <div className="text-xs text-muted-foreground hidden sm:block">
            Showing {sortedTasks.length} tasks
          </div>
        </div>

        {/* --- LIST VIEW --- */}
        <TabsContent value="list" className="mt-0">
          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                {sortedTasks.length === 0 ? (
                  <div className="flex h-40 items-center justify-center text-muted-foreground">
                    No tasks found matching your filters.
                  </div>
                ) : (
                  sortedTasks.map((task) => (
                    <div
                      key={task._id}
                      className="group flex flex-col gap-3 p-4 hover:bg-muted/40 sm:flex-row sm:items-center sm:justify-between"
                    >
                      {/* Left: Icon & Title */}
                      <div className="flex items-start gap-3 sm:items-center">
                        <div className="mt-1 sm:mt-0">
                          {task.status === "Done" ? (
                            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                          ) : task.status === "In Progress" ? (
                            <Clock className="h-5 w-5 text-blue-500" />
                          ) : (
                            <Circle className="h-5 w-5 text-muted-foreground" />
                          )}
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Link
                              to={`/workspaces/${task.project.workspace}/projects/${task.project._id}/tasks/${task._id}`}
                              className="font-medium leading-none hover:text-primary hover:underline"
                            >
                              {task.title}
                            </Link>
                            {task.priority === "High" && (
                              <Badge
                                variant="destructive"
                                className="h-5 px-1.5 text-[10px]"
                              >
                                High
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{task.project.title}</span>
                            <span>•</span>
                            <span>
                              {format(new Date(task.updatedAt), "MMM d")}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Meta & Actions */}
                      <div className="flex items-center justify-between gap-4 sm:justify-end">
                        {task.dueDate && (
                          <div className="flex items-center text-xs text-muted-foreground">
                            <Calendar className="mr-1 h-3.5 w-3.5" />
                            {format(new Date(task.dueDate), "MMM d")}
                          </div>
                        )}
                        <Badge variant="outline" className="capitalize">
                          {task.status}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <ArrowUpRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* --- BOARD VIEW --- */}
        <TabsContent value="board" className="mt-0 h-full">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3 lg:gap-8 h-full">
            {Object.entries(taskColumns).map(([status, tasks]) => (
              <div
                key={status}
                className="flex h-full flex-col rounded-lg bg-muted/30 p-4 border border-border/50"
              >
                {/* Column Header */}
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="font-semibold flex items-center gap-2">
                    {status === "To Do" && (
                      <Circle className="h-4 w-4 text-muted-foreground" />
                    )}
                    {status === "In Progress" && (
                      <Clock className="h-4 w-4 text-blue-500" />
                    )}
                    {status === "Done" && (
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    )}
                    {status}
                  </h3>
                  <Badge
                    variant="secondary"
                    className="rounded-full px-2 text-xs"
                  >
                    {tasks.length}
                  </Badge>
                </div>

                {/* Cards Container */}
                <div className="flex flex-1 flex-col gap-3 overflow-y-auto min-h-50">
                  {tasks.length === 0 ? (
                    <div className="flex h-full flex-col items-center justify-center rounded-md border border-dashed p-4 text-center text-sm text-muted-foreground opacity-50">
                      <p>No tasks</p>
                    </div>
                  ) : (
                    tasks.map((task) => (
                      <Card
                        key={task._id}
                        className="shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
                      >
                        <CardContent className="p-4 space-y-3">
                          {/* Top: Project Name & Priority */}
                          <div className="flex justify-between items-start">
                            <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground truncate max-w-25">
                              {task.project.title}
                            </span>
                            <Badge
                              variant={getPriorityColor(task.priority)}
                              className="text-[10px] h-5 px-1.5"
                            >
                              {task.priority}
                            </Badge>
                          </div>

                          {/* Main: Title */}
                          <Link
                            to={`/workspaces/${task.project.workspace}/projects/${task.project._id}/tasks/${task._id}`}
                            className="block font-medium leading-tight hover:text-primary hover:underline"
                          >
                            {task.title}
                          </Link>

                          {/* Bottom: Date & Link Icon */}
                          <div className="flex items-center justify-between pt-1">
                            <div className="flex items-center text-xs text-muted-foreground">
                              <Calendar className="mr-1 h-3 w-3" />
                              {task.dueDate
                                ? format(new Date(task.dueDate), "MMM d")
                                : "No date"}
                            </div>
                            {/* Optional Avatar or other icons here */}
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
