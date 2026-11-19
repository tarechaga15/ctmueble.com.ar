import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  FlaskConical,
  AlertTriangle,
  ClockAlert,
  Clock,
  CheckCircle2,
  ArrowUpRight,
  ExternalLink,
  ChevronRight,
  Filter,
  Calendar,
  Layers,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

function getDeadlineInfo(deadlineStr) {
  if (!deadlineStr) {
    return {
      type: "none",
      label: "Sin fecha límite",
      sublabel: "No se definió fecha de entrega",
      diffDays: null,
      badgeVariant: "secondary",
      badgeClass: "bg-muted text-muted-foreground border-transparent",
      icon: Clock,
      rowHighlight: "",
    };
  }

  const deadline = new Date(deadlineStr);
  if (Number.isNaN(deadline.getTime())) {
    return {
      type: "none",
      label: "Fecha inválida",
      sublabel: "—",
      diffDays: null,
      badgeVariant: "secondary",
      badgeClass: "bg-muted text-muted-foreground",
      icon: Clock,
      rowHighlight: "",
    };
  }

  // Normalizar fechas al inicio del día para evitar discrepancias de horas
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const targetDate = new Date(deadline);
  targetDate.setHours(0, 0, 0, 0);

  const diffMs = targetDate.getTime() - today.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
  const fechaFormateada = deadline.toLocaleDateString("es-AR");

  if (diffDays < 0) {
    const diasVencidos = Math.abs(diffDays);
    return {
      type: "expired",
      label: `Vencida (${diasVencidos}d)`,
      sublabel: `Plazo vencido el ${fechaFormateada}`,
      diffDays,
      badgeVariant: "destructive",
      badgeClass: "bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/30 font-semibold",
      icon: AlertTriangle,
      rowHighlight: "border-l-4 border-l-rose-500 bg-rose-500/[0.03]",
    };
  }

  if (diffDays === 0) {
    return {
      type: "today",
      label: "¡Vence hoy!",
      sublabel: `Entrega límite hoy ${fechaFormateada}`,
      diffDays,
      badgeVariant: "default",
      badgeClass: "bg-amber-500 text-white dark:bg-amber-600 font-semibold animate-pulse",
      icon: ClockAlert,
      rowHighlight: "border-l-4 border-l-amber-500 bg-amber-500/[0.04]",
    };
  }

  if (diffDays === 1) {
    return {
      type: "urgent",
      label: "Vence mañana",
      sublabel: `Plazo: ${fechaFormateada}`,
      diffDays,
      badgeVariant: "default",
      badgeClass: "bg-amber-500/20 text-amber-800 dark:text-amber-300 border-amber-500/40 font-semibold",
      icon: ClockAlert,
      rowHighlight: "border-l-4 border-l-amber-400 bg-amber-500/[0.02]",
    };
  }

  if (diffDays <= 4) {
    return {
      type: "warning",
      label: `En ${diffDays} días`,
      sublabel: `Plazo: ${fechaFormateada}`,
      diffDays,
      badgeVariant: "secondary",
      badgeClass: "bg-yellow-500/15 text-yellow-800 dark:text-yellow-400 border-yellow-500/30 font-medium",
      icon: Clock,
      rowHighlight: "border-l-4 border-l-yellow-400",
    };
  }

  return {
    type: "ontime",
    label: `${diffDays} días restantes`,
    sublabel: `Plazo: ${fechaFormateada}`,
    diffDays,
    badgeVariant: "secondary",
    badgeClass: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
    icon: CheckCircle2,
    rowHighlight: "border-l-4 border-l-emerald-500/40",
  };
}

function formatArrivalDate(dateStr) {
  if (!dateStr) return "—";
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export default function PendingWorkOrdersSection({ workOrders = [] }) {
  const navigate = useNavigate();
  const [filterMode, setFilterMode] = useState("all"); // 'all' | 'urgent' | 'warning'

  // Filtrar solo las órdenes pendientes de análisis (ANALYZING)
  // y ordenar por orden de llegada (FIFO: fecha de recepción o generación ascendente)
  const pendingOrdersWithMeta = useMemo(() => {
    const rawList = Array.isArray(workOrders) ? workOrders : [];
    const list = rawList
      .filter((wo) => wo && wo.status === "ANALYZING")
      .map((wo) => {
        const arrivalDate = wo.samples_received_at || wo.generated_at;
        const deadlineInfo = getDeadlineInfo(wo.report_delivery_deadline);
        return {
          ...wo,
          arrivalDate,
          deadlineInfo,
        };
      });

    // Ordenar por orden de llegada: más antigua primero (FIFO)
    list.sort((a, b) => {
      const timeA = a.arrivalDate ? new Date(a.arrivalDate).getTime() : Infinity;
      const timeB = b.arrivalDate ? new Date(b.arrivalDate).getTime() : Infinity;
      return timeA - timeB;
    });

    return list;
  }, [workOrders]);

  // Contadores de urgencia
  const stats = useMemo(() => {
    let expired = 0;
    let todayOrTomorrow = 0;
    let warning = 0;
    let onTime = 0;

    pendingOrdersWithMeta.forEach((item) => {
      const type = item.deadlineInfo.type;
      if (type === "expired") expired++;
      else if (type === "today" || type === "urgent") todayOrTomorrow++;
      else if (type === "warning") warning++;
      else if (type === "ontime") onTime++;
    });

    return {
      total: pendingOrdersWithMeta.length,
      expired,
      todayOrTomorrow,
      warning,
      onTime,
      totalUrgent: expired + todayOrTomorrow,
    };
  }, [pendingOrdersWithMeta]);

  // Filtrar por modo seleccionado
  const filteredList = useMemo(() => {
    if (filterMode === "urgent") {
      return pendingOrdersWithMeta.filter(
        (o) => o.deadlineInfo.type === "expired" || o.deadlineInfo.type === "today" || o.deadlineInfo.type === "urgent"
      );
    }
    if (filterMode === "warning") {
      return pendingOrdersWithMeta.filter(
        (o) =>
          o.deadlineInfo.type === "expired" ||
          o.deadlineInfo.type === "today" ||
          o.deadlineInfo.type === "urgent" ||
          o.deadlineInfo.type === "warning"
      );
    }
    return pendingOrdersWithMeta;
  }, [pendingOrdersWithMeta, filterMode]);

  return (
    <Card className="shadow-xs border-border/80">
      <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3 pb-3 border-b border-border/60">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400">
            <FlaskConical className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <CardTitle className="text-base font-semibold text-foreground">
                Órdenes de trabajo pendientes por orden de llegada
              </CardTitle>
              <Badge variant="secondary" className="font-semibold text-xs">
                {stats.total} en análisis
              </Badge>
              {stats.totalUrgent > 0 && (
                <Badge variant="destructive" className="text-[10px] gap-1 px-1.5 py-0 h-4.5">
                  <AlertTriangle className="h-2.5 w-2.5" />
                  {stats.totalUrgent} con atención prioritaria
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Priorizadas según fecha de llegada al laboratorio (FIFO) con advertencia de fecha de entrega
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Botones de filtro rápido */}
          <div className="flex rounded-lg bg-muted/70 p-0.5 text-xs font-medium">
            <button
              type="button"
              onClick={() => setFilterMode("all")}
              className={`rounded-md px-2.5 py-1 transition-all cursor-pointer ${
                filterMode === "all"
                  ? "bg-card text-foreground shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Todas ({stats.total})
            </button>
            <button
              type="button"
              onClick={() => setFilterMode("urgent")}
              className={`rounded-md px-2.5 py-1 transition-all cursor-pointer ${
                filterMode === "urgent"
                  ? "bg-card text-rose-600 dark:text-rose-400 shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Urgentes / Vencidas ({stats.totalUrgent})
            </button>
            <button
              type="button"
              onClick={() => setFilterMode("warning")}
              className={`rounded-md px-2.5 py-1 transition-all cursor-pointer ${
                filterMode === "warning"
                  ? "bg-card text-foreground shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Próximas (≤ 4d) ({stats.totalUrgent + stats.warning})
            </button>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => navigate("/samples")}
            className="text-xs text-muted-foreground hover:text-foreground gap-1 h-7"
          >
            <span>Ver todas las OT</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {filteredList.length === 0 ? (
          <div className="py-12 text-center px-4">
            <div className="mx-auto h-12 w-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground mb-3">
              <CheckCircle2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <p className="text-sm font-semibold text-foreground">
              {filterMode === "all"
                ? "No hay órdenes de trabajo pendientes en laboratorio"
                : "No hay órdenes con la urgencia seleccionada"}
            </p>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
              {filterMode === "all"
                ? "Cuando se reciban muestras y se emitan órdenes de trabajo, aparecerán aquí ordenadas por su orden de llegada."
                : "Todas las órdenes pendientes se encuentran en plazo regular."}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border/50">
            {filteredList.map((order, index) => {
              const { deadlineInfo } = order;
              const DeadlineIcon = deadlineInfo.icon;
              const clientName = order.client_name || order.client?.name || "Sin cliente";
              const applicantName =
                order.applicant_name ||
                order.client?.representative ||
                order.client?.contact ||
                "—";
              const element = order.element_to_test || order.elementToTest || "Elemento general";
              const samplesCount = order.samples_count ?? order.samplesCount ?? "—";

              return (
                <div
                  key={order.id}
                  onClick={() => order.id && navigate(`/samples/${order.id}`)}
                  className={cn(
                    "flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 hover:bg-muted/30 transition-colors cursor-pointer group",
                    deadlineInfo.rowHighlight
                  )}
                >
                  {/* Columna Izquierda: Posición en cola + Datos principales */}
                  <div className="flex items-start gap-3 min-w-0">
                    {/* Badge de orden de llegada */}
                    <div className="flex flex-col items-center justify-center h-10 w-10 rounded-lg bg-muted text-muted-foreground border border-border/60 shrink-0 font-mono text-xs">
                      <span className="text-[9px] uppercase font-sans text-muted-foreground/70">Cola</span>
                      <span className="font-bold text-foreground">#{index + 1}</span>
                    </div>

                    <div className="min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-heading font-semibold text-sm text-foreground group-hover:text-primary transition-colors">
                          Orden #{order.code || "----"}
                        </span>
                        {order.essay_track_code && (
                          <Badge variant="outline" className="text-[11px] h-5 bg-background">
                            Ensayo: #{order.essay_track_code}
                          </Badge>
                        )}
                        <Badge
                          variant={deadlineInfo.badgeVariant}
                          className={cn("text-[11px] gap-1 h-5 px-2", deadlineInfo.badgeClass)}
                        >
                          <DeadlineIcon className="h-3 w-3" />
                          <span>{deadlineInfo.label}</span>
                        </Badge>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                        <span className="font-medium text-foreground/90 truncate max-w-[200px]">
                          {clientName}
                        </span>
                        <span>•</span>
                        <span className="truncate max-w-[180px]">Sol: {applicantName}</span>
                        <span>•</span>
                        <span className="truncate max-w-[220px] text-foreground/80">
                          {element} ({samplesCount} muestras)
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Columna Derecha: Fechas (Llegada vs Deadline) y Botón */}
                  <div className="flex flex-wrap items-center justify-between lg:justify-end gap-4 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-border/30">
                    <div className="grid grid-cols-2 gap-4 text-xs text-right">
                      {/* Fecha de llegada */}
                      <div className="text-left lg:text-right">
                        <span className="text-[11px] text-muted-foreground block">
                          Llegada / Recepción
                        </span>
                        <span className="font-medium text-foreground">
                          {formatArrivalDate(order.arrivalDate)}
                        </span>
                      </div>

                      {/* Fecha límite y advertencia */}
                      <div className="text-right">
                        <span className="text-[11px] text-muted-foreground block">
                          Fecha límite entrega
                        </span>
                        <span
                          className={cn(
                            "font-medium",
                            deadlineInfo.type === "expired"
                              ? "text-rose-600 dark:text-rose-400 font-semibold"
                              : deadlineInfo.type === "today" || deadlineInfo.type === "urgent"
                              ? "text-amber-600 dark:text-amber-400 font-semibold"
                              : "text-foreground"
                          )}
                        >
                          {order.report_delivery_deadline
                            ? formatArrivalDate(order.report_delivery_deadline)
                            : "Sin definir"}
                        </span>
                      </div>
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-8 gap-1 text-xs group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all ml-auto lg:ml-0"
                    >
                      <span>Gestionar OT</span>
                      <ChevronRight className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
