import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  ChevronDown,
  FlaskConical,
  LogOut,
  Menu,
  Moon,
  Settings,
  ShieldCheck,
  Sun,
  UserCheck,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import EditProfileModal from "./modals/EditProfileModal";

function useDismiss(open, onClose) {
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onPointer = (event) => {
      if (ref.current && !ref.current.contains(event.target)) onClose();
    };
    const onKey = (event) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  return ref;
}

function MenuPanel({ align = "end", children, className }) {
  return (
    <div
      className={cn(
        "absolute top-full z-50 mt-1.5 min-w-32 rounded-xl bg-popover p-1.5 text-popover-foreground shadow-xl ring-1 ring-border/80",
        align === "end" ? "right-0" : "left-0",
        className,
      )}
    >
      {children}
    </div>
  );
}

function ThemeToggle() {
  const { setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useDismiss(open, () => setOpen(false));

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "relative rounded-lg")}
        onClick={() => setOpen((value) => !value)}
        aria-label="Tema"
      >
        <Sun className="h-4 w-4 scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
        <Moon className="absolute h-4 w-4 scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
      </button>
      {open ? (
        <MenuPanel className="w-36">
          {[
            ["light", "Claro"],
            ["dark", "Oscuro"],
            ["system", "Sistema"],
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              className="flex w-full rounded-md px-2.5 py-1.5 text-left text-xs font-medium text-foreground hover:bg-muted transition-colors"
              onClick={() => {
                setTheme(value);
                setOpen(false);
              }}
            >
              {label}
            </button>
          ))}
        </MenuPanel>
      ) : null}
    </div>
  );
}

function UserMenu() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const ref = useDismiss(open, () => setOpen(false));

  const displayName = user?.name || user?.mail?.split("@")[0] || "Usuario";
  const initials = (user?.name || user?.mail || "US")
    .trim()
    .slice(0, 2)
    .toUpperCase();
  const isClient = user?.profile === "CLIENT";
  const isLaboratory = user?.profile === "LABORATORY";

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        className={cn(
          "inline-flex items-center gap-2 rounded-full border border-border/70 p-1 pr-2.5 text-sm transition-all hover:bg-muted/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
          open && "bg-muted/70 ring-2 ring-primary/20"
        )}
        onClick={() => setOpen((value) => !value)}
        aria-label="Cuenta"
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary ring-1 ring-primary/25">
          {initials}
        </span>
        <span className="hidden sm:inline-block max-w-[120px] truncate text-xs font-medium text-foreground">
          {displayName}
        </span>
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 text-muted-foreground transition-transform duration-200",
            open && "rotate-180 text-foreground"
          )}
        />
      </button>

      {open ? (
        <MenuPanel className="w-72 p-2">
          {/* Tarjeta de perfil resumido */}
          <div className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/40 border border-border/40">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/15 text-sm font-bold text-primary ring-1 ring-primary/30">
              {initials}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-foreground leading-tight">
                {user?.name || "Usuario"}
              </p>
              <p className="truncate text-[11px] text-muted-foreground mt-0.5">
                {user?.mail}
              </p>
              <div className="mt-1.5 flex items-center gap-1.5">
                <span
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase",
                    isClient
                      ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20"
                      : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                  )}
                >
                  {isClient ? (
                    <>
                      <ShieldCheck className="size-3" />
                      Cliente
                    </>
                  ) : (
                    <>
                      <FlaskConical className="size-3" />
                      Laboratorio
                    </>
                  )}
                </span>
              </div>
            </div>
          </div>

          <div className="my-1.5 h-px bg-border/60" />

          {/* Acciones */}
          <div className="space-y-0.5">
            <button
              type="button"
              className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-xs font-medium text-foreground transition-colors hover:bg-muted"
              onClick={() => {
                setOpen(false);
                setEditProfileOpen(true);
              }}
            >
              <UserCheck className="size-4 text-primary shrink-0" />
              <div className="flex flex-col min-w-0">
                <span className="font-semibold text-foreground">
                  {isClient ? "Mis datos de solicitante" : "Editar perfil"}
                </span>
                <span className="text-[10px] text-muted-foreground truncate">
                  Nombre, DNI, teléfono y domicilio
                </span>
              </div>
            </button>

            <Link
              to="/account"
              className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-xs font-medium text-foreground transition-colors hover:bg-muted"
              onClick={() => setOpen(false)}
            >
              <ShieldCheck className="size-4 text-primary shrink-0" />
              <div className="flex flex-col min-w-0">
                <span className="font-semibold text-foreground">
                  Configuración de cuenta
                </span>
                <span className="text-[10px] text-muted-foreground truncate">
                  Seguridad, 2FA y sesiones activas
                </span>
              </div>
            </Link>

            {isLaboratory && (
              <Link
                to="/config"
                className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-xs font-medium text-foreground transition-colors hover:bg-muted"
                onClick={() => setOpen(false)}
              >
                <Settings className="size-4 text-muted-foreground shrink-0" />
                <div className="flex flex-col min-w-0">
                  <span className="font-semibold text-foreground">Configuración</span>
                  <span className="text-[10px] text-muted-foreground truncate">
                    Parámetros del laboratorio
                  </span>
                </div>
              </Link>
            )}
          </div>

          <div className="my-1.5 h-px bg-border/60" />

          {/* Salir */}
          <button
            type="button"
            className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-xs font-medium text-destructive transition-colors hover:bg-destructive/10"
            onClick={() => {
              setOpen(false);
              logout();
            }}
          >
            <LogOut className="size-4 shrink-0" />
            Cerrar sesión
          </button>
        </MenuPanel>
      ) : null}

      <EditProfileModal
        show={editProfileOpen}
        onClose={() => setEditProfileOpen(false)}
      />
    </div>
  );
}

export default function Header({ onOpenMenu }) {
  const { user } = useAuth();
  const isLaboratory = user?.profile === "LABORATORY";

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center gap-4 border-b bg-background px-4 lg:px-6">
      <button
        type="button"
        className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "md:hidden")}
        onClick={onOpenMenu}
        aria-label="Menú"
      >
        <Menu className="h-5 w-5" />
      </button>
      <div className="flex-1" />
      <div className="flex items-center gap-2">
        <ThemeToggle />
        {isLaboratory && (
          <Link
            to="/config"
            className={cn(buttonVariants({ variant: "ghost", size: "icon" }))}
            aria-label="Configuración"
          >
            <Settings className="h-4 w-4" />
          </Link>
        )}
        <UserMenu />
      </div>
    </header>
  );
}
