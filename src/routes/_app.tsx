import { SideBar } from "#/components/SideBar";
import { sectionsForRole } from "#/components/SideBar/SideBar";
import { api, getAuthToken } from "#/lib/api";
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { useAuthStore } from "#/store/useAuthStore";

export const Route = createFileRoute("/_app")({
  ssr: false,
  beforeLoad: async ({ location, abortController }) => {
    const token = getAuthToken();
    if (!token) {
      throw redirect({ to: "/login", replace: true });
    }

    const user = await api.users.me(abortController.signal).catch((error: unknown) => {
      if ((error as { status?: number })?.status === 401) return null;
      throw error;
    });

    if (!user || getAuthToken() !== token) {
      throw redirect({ to: "/login", replace: true });
    }

    const { setUser } = useAuthStore.getState();
    setUser(user);

    const sections = sectionsForRole(user.role);
    const pathname = location.pathname.replace(/\/$/, "");
    if (!sections.some((section) => section.to === pathname)) {
      throw redirect({ to: sections[0]?.to ?? "/login", replace: true });
    }
  },
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
