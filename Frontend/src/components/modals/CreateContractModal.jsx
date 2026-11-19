import { useState, useEffect } from "react";
import Modal from "../Modal";
import ErrorAlert from "../ErrorAlert";
import { useToast } from "../../context/ToastContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  FileText,
  Calendar,
  DollarSign,
  Package,
  Loader2,
  CheckCircle2,
} from "lucide-react";

export default function CreateContractModal({
  show,
  onClose,
  onSuccess,
}) {
  const [daysToDo, setDaysToDo] = useState(30);
  const [price, setPrice] = useState(0);
  const [samplesConservationDays, setSamplesConservationDays] = useState(30);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const { success: showSuccessToast, error: showErrorToast } = useToast();

  useEffect(() => {
    if (!show) {
      setError("");
      setDaysToDo(30);
      setPrice(0);
      setSamplesConservationDays(30);
    }
  }, [show]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const d = parseInt(daysToDo, 10);
    const p = parseFloat(price);
    const s = parseInt(samplesConservationDays, 10);
    if (!d || d <= 0) {
      setError("Los días para realizar el ensayo deben ser un número positivo");
      return;
    }
    if (p < 0 || isNaN(p)) {
      setError("El precio debe ser un número mayor o igual a cero");
      return;
    }
    if (!s || s <= 0) {
      setError("Los días de conservación de muestras deben ser un número positivo");
      return;
    }
    setSubmitting(true);
    try {
      await onSuccess({
        days_to_do: d,
        price: p,
        samples_conservation_days: s,
      });
      showSuccessToast("Contrato generado correctamente.");
      onClose();
    } catch (err) {
      const message =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        err?.message ||
        "Error al generar el contrato";
      setError(message);
      showErrorToast(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      show={show}
      onClose={onClose}
      title="Generar Contrato de Ensayo (F-PC13-02)"
      onSubmit={handleSubmit}
      footer={
        <>
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={submitting}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={submitting}
          >
            {submitting ? (
              <>
                <Loader2 className="size-4 animate-spin mr-1.5" />
                Generando...
              </>
            ) : (
              <>
                <CheckCircle2 className="size-4 mr-1.5" />
                Generar contrato
              </>
            )}
          </Button>
        </>
      }
    >
      <div className="w-full space-y-4">
        {/* Card con campos de condiciones */}
        <Card className="shadow-none">
          <CardHeader className="flex flex-row items-center gap-3 border-b border-border/50 pb-3">
            <div className="rounded-lg bg-primary/10 p-2 text-primary shrink-0">
              <FileText className="size-4" />
            </div>
            <div>
              <CardTitle className="text-sm font-semibold text-foreground">
                Términos del Acuerdo
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Establecé los plazos, costo y condiciones del servicio acordadas con el cliente.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <div className="space-y-1.5">
              <Label
                htmlFor="daysToDo"
                className="text-xs font-medium text-foreground flex items-center gap-1.5"
              >
                <Calendar className="size-3.5 text-muted-foreground" />
                Días para realizar el ensayo *
              </Label>
              <Input
                id="daysToDo"
                type="number"
                min="1"
                value={daysToDo}
                onChange={(e) => setDaysToDo(e.target.value)}
                required
                className="text-xs h-9 border border-input bg-background shadow-xs px-3 focus-visible:ring-1 focus-visible:ring-ring"
              />
              <p className="text-[11px] text-muted-foreground">
                Plazo estimado en días hábiles desde la recepción de las muestras conformes.
              </p>
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="contractPrice"
                className="text-xs font-medium text-foreground flex items-center gap-1.5"
              >
                <DollarSign className="size-3.5 text-muted-foreground" />
                Precio del servicio (ARS) *
              </Label>
              <Input
                id="contractPrice"
                type="number"
                min="0"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
                className="text-xs h-9 border border-input bg-background shadow-xs px-3 focus-visible:ring-1 focus-visible:ring-ring"
              />
              <p className="text-[11px] text-muted-foreground">
                Importe total en pesos argentinos a facturar por la realización del ensayo.
              </p>
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="samplesConservationDays"
                className="text-xs font-medium text-foreground flex items-center gap-1.5"
              >
                <Package className="size-3.5 text-muted-foreground" />
                Días de conservación de muestras *
              </Label>
              <Input
                id="samplesConservationDays"
                type="number"
                min="1"
                value={samplesConservationDays}
                onChange={(e) => setSamplesConservationDays(e.target.value)}
                required
                className="text-xs h-9 border border-input bg-background shadow-xs px-3 focus-visible:ring-1 focus-visible:ring-ring"
              />
              <p className="text-[11px] text-muted-foreground">
                Tiempo que el laboratorio conservará las muestras remanentes tras finalizar el análisis.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Banner informativo de siguiente paso */}
        <div className="p-3.5 rounded-xl border border-blue-200 bg-blue-50/70 dark:border-blue-900/50 dark:bg-blue-950/20 flex items-start gap-3">
          <div className="p-1.5 rounded-lg bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 shrink-0 mt-0.5">
            <FileText className="size-4" />
          </div>
          <div className="text-xs text-blue-950 dark:text-blue-200 space-y-1">
            <p className="font-semibold">Documento Oficial F-PC13-02</p>
            <p className="text-blue-800 dark:text-blue-300 leading-relaxed">
              Al confirmar, el sistema emitirá el contrato con los datos legales y arancelarios fijados, y el ensayo pasará a la etapa de <strong>Recepción de Muestras</strong>.
            </p>
          </div>
        </div>

        {error && <ErrorAlert message={error} className="text-sm" />}
      </div>
    </Modal>
  );
}
