import { useNavigate } from "react-router-dom";
import {
  Building2,
  ClipboardList,
  Clock,
  Download,
  FileCheck,
  FlaskConical,
  Package,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import StatusBadge from "./StatusBadge";

const STATUS_MAP = {
  ANALYZING: { text: "En análisis", color: "#1d4ed8", background: "#dbeafe" },
  COMPLETED: { text: "Completada", color: "#15803d", background: "#dcfce7" },
  CANCELLED: { text: "Cancelada", color: "#b91c1c", background: "#fee2e2" },
};

function asText(value) {
  if (value == null || value === "") return null;
  if (typeof value === "object") return value.name || value.code || null;
  return String(value);
}

function Field({ icon, label, value }) {
  return (
    <div className="flex items-start gap-2.5">
      <div className="rounded-lg bg-primary/10 p-1.5 text-primary shrink-0 mt-0.5">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium text-foreground truncate">{value || "—"}</p>
      </div>
    </div>
  );
}

export default function WorkOrderCard({
  workOrder,
  variant = "list",
  onDownload,
  onEmit,
  showEmitReportButton,
  emittingReport,
}) {
  const navigate = useNavigate();
  const isDetail = variant === "detail";
  const elementToTest = asText(workOrder?.element_to_test ?? workOrder?.elementToTest);
  const essayType = asText(
    workOrder?.essay_type_name || workOrder?.essay_type || workOrder?.type_name || workOrder?.type,
  );
  const clientName =
    asText(
      workOrder?.client_name ||
      workOrder?.client?.name ||
      workOrder?.client?.business?.name ||
      workOrder?.client?.contact?.name ||
      workOrder?.contact?.name ||
      workOrder?.applicant_name ||
      workOrder?.essay?.client?.name
    ) || "—";

  const essayLabel = workOrder?.essay_track_code
    ? `#${workOrder.essay_track_code}`
    : workOrder?.essay_code
    ? `#${workOrder.essay_code}`
    : "—";

  const generatedAt = workOrder?.generated_at ? new Date(workOrder.generated_at) : null;
  const deadline = workOrder?.report_delivery_deadline ? new Date(workOrder.report_delivery_deadline) : null;

  let progressPercent = null;
  let progressColor = "#15803d";
  let labelTiempo = "—";

  if (generatedAt && deadline && !Number.isNaN(generatedAt.getTime()) && !Number.isNaN(deadline.getTime())) {
    const now = new Date();
    const totalMs = deadline.getTime() - generatedAt.getTime();
    const elapsedMs = now.getTime() - generatedAt.getTime();
    progressPercent = totalMs > 0 ? Math.max(0, Math.min(100, (elapsedMs / totalMs) * 100)) : 100;

    const diffDays = Math.round((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    const fecha = deadline.toLocaleDateString("es-AR");
    if (diffDays < 0) {
      labelTiempo = `Vencido (${fecha})`;
      progressColor = "#dc2626";
    } else if (diffDays === 0) {
      labelTiempo = `Vence hoy (${fecha})`;
      progressColor = "#e67e22";
    } else {
      labelTiempo = `Faltan ${diffDays} día${diffDays === 1 ? "" : "s"} (${fecha})`;
      progressColor = diffDays <= 1 ? "#dc2626" : diffDays <= 3 ? "#e67e22" : "#15803d";
    }
  }

  return (
    <Card
      className={
        !isDetail ? "cursor-pointer transition-colors hover:bg-muted/40 shadow-xs" : "shadow-xs"
      }
      onClick={() => {
        if (!isDetail && workOrder?.id) navigate(`/samples/${workOrder.id}`);
      }}
    >
      <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3 border-b border-border/50 pb-3">
        <div className="flex flex-wrap items-center gap-3">
          <CardTitle className="font-heading text-lg font-semibold text-foreground">
            Orden de trabajo #{workOrder?.code || "----"}
          </CardTitle>
          <StatusBadge status={workOrder?.status} map={STATUS_MAP} />
        </div>
        {(onDownload || showEmitReportButton) && (
          <div className="flex flex-wrap items-center gap-2">
            {onDownload ? (
              <Button
                size="sm"
                variant="outline"
                className="h-8 text-xs font-medium"
                onClick={(event) => {
                  event.stopPropagation();
                  onDownload();
                }}
              >
                <Download className="size-3.5 mr-1.5" />
                Descargar orden
              </Button>
            ) : null}
            {showEmitReportButton && onEmit ? (
              <Button
                size="sm"
                className="h-8 text-xs font-medium"
                disabled={emittingReport}
                onClick={(event) => {
                  event.stopPropagation();
                  onEmit();
                }}
              >
                <FileCheck className="size-3.5 mr-1.5" />
                {emittingReport ? "Emitiendo..." : "Emitir informe"}
              </Button>
            ) : null}
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-4 pt-3">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Field
            icon={<ClipboardList className="size-4" />}
            label="Solicitud / Ensayo"
            value={essayLabel}
          />
          <Field
            icon={<Building2 className="size-4" />}
            label="Cliente"
            value={clientName}
          />
          <Field
            icon={<FlaskConical className="size-4" />}
            label="Tipo de ensayo"
            value={essayType}
          />
          <Field
            icon={<Package className="size-4" />}
            label="Elemento a ensayar"
            value={elementToTest}
          />
        </div>
        {progressPercent !== null && workOrder?.status === "ANALYZING" ? (
          <div className="space-y-2 border-t border-border/40 pt-3">
            <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5 font-medium text-foreground">
                <Clock className="size-3.5 text-primary" />
                Tiempo para emitir informe
              </span>
              <span className="font-medium">{labelTiempo}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${progressPercent}%`, backgroundColor: progressColor }}
              />
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
