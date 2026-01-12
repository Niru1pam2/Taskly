import { useState } from "react";
import { useParams } from "react-router";
import Loader from "~/components/loader";
import CreateProjectDialog from "~/components/project/create-project";
import InviteMemberDialog from "~/components/workspace/invite-member";
import ProjectList from "~/components/workspace/project-list";
import WorkspaceHeader from "~/components/workspace/workspace-header";
import { useGetWorkspaceQuery } from "~/hooks/use-workspace";
import { useAuth } from "~/providers/auth-context";
import type { Project, Workspace } from "~/types";

export default function WorkspaceDetail() {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const [isCreateProject, setisCreateProject] = useState(false);
  const [isInviteMember, setIsInviteMember] = useState(false);
  const { user } = useAuth();

  if (!workspaceId) {
    return <div>No workspace found</div>;
  }

  const { data, isLoading } = useGetWorkspaceQuery(workspaceId) as {
    data: {
      workspace: Workspace;
      projects: Project[];
    };
    isLoading: boolean;
  };

  if (isLoading) {
    return <Loader />;
  }

  const isAdmin = data.workspace.members.some(
    (member) =>
      (member.user._id === user?._id && member.role === "admin") || "owner"
  );

  return (
    <div className="space-y-8">
      <WorkspaceHeader
        workspace={data.workspace}
        members={data.workspace.members as any}
        onCreateProject={() => setisCreateProject(true)}
        onInviteMember={() => setIsInviteMember(true)}
        isAdmin={isAdmin}
      />

      <ProjectList
        workspaceId={workspaceId}
        projects={data.projects}
        onCreateProject={() => setisCreateProject(true)}
      />

      <CreateProjectDialog
        isOpen={isCreateProject}
        onOpenChange={setisCreateProject}
        workspaceId={workspaceId}
        workspaceMembers={data.workspace.members as any}
      />

      <InviteMemberDialog
        workspaceId={workspaceId}
        isOpen={isInviteMember}
        onOpenChange={setIsInviteMember}
      />
    </div>
  );
}
