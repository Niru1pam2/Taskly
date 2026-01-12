import { Search, X, User } from "lucide-react";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";
import Loader from "~/components/loader";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { useGetWorkspaceDetailsQuery } from "~/hooks/use-workspace";
import type { Workspace } from "~/types";

const Members = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const workspaceId = searchParams.get("workspaceId");
  const searchParam = searchParams.get("search") || "";

  // Local state for immediate typing feedback
  const [searchInput, setSearchInput] = useState<string>(searchParam);

  const { data, isLoading } = useGetWorkspaceDetailsQuery(workspaceId!) as {
    data: Workspace;
    isLoading: boolean;
  };

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

  // 1. Debounce Effect: Updates URL 400ms after user stops typing
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== searchParam) {
        updateParams("search", searchInput);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput, searchParam]);

  // 2. Sync Effect: Updates Input if URL changes (e.g. Back Button)
  useEffect(() => {
    if (searchParam !== searchInput) {
      setSearchInput(searchParam);
    }
  }, [searchParam]);

  if (isLoading) return <Loader />;

  if (!data || !workspaceId)
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] text-muted-foreground">
        <User className="h-12 w-12 mb-4 opacity-20" />
        <p>No workspace found</p>
      </div>
    );

  const filteredMembers = data?.members?.filter((member) => {
    const term = searchInput.toLowerCase();
    const name = member.user?.name?.toLowerCase() || "";
    const email = member.user?.email?.toLowerCase() || "";
    const role = member.role?.toLowerCase() || "";

    return name.includes(term) || email.includes(term) || role.includes(term);
  });

  const getRoleBadgeVariant = (role: string) => {
    return ["admin", "owner"].includes(role) ? "destructive" : "secondary";
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Workspace Members
          </h1>
          <p className="text-muted-foreground text-sm">
            Manage who has access to this workspace
          </p>
        </div>

        {/* Improved Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-9 pr-8"
          />
          {searchInput && (
            <button
              onClick={() => setSearchInput("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      <Tabs defaultValue="list" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="list">List View</TabsTrigger>
          <TabsTrigger value="board">Board View</TabsTrigger>
        </TabsList>

        {/* LIST VIEW */}
        <TabsContent value="list">
          <Card>
            <CardHeader>
              <CardTitle>Members Directory</CardTitle>
              <CardDescription>
                {filteredMembers?.length} active member
                {filteredMembers?.length !== 1 && "s"}
              </CardDescription>
            </CardHeader>

            <CardContent className="p-0">
              <div className="divide-y">
                {filteredMembers.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">
                    No members found matching "{searchInput}"
                  </div>
                ) : (
                  filteredMembers.map((member) => (
                    <div
                      key={member.user._id}
                      className="flex flex-col items-start gap-4 p-4 hover:bg-muted/40 md:flex-row md:items-center md:justify-between"
                    >
                      <div className="flex items-center gap-4">
                        <Avatar className="h-10 w-10 border">
                          <AvatarImage
                            src={member.user.profilePicture}
                            alt={member.user.name}
                          />
                          <AvatarFallback className="uppercase">
                            {member.user.name?.charAt(0) || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium leading-none">
                            {member.user.name}
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">
                            {member.user.email}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end md:self-auto">
                        <Badge variant="outline" className="font-normal">
                          {data.name}
                        </Badge>
                        <Badge
                          variant={getRoleBadgeVariant(member.role)}
                          className="capitalize"
                        >
                          {member.role}
                        </Badge>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* BOARD VIEW */}
        <TabsContent value="board">
          {filteredMembers.length === 0 ? (
            <div className="flex h-40 items-center justify-center rounded-lg border border-dashed bg-muted/20 text-muted-foreground">
              No members found
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredMembers.map((member) => (
                <Card
                  key={member.user._id}
                  className="overflow-hidden hover:shadow-md transition-shadow"
                >
                  <CardContent className="flex flex-col items-center p-6 text-center">
                    <Avatar className="mb-4 h-20 w-20 border-2 border-border">
                      <AvatarImage src={member.user.profilePicture} />
                      <AvatarFallback className="text-xl uppercase">
                        {member.user.name?.substring(0, 2) || "U"}
                      </AvatarFallback>
                    </Avatar>

                    <h3 className="mb-1 truncate w-full font-semibold text-lg">
                      {member.user.name}
                    </h3>

                    <p className="mb-4 truncate w-full text-sm text-muted-foreground">
                      {member.user.email}
                    </p>

                    <div className="flex items-center gap-2">
                      <Badge
                        variant={getRoleBadgeVariant(member.role)}
                        className="capitalize px-3"
                      >
                        {member.role}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Members;
