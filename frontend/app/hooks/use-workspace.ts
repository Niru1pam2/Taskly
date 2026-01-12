import { useMutation, useQuery } from "@tanstack/react-query";
import type { workspaceForm } from "~/components/workspace/create-workspace";
import { fetchData, postData } from "~/lib/fetch-util";

export const useCreateWorkspace = () => {
  return useMutation({
    mutationFn: async (data: workspaceForm) => postData("/workspaces", data),
  });
};

export const useGetWorkspacesQuery = () => {
  return useQuery({
    queryKey: ["workspaces"],
    queryFn: async () => fetchData("/workspaces"),
  });
};

export const useGetArchivedTasks = () => {
  return useQuery({
    queryKey: ["archived-tasks"],
    queryFn: async () => fetchData("tasks/archived-tasks"),
  });
};

export const useGetWorkspaceQuery = (workspaceId: string) => {
  return useQuery({
    queryKey: ["workspace", workspaceId],
    queryFn: async () => fetchData(`/workspaces/${workspaceId}/projects`),
  });
};

export const useWorkspaceStatsQuery = (workspaceId: string) => {
  return useQuery({
    queryKey: ["workspace", workspaceId, "stats"],
    queryFn: async () => fetchData(`/workspaces/${workspaceId}/stats`),
    enabled: !!workspaceId,
  });
};

export const useGetWorkspaceDetailsQuery = (workspaceId: string) => {
  return useQuery({
    queryKey: ["workspace", workspaceId, "details"],
    queryFn: async () => fetchData(`/workspaces/${workspaceId}`),
  });
};

export const useInviteMemberMutation = () => {
  return useMutation({
    mutationFn: async (data: {
      email: string;
      role: string;
      workspaceId: string;
    }) => postData(`/workspaces/${data.workspaceId}/invite-member`, data),
  });
};

export const useAcceptInvitationByTokenMutation = () => {
  return useMutation({
    mutationFn: async (token: string) =>
      postData(`/workspaces/accept-invite-token`, {
        token,
      }),
  });
};

export const useAcceptGeneralInviteMutation = () => {
  return useMutation({
    mutationFn: (workspaceId: string) =>
      postData(`/workspaces/${workspaceId}/accept-general-invite`, {}),
  });
};
