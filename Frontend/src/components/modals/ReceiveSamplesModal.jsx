import { useState, useEffect } from "react";
import Modal from "../Modal";
import ErrorAlert from "../ErrorAlert";
import { samplesService } from "../../services/samplesService";
import { essaysService } from "../../services/essaysService";
import { useDataCache } from "../../context/DataCacheContext";
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
  FlaskConical,
  Layers,
  Ruler,
  ClipboardList,
  CheckCircle2,
  XCircle,
  Loader2,
  Package,
} from "lucide-react";

export default function ReceiveSamplesModal({
  show,
  onClose,
  onSuccess,
  initialEssayId,
}) {
  const { loadEssays, refreshEssays } = useDataCache();
  const { success: showSuccessToast, error: showErrorToast } = useToast();
  const [essays, setEssays] = useState([]);
  const [loadingEssays, setLoadingEssays] = useState(false);
  const [essayId, setEssayId] = useState(initialEssayId || "");
  const [accepted, setAccepted] = useState(true);
  const [samplesCount, setSamplesCount] = useState(3);
  const [countersamplesCount, setCountersamplesCount] = useState(3);
  const [height, setHeight] = useState("");
  const [width, setWidth] = useState("");
  const [thickness, setThickness] = useState("");
  const [internalConditioning, setInternalConditioning] = useState(false);
  const [observations, setObservations] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const isEssayLocked = Boolean(initialEssayId);
  const selectedEssay = essays.find((e) => e.id === essayId);

  useEffect(() => {
    if (!show) return;
    setError("");
    setEssayId(initialEssayId || "");
    setAccepted(true);
    setSamplesCount(3);
    setCountersamplesCount(3);
    setHeight("");
    setWidth("");
    setThickness("");
    setInternalConditioning(false);
    setObservations("");
    loadEssaysPendingReception();
  }, [show, initialEssayId]);

  async function loadEssaysPendingReception() {
    setLoadingEssays(true);
    try {
      const all = await loadEssays();
      const pending = all.filter((e) => e.status === "SERVICE_AGREEMENT_MADED");
      let list = pending;
      if (initialEssayId && !pending.some((e) => e.id === initialEssayId)) {
        try {
          const current = await essaysService.getById(initialEssayId);
          list = [current, ...pending];
        } catch (_) {
          // ignore
        }
      }
      setEssays(list);
      if (initialEssayId && list.some((e) => e.id === initialEssayId)) {
        setEssayId(initialEssayId);
      } else if (list.length > 0) {
        setEssayId(list[0].id);
      }
    } catch (err) {
      setError(
        err?.response?.data?.message || err?.message || "Error al cargar ensayos"
      );
    } finally {
      setLoadingEssays(false);
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!essayId) {
      setError("Seleccioná un ensayo");
      return;
    }
    if (accepted && samplesCount === 0 && countersamplesCount === 0) {
      setError("Debe indicar al menos una muestra o una contramuestra");
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        essayId,
        accepted,
        samples_count: accepted ? samplesCount : 0,
        countersamples_count: accepted ? countersamplesCount : 0,
        internal_conditioning: internalConditioning,
        observations: observations.trim() || null,
      };
      if (accepted) {
        if (
          !height ||
          !width ||
          !thickness ||
          isNaN(parseFloat(height)) ||
          isNaN(parseFloat(width)) ||
          isNaN(parseFloat(thickness))
        ) {
          setError(
            "Debe completar todas las medidas (alto/largo, ancho y espesor) en formato numérico válido."
          );
          setSubmitting(false);
          return;
        }
        payload.dimensions = {
          height: Math.round(parseFloat(height) * 10) / 10,
          width: Math.round(parseFloat(width) * 10) / 10,
          thickness: Math.round(parseFloat(thickness) * 10) / 10,
        };
      }
      await samplesService.receiveSamples(payload);
      await refreshEssays().catch(() => {});
      showSuccessToast(
        accepted
          ? "Muestras recepcionadas y orden de trabajo generada correctamente."
          : "Ensayo cancelado correctamente por no conformidad de muestras."
      );
      onSuccess?.();
      onClose();
    } catch (err) {
      const message =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        err?.message ||
        "Error al recepcionar muestras";
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
      title="Recepción de Muestras"
      onSubmit={!loadingEssays && essays.length > 0 ? handleSubmit : undefined}
      footer={
        !loadingEssays && essays.length > 0 ? (
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
              variant={accepted ? "default" : "destructive"}
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 className="size-4 animate-spin mr-1.5" />
                  Procesando...
                </>
              ) : accepted ? (
                <>
                  <CheckCircle2 className="size-4 mr-1.5" />
                  Recibir muestras
                </>
              ) : (
                <>
                  <XCircle className="size-4 mr-1.5" />
                  Rechazar y cancelar ensayo
                </>
              )}
            </Button>
          </>
        ) : !loadingEssays && essays.length === 0 ? (
          <Button variant="ghost" onClick={onClose}>
            Cerrar
          </Button>
        ) : null
      }
    >
      <div className="w-full space-y-4">
        {loadingEssays && (
          <div className="flex items-center gap-2 py-4">
            <Loader2 className="size-4 animate-spin text-primary" />
            <span className="text-sm text-muted-foreground">
              Cargando ensayos pendientes de recepción...
            </span>
          </div>
        )}

        {!loadingEssays && essays.length === 0 && (
          <div className="rounded-xl border border-dashed border-border p-6 text-center">
            <Package className="mx-auto size-8 text-muted-foreground/60 mb-2" />
            <p className="text-sm font-medium text-foreground">
              No hay ensayos pendientes de recepción
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Todos los ensayos con contrato ya tienen sus muestras recibidas o están en otra etapa.
            </p>
          </div>
        )}

        {error && <ErrorAlert message={error} className="text-sm" />}

        {!loadingEssays && essays.length > 0 && (
          <div className="space-y-4">
            {/* 1. Ensayo Asociado */}
            <Card className="shadow-none">
              <CardHeader className="flex flex-row items-center gap-3 border-b border-border/50 pb-3">
                <div className="rounded-lg bg-primary/10 p-2 text-primary shrink-0">
                  <FlaskConical className="size-4" />
                </div>
                <div>
                  <CardTitle className="text-sm font-semibold text-foreground">
                    Ensayo Vinculado
                  </CardTitle>
                  <CardDescription className="text-xs text-muted-foreground">
                    Solicitud a la que se incorporarán las muestras recibidas.
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="pt-3">
                {isEssayLocked ? (
                  <div className="rounded-lg border border-input bg-muted/40 px-3 py-2 text-sm flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-foreground">
                        #{selectedEssay?.code || essayId}
                      </span>
                      {selectedEssay?.type?.name && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {selectedEssay.type.name}
                        </p>
                      )}
                    </div>
                    <span className="font-mono text-[10px] text-muted-foreground/70 bg-muted px-2 py-0.5 rounded">
                      Fijo
                    </span>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <Label htmlFor="essaySelect" className="text-xs font-medium">
                      Seleccionar Solicitud
                    </Label>
                    <select
                      id="essaySelect"
                      className="h-9 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none focus-visible:border-ring"
                      value={essayId}
                      onChange={(e) => setEssayId(e.target.value)}
                      required
                    >
                      <option value="">Seleccione un ensayo...</option>
                      {essays.map((e) => (
                        <option key={e.id} value={e.id}>
                          #{e.code} — {e.type?.name || "Ensayo"} (
                          {e.client?.name || "Sin cliente"})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 2. Conformidad y Estado de Muestras */}
            <Card className="shadow-none">
              <CardHeader className="flex flex-row items-center gap-3 border-b border-border/50 pb-3">
                <div className="rounded-lg bg-primary/10 p-2 text-primary shrink-0">
                  <Layers className="size-4" />
                </div>
                <div>
                  <CardTitle className="text-sm font-semibold text-foreground">
                    Conformidad y Cantidades
                  </CardTitle>
                  <CardDescription className="text-xs text-muted-foreground">
                    Verificación de estado físico y conteo de probetas ingresadas.
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="pt-3 space-y-4">
                <div className="flex items-center justify-between rounded-lg border border-border p-3 bg-muted/20">
                  <div>
                    <p className="text-xs font-semibold text-foreground">
                      Conformidad de Muestras
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {accepted
                        ? "Las muestras cumplen con los requisitos para su ensayo."
                        : "Las muestras no cumplen las condiciones y el ensayo será cancelado."}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant={accepted ? "default" : "outline"}
                      className="h-7 text-xs"
                      onClick={() => setAccepted(true)}
                    >
                      <CheckCircle2 className="size-3 mr-1" />
                      Aceptadas
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant={!accepted ? "destructive" : "outline"}
                      className="h-7 text-xs"
                      onClick={() => setAccepted(false)}
                    >
                      <XCircle className="size-3 mr-1" />
                      Rechazadas
                    </Button>
                  </div>
                </div>

                {accepted && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="samplesCount" className="text-xs font-medium">
                        Cantidad de Muestras
                      </Label>
                      <Input
                        id="samplesCount"
                        type="number"
                        min="0"
                        step="1"
                        value={samplesCount}
                        onChange={(e) =>
                          setSamplesCount(
                            Math.max(0, parseInt(e.target.value, 10) || 0)
                          )
                        }
                        placeholder="ej. 3"
                        required
                        className="text-sm h-9"
                      />
                      <p className="text-[11px] text-muted-foreground">
                        Probetas a ensayar en el laboratorio.
                      </p>
                    </div>

                    <div className="space-y-1.5">
                      <Label
                        htmlFor="countersamplesCount"
                        className="text-xs font-medium"
                      >
                        Cantidad de Contramuestras
                      </Label>
                      <Input
                        id="countersamplesCount"
                        type="number"
                        min="0"
                        step="1"
                        value={countersamplesCount}
                        onChange={(e) =>
                          setCountersamplesCount(
                            Math.max(0, parseInt(e.target.value, 10) || 0)
                          )
                        }
                        placeholder="ej. 3"
                        required
                        className="text-sm h-9"
                      />
                      <p className="text-[11px] text-muted-foreground">
                        Probetas de reserva bajo custodia.
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 3. Dimensiones de las probetas (solo si aceptadas) */}
            {accepted && (
              <Card className="shadow-none">
                <CardHeader className="flex flex-row items-center gap-3 border-b border-border/50 pb-3">
                  <div className="rounded-lg bg-primary/10 p-2 text-primary shrink-0">
                    <Ruler className="size-4" />
                  </div>
                  <div>
                    <CardTitle className="text-sm font-semibold text-foreground">
                      Dimensiones de las Probetas (mm)
                    </CardTitle>
                    <CardDescription className="text-xs text-muted-foreground">
                      Medidas dimensionales verificadas en la recepción (con 1 decimal).
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="pt-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="heightInput" className="text-xs font-medium">
                        Largo (mm)
                      </Label>
                      <Input
                        id="heightInput"
                        type="number"
                        step="0.1"
                        min="0"
                        placeholder="ej. 250.0"
                        value={height}
                        onChange={(e) => setHeight(e.target.value)}
                        required
                        className="text-sm h-9"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="widthInput" className="text-xs font-medium">
                        Ancho (mm)
                      </Label>
                      <Input
                        id="widthInput"
                        type="number"
                        step="0.1"
                        min="0"
                        placeholder="ej. 50.0"
                        value={width}
                        onChange={(e) => setWidth(e.target.value)}
                        required
                        className="text-sm h-9"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="thicknessInput" className="text-xs font-medium">
                        Espesor (mm)
                      </Label>
                      <Input
                        id="thicknessInput"
                        type="number"
                        step="0.1"
                        min="0"
                        placeholder="ej. 15.0"
                        value={thickness}
                        onChange={(e) => setThickness(e.target.value)}
                        required
                        className="text-sm h-9"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 4. Acondicionamiento y Observaciones */}
            <Card className="shadow-none">
              <CardHeader className="flex flex-row items-center gap-3 border-b border-border/50 pb-3">
                <div className="rounded-lg bg-primary/10 p-2 text-primary shrink-0">
                  <ClipboardList className="size-4" />
                </div>
                <div>
                  <CardTitle className="text-sm font-semibold text-foreground">
                    Acondicionamiento y Observaciones
                  </CardTitle>
                  <CardDescription className="text-xs text-muted-foreground">
                    Tratamiento previo e indicaciones particulares de la muestra.
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="pt-3 space-y-3">
                {accepted && (
                  <label className="flex items-start gap-2.5 cursor-pointer rounded-lg border border-border p-2.5 hover:bg-muted/20 transition-colors">
                    <input
                      type="checkbox"
                      className="mt-0.5 size-4 rounded border-input text-primary focus:ring-ring"
                      checked={internalConditioning}
                      onChange={(e) => setInternalConditioning(e.target.checked)}
                    />
                    <div>
                      <span className="text-xs font-medium text-foreground">
                        Acondicionamiento interno previo
                      </span>
                      <p className="text-[11px] text-muted-foreground">
                        Marcar si las muestras requieren estabilización climática en cámara antes de ensayar.
                      </p>
                    </div>
                  </label>
                )}

                <div className="space-y-1.5">
                  <Label htmlFor="obsInput" className="text-xs font-medium">
                    Observaciones de Recepción
                  </Label>
                  <textarea
                    id="obsInput"
                    rows={2}
                    value={observations}
                    onChange={(e) => setObservations(e.target.value)}
                    placeholder="Detalles sobre el estado del paquete, rotulación, embalaje, etc..."
                    className="w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-ring resize-none"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </Modal>
  );
}
