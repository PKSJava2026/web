import type { Role } from "#/lib/types";
import { Link, useNavigate } from "@tanstack/react-router";
import "./SideBar.css";
import { useAuthStore } from "#/store/useAuthStore";
import { Button } from "../ui/Button";

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

export const SideBar = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate({ to: "/login" });
  };

  const allowedItems = user
    ? NAV_ITEMS.filter((it) => it.roles.includes(user.role))
    : [];

  return (
    <div className="sidebar">
      <nav>
        {allowedItems.map((it) => (
          <Link to={it.to} key={it.to}>
            {it.title}
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
