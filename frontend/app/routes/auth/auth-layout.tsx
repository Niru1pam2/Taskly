import { Loader2Icon } from "lucide-react";
import { Navigate, Outlet } from "react-router";
import { useAuth } from "~/providers/auth-context";

export default function AuthLayout() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center w-full">
        <Loader2Icon className="size-9 animate-spin" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to={"/dashboard"} />;
  }

  return (
    <div className=" w-full min-h-screen flex items-center justify-center">
      <Outlet />
    </div>
  );
}
