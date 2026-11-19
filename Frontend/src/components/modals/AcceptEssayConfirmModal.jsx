import Modal from "../Modal";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  CheckCircle2,
  Building2,
  FlaskConical,
  Package,
  Calendar,
  Loader2,
  Receipt,
  FileText,
} from "lucide-react";
import { formatCuit } from "../steps/client-creation/BussinessSearch";

export default function AcceptEssayConfirmModal({
  show,
  onClose,
  essay,
  onConfirm,
  loading,
}) {
  if (!essay) return null;

  const clientName = essay.client?.name || essay.client?.contact?.name || "—";
  const clientCuit = essay.client?.cuit ? formatCuit(essay.client.cuit) : "—";
  const essayType =
    essay.type?.name || (typeof essay.type === "string" ? essay.type : "—");
  const product = essay.elements?.product || "—";
  const manufacturer = essay.elements?.manufacturer || "—";
  const requestDate = essay.requestDate
    ? new Date(essay.requestDate).toLocaleDateString("es-AR")
    : "—";

  return (
    <Modal
      show={show}
      onClose={onClose}
      title="Aceptar Solicitud de Ensayo"
      footer={
        <>
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={loading}
          >
            Revisar después
          </Button>
          <Button
            type="button"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="size-4 animate-spin mr-1.5" />
                Aceptando...
              </>
            ) : (
              <>
                <CheckCircle2 className="size-4 mr-1.5" />
                Confirmar aceptación
              </>
            )}
          </Button>
        </>
      }
    >
      <div className="w-full space-y-4">
        {/* Card de resumen del ensayo */}
        <Card className="shadow-none">
          <CardHeader className="flex flex-row items-center gap-3 border-b border-border/50 pb-3">
            <div className="rounded-lg bg-primary/10 p-2 text-primary shrink-0">
              <FlaskConical className="size-4" />
            </div>
            <div>
              <CardTitle className="text-sm font-semibold text-foreground">
                Resumen de la Solicitud #{essay.code || "----"}
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Verificá la información clave antes de dar tu conformidad técnica.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="flex items-start gap-2.5">
                <div className="rounded-md bg-muted/60 p-1.5 text-muted-foreground shrink-0 mt-0.5">
                  <Building2 className="size-3.5" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] text-muted-foreground">Cliente / Razón Social</p>
                  <p className="text-xs font-semibold text-foreground truncate">{clientName}</p>
                  <p className="text-[11px] text-muted-foreground font-mono">{clientCuit}</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="rounded-md bg-muted/60 p-1.5 text-muted-foreground shrink-0 mt-0.5">
                  <FlaskConical className="size-3.5" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] text-muted-foreground">Tipo de Ensayo</p>
                  <p className="text-xs font-semibold text-foreground truncate">{essayType}</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="rounded-md bg-muted/60 p-1.5 text-muted-foreground shrink-0 mt-0.5">
                  <Package className="size-3.5" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] text-muted-foreground">Elemento a Ensayar</p>
                  <p className="text-xs font-medium text-foreground truncate">{product}</p>
                  {manufacturer && manufacturer !== "—" && (
                    <p className="text-[11px] text-muted-foreground truncate">
                      Fab: {manufacturer}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="rounded-md bg-muted/60 p-1.5 text-muted-foreground shrink-0 mt-0.5">
                  <Calendar className="size-3.5" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] text-muted-foreground">Fecha de Solicitud</p>
                  <p className="text-xs font-medium text-foreground">{requestDate}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Banner informativo de siguiente paso */}
        <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/70 dark:border-emerald-900/50 dark:bg-emerald-950/20 flex items-start gap-3">
          <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 shrink-0 mt-0.5">
            <FileText className="size-4" />
          </div>
          <div className="text-xs text-emerald-950 dark:text-emerald-200 space-y-1">
            <p className="font-semibold">Próximo paso tras la aceptación</p>
            <p className="text-emerald-800 dark:text-emerald-300 leading-relaxed">
              El estado pasará a <strong>ACEPTADO</strong> y quedará habilitada la generación del acuerdo de servicio (contrato F-PC13-02) para formalizar los plazos y costo del ensayo.
            </p>
          </div>
        </div>
      </div>
    </Modal>
  );
}
