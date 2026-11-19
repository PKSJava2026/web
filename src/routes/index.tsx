import { sectionsForRole } from "#/components/SideBar/SideBar";
import { getAuthToken } from "#/lib/api";
import { useAuthStore } from "#/store/useAuthStore";
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  ssr: false,
  beforeLoad: () => {
    if (!getAuthToken()) throw redirect({ to: "/login", replace: true });
    const user = useAuthStore.getState().user;
    const home = user && sectionsForRole(user.role)[0]?.to;
    throw redirect({ to: home || "/requests", replace: true, reloadDocument: true });
  },
});
