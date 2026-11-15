import { SideBar } from "#/components/SideBar";
import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_app")({
  component: AppLayout,
});

function AppLayout() {
  return (
    <div className="app-layout">
      <SideBar />
      <main>
        <Outlet />
      </main>
    </div>
  );
}
