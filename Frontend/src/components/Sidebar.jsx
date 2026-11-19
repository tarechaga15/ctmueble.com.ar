import { Link, NavLink } from "react-router-dom";
import { LayoutDashboard, ClipboardList, FlaskConical, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "../context/AuthContext";
import { APP_VERSION } from "../appVersion";

const LOGO = "https://ctmueble.com.ar/wp-content/uploads/2025/09/cropped-logo-ctm-1-1.png";

export default function Sidebar({ mobile = false, onNavigate }) {
  const { user } = useAuth();
  const isLaboratory = user?.profile === "LABORATORY";

  const items = isLaboratory
    ? [
        {
          to: "/dashboard",
          label: "Inicio",
          icon: LayoutDashboard,
          end: true,
        },
        {
          to: "/essays",
          label: "Solicitudes",
          icon: ClipboardList,
        },
        {
          to: "/samples",
          label: "Órdenes de trabajo",
          icon: FlaskConical,
        },
        {
          to: "/clients",
          label: "Clientes",
          icon: Users,
        },
      ]
    : [
        {
          to: "/dashboard",
          label: "Mis solicitudes",
          icon: ClipboardList,
          end: true,
        },
        {
          to: "/clients",
          label: "Clientes representados",
          icon: Users,
        },
      ];

  return (
    <aside
      className={cn(
        "flex h-screen w-64 shrink-0 flex-col overflow-hidden border-r border-sidebar-border bg-sidebar text-sidebar-foreground",
        mobile ? "h-full w-full" : "hidden md:flex",
      )}
    >
      <div className="flex shrink-0 items-center justify-center border-sidebar-border p-3">
        <Link
          to="/dashboard"
          onClick={onNavigate}
          className="flex w-full items-center justify-center rounded-lg px-3 py-2 transition-opacity hover:opacity-95"
        >
          <img src={LOGO} alt="CTMueble" className="h-10 w-auto max-w-full object-contain" />
        </Link>
      </div>
      <nav className="no-scrollbar flex min-h-0 flex-1 flex-col overflow-y-auto p-4">
        <ul className="space-y-1">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.end}
                  onClick={onNavigate}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                      isActive
                        ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
                        : "hover:bg-sidebar-accent/50",
                    )
                  }
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {item.label}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="shrink-0 border-t border-sidebar-border px-4 py-3 text-center text-[11px] text-sidebar-foreground/70">
        CTMueble v{APP_VERSION}
      </div>
    </aside>
  );
}
