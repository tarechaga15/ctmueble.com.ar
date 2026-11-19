import { useState } from "react";
import Modal from "../Modal";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  FileCheck,
  ShieldCheck,
  Loader2,
} from "lucide-react";

/**
 * Modal para confirmar la re-emisión manual de la solicitud de ensayo (F-PC13-01).
 * Genera una nueva snapshot criptográfica inmutable firmada y certificada con OpenTimestamps (OTS).
 */
export default function ReissueRequestModal({
  show,
  onClose,
  onConfirm,
  loading,
}) {
  const [reason, setReason] = useState("");

  const handleConfirm = async () => {
    try {
      await onConfirm(reason);
      setReason("");
      onClose();
    } catch {
      // Error manejado por el padre mediante toast
    }
  };

  return (
    <Modal
      show={show}
      onClose={onClose}
      title="Re-emitir Solicitud de Ensayo (F-PC13-01)"
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
            type="button"
            disabled={loading}
            onClick={handleConfirm}
          >
            {loading ? (
              <>
                <Loader2 className="size-4 animate-spin mr-1.5" />
                Re-emitiendo...
              </>
            ) : (
              <>
                <FileCheck className="size-4 mr-1.5" />
                Re-emitir solicitud modificada
              </>
            )}
          </Button>
        </>
      }
    >
      <div className="w-full space-y-4">
        <Card className="shadow-none">
          <CardHeader className="flex flex-row items-center gap-3 border-b border-border/50 pb-3">
            <div className="rounded-lg p-2 shrink-0 bg-primary/10 text-primary">
              <ShieldCheck className="size-4" />
            </div>
            <div>
              <CardTitle className="text-sm font-semibold text-foreground">
                Re-emisión de Formulario con Modificación
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Se registrará una nueva snapshot de auditoría con firma criptográfica y sello OpenTimestamps (OTS).
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="pt-4 text-xs leading-relaxed text-foreground space-y-3">
            <p>
              El formulario <strong>F-PC13-01</strong> se reemitirá reflejando los datos actualizados del ensayo
              con versión secuencial y marca de modificación.
            </p>
            <div className="space-y-1.5">
              <Label htmlFor="reissue-reason" className="text-xs font-medium">
                Motivo de la modificación (opcional)
              </Label>
              <Input
                id="reissue-reason"
                placeholder="Ej.: Actualización de razón social o domicilio del solicitante"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                disabled={loading}
                className="text-xs"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </Modal>
  );
}
