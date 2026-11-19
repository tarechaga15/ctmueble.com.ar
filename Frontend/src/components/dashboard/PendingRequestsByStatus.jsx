import { useNavigate } from "react-router-dom";
import {
  Inbox,
  CheckCircle2,
  FileSignature,
  FlaskConical,
  CheckCheck,
  XCircle,
  ArrowUpRight,
  Layers,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import AnimatedCounter from "./AnimatedCounter";
import { cn } from "@/lib/utils";

const PIPELINE_STEPS = [
  {
    id: "REQUESTED",
    label: "Solicitadas",
    sublabel: "Nuevas por revisar",
    icon: Inbox,
    color: "#a16207",
    bg: "#fef3c7",
    toneClass: "border-amber-200 dark:border-amber-900/40 bg-amber-500/5 hover:bg-amber-500/10",
    barColor: "bg-amber-500",
  },
  {
    id: "ACCEPTED",
    label: "Aceptadas",
    sublabel: "Pendiente contrato",
    icon: CheckCircle2,
    color: "#1d4ed8",
    bg: "#dbeafe",
    toneClass: "border-blue-200 dark:border-blue-900/40 bg-blue-500/5 hover:bg-blue-500/10",
    barColor: "bg-blue-500",
  },
  {
    id: "SERVICE_AGREEMENT_MADED",
    label: "Contrato generado",
    sublabel: "Esperando muestras",
    icon: FileSignature,
    color: "#7e22ce",
    bg: "#f3e8ff",
    toneClass: "border-purple-200 dark:border-purple-900/40 bg-purple-500/5 hover:bg-purple-500/10",
    barColor: "bg-purple-500",
  },
  {
    id: "IN_WORK",
    label: "En proceso",
    sublabel: "En análisis de lab",
    icon: FlaskConical,
    color: "#0284c7",
    bg: "#e0f2fe",
    toneClass: "border-sky-200 dark:border-sky-900/40 bg-sky-500/5 hover:bg-sky-500/10",
    barColor: "bg-sky-500",
  },
];

export default function PendingRequestsByStatus({ essays = [] }) {
  const navigate = useNavigate();

  const safeEssays = Array.isArray(essays) ? essays : [];

  // Counts
  const counts = {
    REQUESTED: safeEssays.filter((e) => e?.status === "REQUESTED").length,
    ACCEPTED: safeEssays.filter((e) => e?.status === "ACCEPTED").length,
    SERVICE_AGREEMENT_MADED: safeEssays.filter((e) => e?.status === "SERVICE_AGREEMENT_MADED").length,
    IN_WORK: safeEssays.filter((e) => e?.status === "IN_WORK").length,
    COMPLETED: safeEssays.filter((e) => e?.status === "COMPLETED").length,
    CANCELLED: safeEssays.filter((e) => e?.status === "CANCELLED" || e?.status === "REJECTED").length,
  };

  const totalActive =
    counts.REQUESTED + counts.ACCEPTED + counts.SERVICE_AGREEMENT_MADED + counts.IN_WORK;

  return (
    <Card className="shadow-xs border-border/80">
      <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-border/60">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
            <Layers className="h-4 w-4" />
          </div>
          <div>
            <CardTitle className="text-base font-semibold text-foreground">
              Solicitudes pendientes según estado
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              Flujo operativo actual ({totalActive} en circuito activo)
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => navigate("/essays")}
          className="text-xs font-medium text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors cursor-pointer select-none"
        >
          <span>Ver todas</span>
          <ArrowUpRight className="h-3.5 w-3.5" />
        </button>
      </CardHeader>

      <CardContent className="pt-4 space-y-4">
        {/* Barra de progreso de distribución */}
        {totalActive > 0 ? (
          <div className="space-y-1.5">
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted/60 flex">
              {PIPELINE_STEPS.map((step) => {
                const count = counts[step.id] || 0;
                if (count === 0) return null;
                const pct = (count / totalActive) * 100;
                return (
                  <div
                    key={step.id}
                    className={cn("h-full transition-all duration-500", step.barColor)}
                    style={{ width: `${pct}%` }}
                    title={`${step.label}: ${count} (${Math.round(pct)}%)`}
                  />
                );
              })}
            </div>
            <div className="flex items-center justify-between text-[11px] text-muted-foreground px-0.5">
              <span>Ingreso de solicitud</span>
              <span>Ensayos en laboratorio</span>
            </div>
          </div>
        ) : null}

        {/* Tarjetas interactivas de cada estado */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {PIPELINE_STEPS.map((step) => {
            const count = counts[step.id] || 0;
            const Icon = step.icon;

            return (
              <div
                key={step.id}
                onClick={() => navigate(`/essays?status=${step.id}`)}
                className={cn(
                  "group relative rounded-xl border p-3.5 transition-all duration-200 cursor-pointer shadow-xs",
                  step.toneClass
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <div
                    className="flex h-7 w-7 items-center justify-center rounded-lg"
                    style={{ backgroundColor: step.bg, color: step.color }}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <Badge variant="secondary" className="text-[10px] font-medium px-1.5 py-0 h-4.5">
                    {step.label}
                  </Badge>
                </div>

                <div className="text-2xl font-bold tracking-tight text-foreground">
                  <AnimatedCounter value={count} />
                </div>

                <p className="text-xs text-muted-foreground mt-0.5 font-medium">
                  {step.sublabel}
                </p>

                <div className="mt-2 text-[11px] text-primary/80 group-hover:text-primary flex items-center gap-1 font-medium transition-colors">
                  <span>Filtrar estado</span>
                  <ArrowUpRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Cierre / Histórico */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-border/40 text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <CheckCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Finalizados exitosamente:</span>
              <strong className="text-foreground">{counts.COMPLETED}</strong>
            </span>
            <span className="flex items-center gap-1.5">
              <XCircle className="h-3.5 w-3.5 text-rose-600 dark:text-rose-400" />
              <span>Rechazados / Cancelados:</span>
              <strong className="text-foreground">{counts.CANCELLED}</strong>
            </span>
          </div>
          <span className="text-[11px]">
            Total histórico: <strong>{essays.length}</strong> solicitudes
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
