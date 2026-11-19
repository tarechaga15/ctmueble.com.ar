import { useNavigate } from "react-router-dom";
import {
  Building2,
  Calendar,
  ClipboardList,
  FlaskConical,
  Package,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import StatusBadge from "./StatusBadge";

const STATUS_MAP = {
  REQUESTED: { text: "Solicitado", color: "#a16207", background: "#fef3c7" },
  ACCEPTED: { text: "Aceptado", color: "#1d4ed8", background: "#dbeafe" },
  REJECTED: { text: "Rechazado", color: "#b91c1c", background: "#fee2e2" },
  SERVICE_AGREEMENT_MADED: {
    text: "Contrato generado",
    color: "#7e22ce",
    background: "#f3e8ff",
  },
  IN_WORK: { text: "En trabajo", color: "#1d4ed8", background: "#dbeafe" },
  COMPLETED: { text: "Completado", color: "#15803d", background: "#dcfce7" },
  CANCELLED: { text: "Cancelado", color: "#b91c1c", background: "#fee2e2" },
};

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

function formatDate(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toLocaleDateString("es-AR");
}

export default function EssayCard({
  essay,
  variant = "list",
  onStatusClick,
  notice,
  actions,
}) {
  const navigate = useNavigate();
  const isDetail = variant === "detail";
  const typeName =
    essay?.type?.name || (typeof essay?.type === "string" ? essay.type : null);
  const elements = essay?.elements;
  const clientName =
    essay?.client?.name ||
    essay?.client?.contact?.name ||
    essay?.contact?.name ||
    "A nombre personal";

  const requestDateFmt = formatDate(essay?.requestDate);
  const solicitudLabel = essay?.code
    ? `#${essay.code}${requestDateFmt ? ` · ${requestDateFmt}` : ""}`
    : requestDateFmt || "—";

  return (
    <Card
      className={
        !isDetail ? "cursor-pointer transition-colors hover:bg-muted/40 shadow-xs" : "shadow-xs"
      }
      onClick={() => {
        if (!isDetail && essay?.id) navigate(`/essay/${essay.id}`);
      }}
    >
      <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3 border-b border-border/50 pb-3">
        <CardTitle className="font-heading text-lg font-semibold text-foreground">
          Solicitud de ensayo #{essay?.code || "----"}
        </CardTitle>
        <StatusBadge
          status={essay?.status}
          map={STATUS_MAP}
          onClick={onStatusClick}
        />
      </CardHeader>
      <CardContent className="space-y-4 pt-3">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Field
            icon={<ClipboardList className="size-4" />}
            label="Solicitud"
            value={solicitudLabel}
          />
          <Field
            icon={<Building2 className="size-4" />}
            label="Cliente"
            value={clientName}
          />
          <Field
            icon={<FlaskConical className="size-4" />}
            label="Tipo de ensayo"
            value={typeName}
          />
          <Field
            icon={<Package className="size-4" />}
            label="Elemento a ensayar"
            value={elements?.product}
          />
        </div>
        {notice || actions ? (
          <div className="space-y-3 border-t pt-3">
            {notice ? (
              <p className="text-sm text-muted-foreground">{notice}</p>
            ) : null}
            {actions}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
