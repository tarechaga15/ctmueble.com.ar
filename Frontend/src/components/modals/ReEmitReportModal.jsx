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
  AlertTriangle,
  FileText,
  Copy,
  FileCheck,
  Loader2,
} from "lucide-react";

/**
 * Modal para confirmar la re-emisión del informe de ensayo.
 * Indica al usuario si se generará una copia numerada o una modificación.
 * @param {boolean} show
 * @param {() => void} onClose
 * @param {'COPY'|'MODIFICATION'} emissionType - Tipo de emisión que realizará el backend
 * @param {() => Promise<void>} onConfirm - Al confirmar, llama al servicio y cierra
 * @param {boolean} loading
 */
export default function ReEmitReportModal({
  show,
  onClose,
  emissionType,
  onConfirm,
  loading,
}) {
  const isModification = emissionType === "MODIFICATION";

  const handleConfirm = async () => {
    try {
      await onConfirm();
      onClose();
    } catch {
      // Error ya manejado por el padre (toast); mantener modal abierto
    }
  };

  return (
    <Modal
      show={show}
      onClose={onClose}
      title="Re-emitir Informe de Ensayo (F-PC15-01)"
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
            ) : isModification ? (
              <>
                <FileCheck className="size-4 mr-1.5" />
                Re-emitir como modificación
              </>
            ) : (
              <>
                <Copy className="size-4 mr-1.5" />
                Re-emitir como copia
              </>
            )}
          </Button>
        </>
      }
    >
      <div className="w-full space-y-4">
        {/* Card con explicación del tipo de re-emisión */}
        <Card className="shadow-none">
          <CardHeader className="flex flex-row items-center gap-3 border-b border-border/50 pb-3">
            <div
              className={`rounded-lg p-2 shrink-0 ${
                isModification
                  ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
                  : "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"
              }`}
            >
              {isModification ? (
                <AlertTriangle className="size-4" />
              ) : (
                <FileText className="size-4" />
              )}
            </div>
            <div>
              <CardTitle className="text-sm font-semibold text-foreground">
                {isModification
                  ? "Re-emisión por Modificación"
                  : "Re-emisión de Copia Numerada"}
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                {isModification
                  ? "Se detectaron cambios en las mediciones posteriores al último informe."
                  : "Los datos analizados no han variado desde la última emisión."}
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="pt-4 text-xs leading-relaxed text-foreground">
            {isModification ? (
              <p>
                El informe se emitirá con una nueva numeración de versión{" "}
                <strong className="text-amber-700 dark:text-amber-400">
                  (Modificación)
                </strong>
                , reflejando fielmente los nuevos valores registrados en la orden de trabajo.
              </p>
            ) : (
              <p>
                Se generará una nueva{" "}
                <strong className="text-blue-700 dark:text-blue-400">
                  Copia numerada
                </strong>{" "}
                idéntica al informe original, manteniendo la trazabilidad histórica del ensayo.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </Modal>
  );
}
