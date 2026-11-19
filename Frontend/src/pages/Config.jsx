import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Building2, Mail, Users } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import MailingConfigTab from "../components/config/MailingConfigTab";
import LaboratoryUsersTab from "../components/config/LaboratoryUsersTab";
import LabDataConfigTab from "../components/config/LabDataConfigTab";

export default function Config() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("env"); // "env" (Datos del laboratorio) | "mailing" | "users"

  const isSuperAdmin = Boolean(
    user?.isSuperAdmin ||
    user?.labRole === "ADMIN" ||
    user?.mail === "tarechaga15@gmail.com" ||
    user?.mail === "dev@ctmueble.com.ar"
  );

  useEffect(() => {
    if (user && user.profile !== "LABORATORY") {
      navigate("/dashboard", { replace: true });
    }
  }, [user, navigate]);

  return (
    <div className="space-y-4">
      <PageHeader
        title="Configuración del Sistema"
        subtitle="Administrá los datos institucionales del laboratorio, credenciales de servicios y usuarios. Acceso restringido para el laboratorio."
      />

      {/* Navtabs de Configuración */}
      <div className="flex border-b border-border gap-6">
        <button
          type="button"
          onClick={() => setActiveTab("env")}
          className={`pb-2.5 text-sm font-medium border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === "env"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Building2 className="size-4" />
          Datos del laboratorio
        </button>

        {isSuperAdmin && (
          <button
            type="button"
            onClick={() => setActiveTab("mailing")}
            className={`pb-2.5 text-sm font-medium border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === "mailing"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Mail className="size-4" />
            Envío de correos
          </button>
        )}

        {isSuperAdmin && (
          <button
            type="button"
            onClick={() => setActiveTab("users")}
            className={`pb-2.5 text-sm font-medium border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === "users"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Users className="size-4" />
            Usuarios
          </button>
        )}
      </div>

      {activeTab === "users" && isSuperAdmin ? (
        <LaboratoryUsersTab />
      ) : activeTab === "mailing" && isSuperAdmin ? (
        <MailingConfigTab />
      ) : (
        <LabDataConfigTab />
      )}
    </div>
  );
}
