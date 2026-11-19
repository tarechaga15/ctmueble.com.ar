import { useState } from "react";
import { Navigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

export default function PrivateLayout({ children }) {
  const { isAuthenticated, loadingInitial } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (loadingInitial) {
    return (
      <div className="flex h-screen items-center justify-center bg-background text-foreground">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      <Sidebar />
      {mobileOpen ? (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            aria-label="Cerrar menú"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative h-full w-72">
            <Sidebar mobile onNavigate={() => setMobileOpen(false)} />
          </div>
        </div>
      ) : null}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Header onOpenMenu={() => setMobileOpen(true)} />
        <main className="no-scrollbar min-h-0 flex-1 overflow-auto p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
