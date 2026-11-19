import { useState, useEffect } from "react";
import Modal from "../Modal";
import ErrorAlert from "../ErrorAlert";
import { useToast } from "../../context/ToastContext";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { XCircle, AlertTriangle, Loader2 } from "lucide-react";

export default function RejectEssayModal({ show, onClose, onReject, loading }) {
  const { error: showErrorToast } = useToast();
  const [observations, setObservations] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!show) {
      setObservations("");
      setError("");
    }
  }, [show]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await onReject(observations.trim() || null);
      onClose();
    } catch (err) {
      const message =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        err?.message ||
        "Error al rechazar el ensayo";
      setError(message);
      showErrorToast(message);
    }
  };

  return (
    <Modal
      show={show}
      onClose={onClose}
      title="Rechazar Solicitud de Ensayo"
      onSubmit={handleSubmit}
      footer={
        <>
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="destructive"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="size-4 animate-spin mr-1.5" />
                Rechazando...
              </>
            ) : (
              <>
                <XCircle className="size-4 mr-1.5" />
                Confirmar rechazo
              </>
            )}
          </Button>
        </>
      }
    >
      <div className="w-full space-y-4">
        {/* Alerta de acción irreversible */}
        <div className="p-3.5 rounded-xl border border-destructive/20 bg-destructive/5 flex items-start gap-3">
          <div className="p-1.5 rounded-lg bg-destructive/10 text-destructive shrink-0 mt-0.5">
            <AlertTriangle className="size-4" />
          </div>
          <div className="text-xs text-foreground space-y-1">
            <p className="font-semibold text-destructive">Atención</p>
            <p className="text-muted-foreground leading-relaxed">
              Esta acción marcará el ensayo como <strong>RECHAZADO</strong> y notificará al cliente con los motivos especificados.
            </p>
          </div>
        </div>

        {/* Card con campo de observaciones */}
        <Card className="shadow-none">
          <CardHeader className="flex flex-row items-center gap-3 border-b border-border/50 pb-3">
            <div className="rounded-lg bg-destructive/10 p-2 text-destructive shrink-0">
              <XCircle className="size-4" />
            </div>
            <div>
              <CardTitle className="text-sm font-semibold text-foreground">
                Motivo del Rechazo
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Indicá las observaciones técnicas o administrativas (opcional).
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="pt-4 space-y-2">
            <Label htmlFor="rejectObservations" className="text-xs font-medium text-foreground">
              Observaciones para el cliente
            </Label>
            <textarea
              id="rejectObservations"
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
              placeholder="Ej.: Falta de documentación técnica, muestras no aptas para el tipo de ensayo solicitado o capacidad operativa..."
              rows={4}
              className="w-full rounded-lg border border-input bg-background p-3 text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            />
            <p className="text-[11px] text-muted-foreground">
              El cliente podrá visualizar estas observaciones en la ficha de su solicitud.
            </p>
          </CardContent>
        </Card>

        {error && <ErrorAlert message={error} className="text-sm" />}
      </div>
    </Modal>
  );
}
