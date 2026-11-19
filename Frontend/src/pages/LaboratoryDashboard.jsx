import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Layers,
  Inbox,
  FlaskConical,
  AlertTriangle,
  CheckCircle2,
  Plus,
  PackagePlus,
  Clock,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import RefreshButton from "../components/buttons/Refresh";
import ErrorAlert from "../components/ErrorAlert";
import InsightStatCard from "../components/dashboard/InsightStatCard";
import QuickActionsBar from "../components/dashboard/QuickActionsBar";
import PendingRequestsByStatus from "../components/dashboard/PendingRequestsByStatus";
import RecentIncomingRequests from "../components/dashboard/RecentIncomingRequests";
import PendingWorkOrdersSection from "../components/dashboard/PendingWorkOrdersSection";
import EssayRequestModal from "../components/modals/EssayRequestModal";
import ReceiveSamplesModal from "../components/modals/ReceiveSamplesModal";
import ExportEssaysModal from "../components/modals/ExportEssaysModal";
import { essaysService } from "../services/essaysService";
import { samplesService } from "../services/samplesService";

const STATUS_OPTIONS = [
  { value: null, label: "Todos" },
  { value: "REQUESTED", label: "Solicitado" },
  { value: "ACCEPTED", label: "Aceptado" },
  { value: "REJECTED", label: "Rechazado" },
  { value: "SERVICE_AGREEMENT_MADED", label: "Contrato generado" },
  { value: "IN_WORK", label: "En proceso" },
  { value: "COMPLETED", label: "Completado" },
  { value: "CANCELLED", label: "Cancelado" },
];

export default function LaboratoryDashboard() {
  const navigate = useNavigate();
  const [essays, setEssays] = useState([]);
  const [workOrders, setWorkOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Modals state
  const [newRequestOpen, setNewRequestOpen] = useState(false);
  const [receiveSamplesOpen, setReceiveSamplesOpen] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [essaysRes, workOrdersRes] = await Promise.all([
        essaysService.fetch().catch((err) => {
          console.error("Error fetching essays:", err);
          return [];
        }),
        samplesService.fetchWorkOrders().catch((err) => {
          console.error("Error fetching work orders:", err);
          return [];
        }),
      ]);

      setEssays(Array.isArray(essaysRes) ? essaysRes : []);
      setWorkOrders(Array.isArray(workOrdersRes) ? workOrdersRes : []);
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Dashboard fetch error:", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Recargar al volver el foco a la pestaña
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        fetchDashboardData();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [fetchDashboardData]);

  // KPIs calculados
  const kpis = useMemo(() => {
    const activeEssays = essays.filter(
      (e) =>
        e.status === "REQUESTED" ||
        e.status === "ACCEPTED" ||
        e.status === "SERVICE_AGREEMENT_MADED" ||
        e.status === "IN_WORK"
    ).length;

    const requestedEssays = essays.filter((e) => e.status === "REQUESTED").length;
    const completedEssays = essays.filter((e) => e.status === "COMPLETED").length;

    const analyzingOrders = workOrders.filter((wo) => wo.status === "ANALYZING");

    // Órdenes en análisis que están cerca de la fecha (<= 4 días) o vencidas
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const urgentOrders = analyzingOrders.filter((wo) => {
      if (!wo.report_delivery_deadline) return false;
      const dl = new Date(wo.report_delivery_deadline);
      if (Number.isNaN(dl.getTime())) return false;
      dl.setHours(0, 0, 0, 0);
      const diffDays = Math.round((dl.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return diffDays <= 4;
    }).length;

    return {
      activeEssays,
      requestedEssays,
      completedEssays,
      totalOrders: analyzingOrders.length,
      urgentOrders,
    };
  }, [essays, workOrders]);

  const formattedLastUpdated = lastUpdated
    ? lastUpdated.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })
    : null;

  return (
    <div className="space-y-6">
      {/* Encabezado Principal */}
      <PageHeader
        title="Inicio"
        subtitle="Reporte general del sistema, control de solicitudes y seguimiento operativo de ensayos"
        actions={
          <div className="flex flex-wrap items-center gap-2">
            {formattedLastUpdated && (
              <span className="text-xs text-muted-foreground hidden sm:inline-flex items-center gap-1.5 mr-2">
                <Clock className="h-3.5 w-3.5" />
                <span>Actualizado a las {formattedLastUpdated}</span>
              </span>
            )}
            <RefreshButton onClick={fetchDashboardData} disabled={loading} />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setReceiveSamplesOpen(true)}
              className="gap-2 cursor-pointer shadow-xs border-border"
            >
              <PackagePlus className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span className="hidden md:inline">Recibir muestras</span>
              <span className="md:hidden">Muestras</span>
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={() => setNewRequestOpen(true)}
              className="gap-2 cursor-pointer shadow-xs"
            >
              <Plus className="h-4 w-4" />
              <span>Nueva solicitud</span>
            </Button>
          </div>
        }
      />

      {/* Botonera de Acciones Rápidas */}
      <QuickActionsBar
        onNewRequest={() => setNewRequestOpen(true)}
        onReceiveSamples={() => setReceiveSamplesOpen(true)}
        onExport={() => setExportModalOpen(true)}
      />

      {error && (
        <ErrorAlert
          title="Error al cargar la información del tablero"
          message={error?.response?.data?.message || error?.message || "No se pudo actualizar."}
        />
      )}

      {/* Tarjetas KPI de Resumen General (Inspiradas en Contalogic) */}
      <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
        <InsightStatCard
          title="Solicitudes activas"
          numericValue={kpis.activeEssays}
          subtitle="En circuito de evaluación y ensayo"
          icon={<Layers className="h-4 w-4" />}
          tone="info"
          isLoading={loading}
          onClick={() => navigate("/essays")}
        />

        <InsightStatCard
          title="Nuevas por revisar"
          numericValue={kpis.requestedEssays}
          subtitle="Solicitudes pendientes de aceptación"
          icon={<Inbox className="h-4 w-4" />}
          tone="warning"
          isLoading={loading}
          badge={
            kpis.requestedEssays > 0 ? (
              <Badge variant="secondary" className="bg-amber-100 text-amber-800 text-[10px] h-4.5">
                Por revisar
              </Badge>
            ) : null
          }
          onClick={() => navigate("/essays?status=REQUESTED")}
        />

        <InsightStatCard
          title="Órdenes en análisis"
          numericValue={kpis.totalOrders}
          subtitle="Órdenes de trabajo activas en laboratorio"
          icon={<FlaskConical className="h-4 w-4" />}
          tone="default"
          isLoading={loading}
          onClick={() => navigate("/samples")}
        />

        <InsightStatCard
          title="Atención prioritaria"
          numericValue={kpis.urgentOrders}
          subtitle="OT próximas a vencer (≤ 4d) o vencidas"
          icon={<AlertTriangle className="h-4 w-4" />}
          tone={kpis.urgentOrders > 0 ? "destructive" : "success"}
          isLoading={loading}
          badge={
            kpis.urgentOrders > 0 ? (
              <Badge variant="destructive" className="text-[10px] h-4.5">
                Urgente
              </Badge>
            ) : null
          }
          onClick={() => navigate("/samples")}
        />
      </div>

      {/* Sección 1: Solicitudes pendientes según estado (Funnel y desglose) */}
      <PendingRequestsByStatus essays={essays} isLoading={loading} />

      {/* Sección 2: Órdenes de trabajo pendientes por orden de llegada con advertencia de fecha */}
      <PendingWorkOrdersSection workOrders={workOrders} isLoading={loading} />

      {/* Sección 3: Nuevas solicitudes que van llegando (Cola de entrada) */}
      <RecentIncomingRequests essays={essays} isLoading={loading} />

      {/* Modales */}
      <EssayRequestModal
        show={newRequestOpen}
        onClose={() => setNewRequestOpen(false)}
        onCreated={(essay) => {
          setNewRequestOpen(false);
          fetchDashboardData();
          if (essay?.id) navigate(`/essay/${essay.id}`);
        }}
      />

      <ReceiveSamplesModal
        show={receiveSamplesOpen}
        onClose={() => setReceiveSamplesOpen(false)}
        onSuccess={() => {
          setReceiveSamplesOpen(false);
          fetchDashboardData();
        }}
      />

      <ExportEssaysModal
        show={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        statusOptions={STATUS_OPTIONS}
      />
    </div>
  );
}
