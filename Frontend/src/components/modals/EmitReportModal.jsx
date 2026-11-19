import Modal from "../Modal";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { ShieldCheck, CheckCircle2, FileCheck, Loader2 } from "lucide-react";

/**
 * Modal para confirmar la emisión formal del informe de ensayo (F-PC15-01).
 * @param {boolean} show
 * @param {() => void} onClose
 * @param {() => Promise<void>} onConfirm
 * @param {boolean} loading
 */
export default function EmitReportModal({ show, onClose, onConfirm, loading }) {
  const handleConfirm = async () => {
    try {
      await onConfirm();
      onClose();
    } catch {
      // Error ya manejado por el padre
    }
  };

  return (
    <Modal
      show={show}
      onClose={onClose}
      title="Emitir Informe de Ensayo (F-PC15-01)"
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
                Emitiendo informe...
              </>
            ) : (
              <>
                <FileCheck className="size-4 mr-1.5" />
                Emitir informe formal
              </>
            )}
          </Button>
        </>
      }
    >
      <div className="w-full space-y-4">
        {/* Card explicativa */}
        <Card className="shadow-none">
          <CardHeader className="flex flex-row items-center gap-3 border-b border-border/50 pb-3">
            <div className="rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 p-2 shrink-0">
              <ShieldCheck className="size-4" />
            </div>
            <div>
              <CardTitle className="text-sm font-semibold text-foreground">
                Cierre Técnico y Emisión Oficial
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Generación del documento de informe de ensayo con resultados validados.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="pt-4 space-y-3">
            <div className="space-y-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-3.5 text-emerald-600 shrink-0" />
                <span className="text-foreground">
                  Se generará el archivo oficial numerado en formato PDF (F-PC15-01).
                </span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-3.5 text-emerald-600 shrink-0" />
                <span className="text-foreground">
                  El estado del ensayo avanzará a <strong>COMPLETADO</strong>.
                </span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-3.5 text-emerald-600 shrink-0" />
                <span className="text-foreground">
                  El informe y los valores finales quedarán disponibles inmediatamente para el cliente.
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Nota informativa */}
        <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/70 dark:border-emerald-900/50 dark:bg-emerald-950/20 text-xs text-emerald-900 dark:text-emerald-200 leading-relaxed">
          Si con posterioridad a esta emisión se actualizaran valores analizados o datos de probetas, el sistema requerirá generar una <strong>re-emisión por modificación</strong>.
        </div>
      </div>
    </Modal>
  );
}
