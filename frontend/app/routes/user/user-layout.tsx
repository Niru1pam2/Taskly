import { Outlet } from "react-router";

export default function UserLayout() {
  return (
    <div className="container mx-auto p-8 md:p-16">
      <Outlet />
    </div>
  );
}
