import { memo } from "react";
import type { UserResponse } from "#/lib/types";
import { formatDateTime } from "#/lib/format";
import { ROLE_LABELS } from "#/services/profile";
import { Card } from "#/components/ui/Card";
import "./ProfileCard.css";

export interface ProfileCardProps {
  user: UserResponse | null;
  isLoading?: boolean;
  className?: string;
}

export const ProfileCard = memo(function ProfileCard({
  user,
  isLoading = false,
  className = "",
}: ProfileCardProps) {
  return (
    <Card className={`profile-card ${className}`}>
      <h2 className="profile-card-title">Профиль</h2>

      {isLoading ? (
        <div className="profile-grid">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className="profile-row">
              <div
                className="profile-skeleton-cell"
                style={{ width: 100 }}
              />
              <div
                className="profile-skeleton-cell"
                style={{ width: "60%" }}
              />
            </div>
          ))}
        </div>
      ) : !user ? (
        <p className="profile-card-hint">Данные профиля недоступны</p>
      ) : (
        <div className="profile-grid">
          <div className="profile-row">
            <span className="field-label">Никнейм</span>
            <span className="value-label font-bold">{user.nickname}</span>
          </div>

          <div className="profile-row">
            <span className="field-label">Email</span>
            <span className="value-label">{user.email}</span>
          </div>

          <div className="profile-row">
            <span className="field-label">Роль</span>
            <span className="value-label">
              {ROLE_LABELS[user.role] ?? user.role}
            </span>
          </div>

          <div className="profile-row">
            <span className="field-label">Дата регистрации</span>
            <span className="value-label">
              {formatDateTime(user.createdAt)}
            </span>
          </div>
        </div>
      )}
    </Card>
  );
});
