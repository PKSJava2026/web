import { useEffect } from "react";
import { SideBar } from "#/components/SideBar";
import { sectionsForRole } from "#/components/SideBar/SideBar";
import { createFileRoute, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useAuthStore } from "#/store/useAuthStore";

export const Route = createFileRoute("/_app")({
  ssr: false,
  component: AppLayout,
});

function AppLayout() {
  const user = useAuthStore((s) => s.user);
  const hasHydrated = useAuthStore((s) => s.hasHydrated);
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (state) => state.location.pathname.replace(/\/$/, "") });

  useEffect(() => {
    if (hasHydrated && !user) {
      navigate({ to: "/login" });
    }
  }, [hasHydrated, user, navigate]);

  if (!hasHydrated) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          color: "var(--color-text-muted)",
          fontSize: 14,
        }}
      >
        Загрузка...
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="app-layout">
      <SideBar />
      <main>
        {sectionsForRole(user.role).some((section) => section.to === pathname)
          ? <Outlet />
          : <p role="alert">Этот раздел недоступен</p>}
      </main>
    </div>
  );
}
