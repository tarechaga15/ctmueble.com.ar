import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  BellRing,
  Inbox,
  Clock,
  ArrowUpRight,
  ChevronRight,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import StatusBadge from "../StatusBadge";

const ESSAY_STATUS_MAP = {
  REQUESTED: { text: "Solicitado", color: "#a16207", background: "#fef3c7" },
  ACCEPTED: { text: "Aceptado", color: "#1d4ed8", background: "#dbeafe" },
  REJECTED: { text: "Rechazado", color: "#b91c1c", background: "#fee2e2" },
  SERVICE_AGREEMENT_MADED: { text: "Contrato generado", color: "#7e22ce", background: "#f3e8ff" },
  IN_WORK: { text: "En proceso", color: "#1d4ed8", background: "#dbeafe" },
  COMPLETED: { text: "Completado", color: "#15803d", background: "#dcfce7" },
  CANCELLED: { text: "Cancelado", color: "#b91c1c", background: "#fee2e2" },
};

function formatRelativeTime(dateString) {
  if (!dateString) return "—";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "—";
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffHours < 1) return "Recién ingresada";
  if (diffHours < 24) return `Hace ${diffHours} h`;
  if (diffDays === 1) return "Ayer";
  if (diffDays < 7) return `Hace ${diffDays} días`;
  return date.toLocaleDateString("es-AR");
}

function formatDateExact(dateString) {
  if (!dateString) return "—";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("es-AR");
}

export default function RecentIncomingRequests({ essays = [] }) {
  const navigate = useNavigate();
  const [tab, setTab] = useState("pendingReview"); // 'pendingReview' | 'allRecent'

  // Nuevas por revisar (status === 'REQUESTED')
  const pendingReviewEssays = useMemo(() => {
    const list = Array.isArray(essays) ? essays : [];
    return list
      .filter((e) => e && e.status === "REQUESTED")
      .sort((a, b) => new Date(b?.requestDate || 0) - new Date(a?.requestDate || 0));
  }, [essays]);

  // Recientes en general
  const allRecentEssays = useMemo(() => {
    const list = Array.isArray(essays) ? essays : [];
    return [...list]
      .filter(Boolean)
      .sort((a, b) => new Date(b?.requestDate || 0) - new Date(a?.requestDate || 0))
      .slice(0, 10);
  }, [essays]);

  const displayedList = tab === "pendingReview" ? pendingReviewEssays : allRecentEssays;

  return (
    <Card className="shadow-xs border-border/80">
      <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3 pb-3 border-b border-border/60">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400">
            <BellRing className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <CardTitle className="text-base font-semibold text-foreground">
                Nuevas solicitudes que van llegando
              </CardTitle>
              {pendingReviewEssays.length > 0 && (
                <Badge
                  variant="secondary"
                  className="bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300 text-[10px] font-semibold"
                >
                  {pendingReviewEssays.length} por revisar
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Cola de solicitudes entrantes y registros recientes
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Tabs switch */}
          <div className="flex rounded-lg bg-muted/70 p-0.5 text-xs font-medium">
            <button
              type="button"
              onClick={() => setTab("pendingReview")}
              className={`rounded-md px-2.5 py-1 transition-all cursor-pointer ${
                tab === "pendingReview"
                  ? "bg-card text-foreground shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Por revisar ({pendingReviewEssays.length})
            </button>
            <button
              type="button"
              onClick={() => setTab("allRecent")}
              className={`rounded-md px-2.5 py-1 transition-all cursor-pointer ${
                tab === "allRecent"
                  ? "bg-card text-foreground shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Últimas recibidas
            </button>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => navigate("/essays")}
            className="text-xs text-muted-foreground hover:text-foreground gap-1 h-7"
          >
            <span>Ver todas</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="pt-3 p-0">
        {displayedList.length === 0 ? (
          <div className="py-10 text-center px-4">
            <div className="mx-auto h-12 w-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-3">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <p className="text-sm font-semibold text-foreground">
              {tab === "pendingReview"
                ? "¡Al día! No hay nuevas solicitudes pendientes de revisión"
                : "No se encontraron solicitudes registradas"}
            </p>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
              {tab === "pendingReview"
                ? "Todas las solicitudes entrantes fueron evaluadas. Las nuevas que ingresen por clientes aparecerán aquí."
                : "Podés dar de alta una nueva solicitud utilizando el botón de acción rápida."}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border/50">
            {displayedList.map((essay) => {
              const clientName = essay.client?.name || "Sin cliente titular";
              const applicantName =
                essay.contact?.name ||
                essay.client?.contact?.name ||
                essay.client?.representative?.name ||
                "—";
              const element = essay.elements?.product || "Elemento no especificado";
              const isRequested = essay.status === "REQUESTED";

              return (
                <div
                  key={essay.id}
                  onClick={() => essay.id && navigate(`/essay/${essay.id}`)}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 hover:bg-muted/30 transition-colors cursor-pointer group"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div
                      className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                        isRequested
                          ? "bg-amber-500/15 text-amber-700 dark:text-amber-300 font-bold"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      <Inbox className="h-4 w-4" />
                    </div>

                    <div className="min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-heading font-semibold text-sm text-foreground group-hover:text-primary transition-colors">
                          {essay.code || "Sin código"}
                        </span>
                        <StatusBadge status={essay.status} map={ESSAY_STATUS_MAP} />
                        {isRequested && (
                          <Badge
                            variant="secondary"
                            className="bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950 dark:text-amber-200 text-[10px] h-4.5"
                          >
                            <Sparkles className="h-2.5 w-2.5 mr-0.5 text-amber-600" />
                            Requiere revisión
                          </Badge>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                        <span className="font-medium text-foreground/90 truncate max-w-[200px]">
                          {clientName}
                        </span>
                        <span>•</span>
                        <span className="truncate max-w-[180px]">Sol: {applicantName}</span>
                        <span>•</span>
                        <span className="truncate max-w-[220px] text-foreground/80">
                          {element}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-1 sm:pt-0">
                    <div className="text-right text-xs">
                      <div className="flex items-center gap-1 text-muted-foreground justify-end">
                        <Clock className="h-3 w-3" />
                        <span className="font-medium">{formatRelativeTime(essay.requestDate)}</span>
                      </div>
                      <span className="text-[11px] text-muted-foreground/80">
                        {formatDateExact(essay.requestDate)}
                      </span>
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-8 gap-1 text-xs group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all"
                    >
                      <span>Revisar</span>
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
