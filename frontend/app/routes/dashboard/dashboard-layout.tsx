import { useState } from "react";
import { Navigate, Outlet } from "react-router";
import Header from "~/components/layout/header";
import Sidebar from "~/components/layout/sidebar";
import Loader from "~/components/loader";
import CreateWorkspace from "~/components/workspace/create-workspace";
import { fetchData } from "~/lib/fetch-util";
import { useAuth } from "~/providers/auth-context";
import type { Workspace } from "~/types";

export const clientLoader = async () => {
  try {
    const [workspaces] = await Promise.all([fetchData("/workspaces")]);

    return { workspaces };
  } catch (error) {
    console.log(error);
  }
};

export default function DashboardLayout() {
  const { isAuthenticated, isLoading } = useAuth();
  const [isCreatingWorkspace, setIsCreatingWorkspace] = useState(false);
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(
    null
  );

  if (isLoading) {
    return <Loader />;
  }

  if (!isAuthenticated) {
    return <Navigate to={"/sign-in"} />;
  }

  const handleWorkspaceSelected = (workSpace: Workspace) => {
    setCurrentWorkspace(workSpace);
  };

  return (
    <div className="flex min-h-screen w-full">
      <Sidebar currentWorkspace={currentWorkspace} />

      <div className="flex flex-1 flex-col h-full">
        <Header
          onWorkspaceSelected={handleWorkspaceSelected}
          selectedWorkspace={currentWorkspace}
          onCreateWorkspace={() => setIsCreatingWorkspace(true)}
        />

        <main className="flex-1 overflow-y-auto h-full w-full">
          <div className="mx-auto container px-2 sm:px-6 lg:px-8 py-4 w-full h-full">
            <Outlet />
          </div>
        </main>
      </div>

      <CreateWorkspace
        isCreatingWorkspace={isCreatingWorkspace}
        setIsCreatingWorkspace={setIsCreatingWorkspace}
      />
    </div>
  );
}
