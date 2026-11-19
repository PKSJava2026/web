import type { Role } from "#/lib/types";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import "./SideBar.css";
import { useAuthStore } from "#/store/useAuthStore";
import { Button } from "../ui/Button";
import { api, notificationsReadEvent } from "#/lib/api";

interface NavItem {
  title: string;
  to: string;
  roles: Role[];
}
const NAV_ITEMS: NavItem[] = [
  {
    title: "Заявки",
    to: "/requests",
    roles: ["CUSTOMER", "FORWARDER", "ADMIN"],
  },
  {
    title: "Договоры",
    to: "/contracts",
    roles: ["CUSTOMER", "CARRIER", "FORWARDER", "ADMIN"],
  },
  {
    title: "Заявки о сотрудничестве",
    to: "/cooperation",
    roles: ["CARRIER", "FORWARDER", "ADMIN"],
  },
  {
    title: "Профиль",
    to: "/profile",
    roles: ["CUSTOMER", "CARRIER", "FORWARDER", "ADMIN"],
  },
  {
    title: "Уведомления",
    to: "/notifications",
    roles: ["CUSTOMER", "CARRIER", "FORWARDER", "ADMIN"],
  },
  {
    title: "Оценка услуг",
    to: "/rate-orders",
    roles: ["CUSTOMER", "FORWARDER", "ADMIN"],
  },
  {
    title: "Мой рейтинг",
    to: "/my-rating",
    roles: ["CARRIER", "FORWARDER", "ADMIN"],
  },

  { title: "Статистика", to: "/statistics", roles: ["FORWARDER", "ADMIN"] },

  { title: "Экспедиторы", to: "/forwarders", roles: ["ADMIN"] },
  {
    title: "Таблицы БД",
    to: "/database-tables",
    roles: ["FORWARDER", "ADMIN"],
  },
];

const ROLES = {
  CUSTOMER: "Заказчик",
  CARRIER: "Перевозчик",
  FORWARDER: "Экспедитор",
  ADMIN: "Администратор",
};

export function sectionsForRole(role: Role) {
  return NAV_ITEMS.filter((item) => item.roles.includes(role));
}

export const SideBar = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    if (!user) return;
    let active = true;
    let request = 0;
    async function refreshUnread() {
      const id = ++request;
      const result = await api.notifications.unreadCount().catch(() => null);
      if (active && request === id && result) setUnread(result.count);
    }

    void refreshUnread();
    window.addEventListener(notificationsReadEvent, refreshUnread);
    return () => {
      active = false;
      window.removeEventListener(notificationsReadEvent, refreshUnread);
    };
  }, [user, pathname]);

  const handleLogout = () => {
    logout();
    navigate({ to: "/login" });
  };

  const allowedItems = user ? sectionsForRole(user.role) : [];

  return (
    <div className="sidebar">
      <nav>
        {allowedItems.map((it) => (
          <Link to={it.to} key={it.to}>
            {it.title}
            {it.to === "/notifications" && unread > 0 && (
              <span aria-label={unread + " непрочитанных"}> ({unread})</span>
            )}
          </Link>
        ))}
      </nav>
      {user && (
        <div className="user-info">
          <div className="avatar">
            {user?.nickname.substring(0, 1).toUpperCase()}
          </div>
          <div className="user-meta">
            <div className="user-name">{user.nickname}</div>
            <div className="user-role">{ROLES[user.role]}</div>
          </div>
          <Button
            className="logout"
            variant="secondary"
            onClick={handleLogout}
          >
            Выйти
          </Button>
        </div>
      )}
    </div>
  );
};
