import { createFileRoute } from "@tanstack/react-router";
import { useAuthStore } from "#/store/useAuthStore";
import { ProfileCard } from "#/components/profile";
import "./profile.css";

export const Route = createFileRoute("/_app/profile")({
  component: ProfilePage,
});

function ProfilePage() {
  const user = useAuthStore((state) => state.user);

  return (
    <div className="profile-page">
      <ProfileCard user={user} />
    </div>
  );
}
