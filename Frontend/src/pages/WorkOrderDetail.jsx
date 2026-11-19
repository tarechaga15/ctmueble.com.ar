import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { samplesService } from "../services/samplesService";
import { essaysService } from "../services/essaysService";
import { documentsService } from "../services/documentsService";
import { useDataCache } from "../context/DataCacheContext";
import { useToast } from "../context/ToastContext";
import Back from "../components/buttons/Back";
import StyledTable from "../components/StyledTable";
import Modal from "../components/Modal";
import ErrorAlert from "../components/ErrorAlert";
import Tabs from "../components/Tabs";
import WorkOrderCard from "../components/WorkOrderCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  FlaskConical,
  Ruler,
  Layers,
  Save,
  AlertCircle,
  Loader2,
  Pencil,
  X,
  History,
  Thermometer,
  Calendar,
} from "lucide-react";
import { cn } from "@/lib/utils";

const SAMPLE_STATUS_MAP = {
  PENDING: { text: "No analizado", color: "#f1c40f", background: "#fffbe6" },
  RECEIVED: { text: "Recibida", color: "#2980ef", background: "#eaf3fb" },
  ANALYZING: { text: "En análisis", color: "#9b59b6", background: "#f4ecf7" },
  ANALYZED: { text: "Analizada", color: "#27ae60", background: "#e7f8ee" },
};

function formatDimensionParts(ancho, largo, espesor) {
  if (ancho == null && largo == null && espesor == null) return "—";
  const fmt = (x) => (x != null && x !== "" ? Number(x).toFixed(1) : "");
  const parts = [ancho, largo, espesor]
    .filter((x) => x != null && x !== "")
    .map((x) => fmt(x))
    .filter(Boolean);
  if (parts.length === 0) return "—";
  return `${parts.join(" × ")} mm`;
}

export default function WorkOrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { refreshEssays } = useDataCache();
  const { success: showSuccessToast, error: showErrorToast } = useToast();
  const [workOrder, setWorkOrder] = useState(null);
  const [samples, setSamples] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editResults, setEditResults] = useState({});
  const [isEditingValues, setIsEditingValues] = useState(false);
  const [savingResults, setSavingResults] = useState(false);
  const [emittingReport, setEmittingReport] = useState(false);
  const [showEmitReportModal, setShowEmitReportModal] = useState(false);
  const [activeTab, setActiveTab] = useState(0); // 0: muestras, 1: valores analizados, 2: historial

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const wo = await samplesService.getWorkOrder(id);
      setWorkOrder(wo);
      const smp = Array.isArray(wo?.samples) ? wo.samples : [];
      setSamples(smp);
      const initial = {};
      smp.forEach((s) => {
        initial[s.id] = s.result != null ? String(s.result) : "";
      });
      setEditResults(initial);
      setIsEditingValues(false);
    } catch (err) {
      console.error(err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const resultsWithValue = samples.filter((s) => {
    const val = editResults[s.id];
    return val != null && val !== "" && !isNaN(parseFloat(val));
  });
  const canEmitReport = resultsWithValue.length >= 2;
  const reportIssuedAt = workOrder?.essay_last_report_generated || workOrder?.essay_finish_date;
  const lastUpdate = workOrder?.last_update ?? workOrder?.lastUpdate;
  const modifiedAfterReport = Boolean(
    reportIssuedAt && lastUpdate && new Date(lastUpdate) > new Date(reportIssuedAt)
  );

  const tabs = [
    { label: "Muestras", id: "samples", icon: Layers },
    { label: "Valores analizados", id: "analyzedValues", icon: FlaskConical },
    { label: "Historial", id: "history", icon: History },
  ];

  const activeId = tabs[Math.min(activeTab, Math.max(tabs.length - 1, 0))]?.id;

  const handleDownloadWorkOrderReport = () => {
    if (!workOrder?.essay_id) return;
    documentsService.downloadByEssayAndType(workOrder.essay_id, "F-PC16-01", () =>
      showSuccessToast("Descarga iniciada.")
    );
  };

  const handleCancelEditValues = () => {
    const initial = {};
    samples.forEach((s) => {
      initial[s.id] = s.result != null ? String(s.result) : "";
    });
    setEditResults(initial);
    setIsEditingValues(false);
  };

  const handleConfirmResults = async () => {
    const changedSamples = samples
      .map((s) => {
        const orig = s.result;
        const raw = editResults[s.id];
        const current =
          raw != null && raw !== "" ? (isNaN(parseFloat(raw)) ? null : parseFloat(raw)) : null;
        if (current === orig) {
          return null;
        }
        return {
          id: s.id,
          result: current,
        };
      })
      .filter(Boolean);

    if (changedSamples.length === 0) {
      showSuccessToast("No hay cambios para guardar.");
      setIsEditingValues(false);
      return;
    }

    setSavingResults(true);
    try {
      await essaysService.loadSampleResult(id, changedSamples);

      // Actualizar muestras en memoria sin recargar toda la página
      const updatedSamples = samples.map((s) => {
        const updated = changedSamples.find((c) => c.id === s.id);
        if (!updated) return s;
        return {
          ...s,
          result: updated.result,
        };
      });
      setSamples(updatedSamples);

      // Recalcular promedio localmente para reflejar el valor actualizado
      const withResult = updatedSamples.filter(
        (s) => s.result != null && s.result !== "" && !isNaN(parseFloat(s.result))
      );
      if (withResult.length > 0) {
        const sum = withResult.reduce((acc, s) => acc + parseFloat(s.result), 0);
        const averageValue = parseFloat((sum / withResult.length).toFixed(4));
        setWorkOrder((prev) =>
          prev ? { ...prev, average_value: averageValue } : prev
        );
      }

      await refreshEssays();
      showSuccessToast("Valores analizados guardados correctamente.");
      setIsEditingValues(false);
    } catch (err) {
      const msg = err?.response?.data?.error || err?.message || "Error al guardar resultados";
      showErrorToast(msg);
    } finally {
      setSavingResults(false);
    }
  };

  const handleEmitReport = async () => {
    if (!workOrder?.essay_id) {
      showErrorToast("No se encontró el ensayo asociado a la orden de trabajo.");
      return;
    }
    setEmittingReport(true);
    try {
      const result = await essaysService.emitReport(workOrder.essay_id);
      const docId = result?.id ?? result?.documentId;
      if (result?.url) {
        window.open(result.url, "_blank");
      } else if (docId) {
        documentsService.download(docId, result?.filename || "informe.pdf", () =>
          showSuccessToast("Descarga iniciada.")
        );
      }
      await refreshEssays();
      fetchData();
      showSuccessToast("Informe emitido correctamente.");
    } catch (err) {
      const msg = err?.response?.data?.error || err?.message || "Error al emitir el informe";
      showErrorToast(msg);
    } finally {
      setEmittingReport(false);
      setShowEmitReportModal(false);
    }
  };

  const showEmitReportButton =
    canEmitReport &&
    !isEditingValues &&
    (workOrder?.status !== "COMPLETED" || modifiedAfterReport);

  const samplesInventoryColumns = [
    {
      header: "Código de Probeta",
      accessor: "code",
      render: (s) => (
        <span className="font-mono text-xs font-semibold text-foreground bg-muted/60 px-2 py-1 rounded inline-block">
          {s.code || "N/A"}
        </span>
      ),
    },
    {
      header: "Estado",
      accessor: "status",
      render: (s) => {
        const st = SAMPLE_STATUS_MAP[s?.status] || {
          text: s?.status || "N/A",
          color: "#e5e7eb",
          background: "rgba(148,163,184,0.25)",
        };
        return (
          <span
            className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
            style={{
              color: st.color,
              backgroundColor: st.background,
            }}
          >
            {st.text}
          </span>
        );
      },
    },
    {
      header: "Dimensiones Registradas",
      accessor: "dimensions",
      render: (s) => (
        <span className="text-xs text-muted-foreground font-mono">
          {formatDimensionParts(s.width, s.height, s.thickness)}
        </span>
      ),
    },
    {
      header: "Recepción",
      accessor: "reception",
      render: (s) => {
        const rawDate =
          s.received_at ||
          s.receivedAt ||
          s.receptionDate ||
          workOrder?.samples_received_at;
        return (
          <span className="text-xs text-foreground">
            {rawDate ? new Date(rawDate).toLocaleDateString("es-AR") : "—"}
          </span>
        );
      },
    },
  ];

  const analyzedValuesColumns = [
    {
      header: "Código de Probeta",
      accessor: "code",
      render: (s) => (
        <span className="font-mono text-xs font-semibold text-foreground bg-muted/60 px-2 py-1 rounded inline-block">
          {s.code || "N/A"}
        </span>
      ),
    },
    {
      header: "Estado",
      accessor: "status",
      render: (s) => {
        const st = SAMPLE_STATUS_MAP[s?.status] || {
          text: s?.status || "N/A",
          color: "#e5e7eb",
          background: "rgba(148,163,184,0.25)",
        };
        return (
          <span
            className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
            style={{
              color: st.color,
              backgroundColor: st.background,
            }}
          >
            {st.text}
          </span>
        );
      },
    },
    {
      header: "Dimensiones",
      accessor: "dimensions",
      render: (s) => (
        <span className="text-xs text-muted-foreground font-mono">
          {formatDimensionParts(s.width, s.height, s.thickness)}
        </span>
      ),
    },
    {
      header: "Resultado (mg/m²·h)",
      accessor: "result",
      render: (s) => (
        <div className="flex items-center gap-2">
          <Input
            type="number"
            step="0.01"
            disabled={!isEditingValues || savingResults}
            className={cn(
              "h-8 w-32 text-xs font-mono transition-colors",
              !isEditingValues && "bg-muted/50 text-foreground cursor-not-allowed border-dashed"
            )}
            placeholder="0.00"
            value={editResults[s.id] ?? ""}
            onChange={(e) =>
              setEditResults((prev) => ({ ...prev, [s.id]: e.target.value }))
            }
          />
          <span className="text-xs text-muted-foreground">mg/m²·h</span>
        </div>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[320px] gap-4">
        <span className="loading loading-spinner loading-lg text-primary"></span>
        <p className="text-muted-foreground">Cargando orden de trabajo...</p>
      </div>
    );
  }

  if (error || !workOrder) {
    const message =
      error?.response?.data?.message || error?.message || "No se pudo cargar la orden.";
    return (
      <div className="flex flex-col justify-center items-center min-h-[320px] gap-4 p-4">
        <div className="w-full max-w-md space-y-4">
          <ErrorAlert title="Error al cargar la orden" message={message} />
          <div className="flex gap-3 justify-center">
            <button className="btn btn-primary" onClick={fetchData}>
              Reintentar
            </button>
            <button className="btn btn-ghost" onClick={() => navigate("/samples")}>
              Volver
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex items-center gap-4 mb-6">
        <Back size="50px" navigateTo="/samples" />
      </div>

      <WorkOrderCard
        workOrder={workOrder}
        variant="detail"
        onDownload={handleDownloadWorkOrderReport}
        onEmit={() => setShowEmitReportModal(true)}
        showEmitReportButton={showEmitReportButton}
        emittingReport={emittingReport}
      />

      {/* Tabs Navigation */}
      <div className="mt-5 mb-4">
        <Tabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>

      {/* 1. SECCIÓN: MUESTRAS */}
      {activeId === "samples" && (
        <div className="space-y-6">
          {/* Dimensiones Nominales y Acondicionamiento */}
          <Card className="shadow-xs">
            <CardHeader className="flex flex-row items-center gap-3 border-b border-border/50 pb-3">
              <div className="rounded-lg bg-primary/10 p-2 text-primary shrink-0">
                <Ruler className="size-4" />
              </div>
              <div>
                <CardTitle className="text-sm font-semibold text-foreground">
                  Dimensiones de Probetas y Acondicionamiento
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Medidas registradas al ingreso de las muestras y condiciones previas al ensayo.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="pt-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Largo (mm)</p>
                  <p className="text-sm font-semibold text-foreground">
                    {workOrder.sample_height != null
                      ? `${Number(workOrder.sample_height).toFixed(1)} mm`
                      : "—"}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Ancho (mm)</p>
                  <p className="text-sm font-semibold text-foreground">
                    {workOrder.sample_width != null
                      ? `${Number(workOrder.sample_width).toFixed(1)} mm`
                      : "—"}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Espesor (mm)</p>
                  <p className="text-sm font-semibold text-foreground">
                    {workOrder.sample_thickness != null
                      ? `${Number(workOrder.sample_thickness).toFixed(1)} mm`
                      : "—"}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Acondicionamiento interno</p>
                  <p className="text-sm font-semibold text-foreground">
                    {workOrder.internal_aconditioning ? "Sí" : "No"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Listado de Muestras Recibidas */}
          <Card className="shadow-xs">
            <CardHeader className="flex flex-row items-center gap-3 border-b border-border/50 pb-3">
              <div className="rounded-lg bg-primary/10 p-2 text-primary shrink-0">
                <Layers className="size-4" />
              </div>
              <div>
                <CardTitle className="text-sm font-semibold text-foreground">
                  Probetas Recibidas ({samples.length})
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Listado de unidades recibidas, codificadas y listas para su análisis en laboratorio.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="pt-3">
              <StyledTable
                columns={samplesInventoryColumns}
                data={samples}
                emptyMessage="No hay muestras registradas en esta orden de trabajo."
              />
            </CardContent>
          </Card>
        </div>
      )}

      {/* 2. SECCIÓN: VALORES ANALIZADOS */}
      {activeId === "analyzedValues" && (
        <div className="space-y-6">
          {modifiedAfterReport && (
            <div className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/10 p-3.5">
              <span className="text-destructive font-semibold" aria-hidden>
                ⚠
              </span>
              <p className="text-sm text-foreground">
                Los datos de esta orden fueron modificados después de la emisión del informe. Podés
                emitir nuevamente el informe (se generará como modificación).
              </p>
            </div>
          )}

          {/* Parámetros Analíticos y Resultados Consolidados */}
          <Card className="shadow-xs">
            <CardHeader className="flex flex-row items-center gap-3 border-b border-border/50 pb-3">
              <div className="rounded-lg bg-primary/10 p-2 text-primary shrink-0">
                <FlaskConical className="size-4" />
              </div>
              <div>
                <CardTitle className="text-sm font-semibold text-foreground">
                  Parámetros Analíticos Consolidados
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Valores calculados consolidados a partir de las probetas analizadas.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="pt-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Valor Promedio</p>
                  <p className="text-sm font-semibold text-foreground">
                    {workOrder.average_value != null
                      ? `${Number(workOrder.average_value).toFixed(2)} mg/m²·h`
                      : "—"}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Incertidumbre</p>
                  <p className="text-sm font-semibold text-foreground">
                    {workOrder.uncertainty ?? "—"}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Observaciones</p>
                  <p className="text-sm font-medium text-foreground">
                    {workOrder.observations || "Sin observaciones"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabla de Carga / Edición de Mediciones */}
          <Card className="shadow-xs">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border/50 pb-3">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-primary/10 p-2 text-primary shrink-0">
                  <Layers className="size-4" />
                </div>
                <div>
                  <CardTitle className="text-sm font-semibold text-foreground">
                    Valores Analizados por Muestra
                  </CardTitle>
                  <CardDescription className="text-xs text-muted-foreground">
                    {isEditingValues
                      ? "Modo edición activado: cargá o actualizá los valores analíticos y guardá los cambios."
                      : "Valores analíticos registrados para cada probeta. Para modificarlos, activá la edición con el lápiz."}
                  </CardDescription>
                </div>
              </div>

              <div>
                {!isEditingValues ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditingValues(true)}
                    className="h-8 text-xs font-medium"
                  >
                    <Pencil className="size-3.5 mr-1.5" />
                    Editar valores
                  </Button>
                ) : (
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleCancelEditValues}
                      disabled={savingResults}
                      className="h-8 text-xs font-medium"
                    >
                      <X className="size-3.5 mr-1.5" />
                      Cancelar
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      onClick={handleConfirmResults}
                      disabled={savingResults}
                      className="h-8 text-xs font-medium"
                    >
                      {savingResults ? (
                        <>
                          <Loader2 className="size-3.5 animate-spin mr-1.5" />
                          Guardando...
                        </>
                      ) : (
                        <>
                          <Save className="size-3.5 mr-1.5" />
                          Guardar
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="pt-3 space-y-4">
              <StyledTable
                columns={analyzedValuesColumns}
                data={samples}
                emptyMessage="No hay muestras registradas en esta orden."
              />

              {!canEmitReport && samples.length > 0 && (
                <div className="flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-800 dark:text-amber-300">
                  <AlertCircle className="size-4 shrink-0 text-amber-600 dark:text-amber-400" />
                  <span>
                    Para emitir el informe se requieren al menos <strong>2 muestras</strong> con
                    resultado cargado.
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* 3. SECCIÓN: HISTORIAL */}
      {activeId === "history" && (
        <Card className="shadow-xs">
          <CardHeader className="flex flex-row items-center gap-3 border-b border-border/50 pb-3">
            <div className="rounded-lg bg-primary/10 p-2 text-primary shrink-0">
              <History className="size-4" />
            </div>
            <div>
              <CardTitle className="text-sm font-semibold text-foreground">
                Historial de la Orden de Trabajo
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Trazabilidad cronológica de eventos y modificaciones en esta orden.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="pt-3">
            <StyledTable
              columns={[
                {
                  header: "Evento",
                  accessor: "eventDescription",
                  render: (row) => row.eventDescription || row.eventCode || "—",
                },
                {
                  header: "Fecha",
                  accessor: "timestamp",
                  render: (row) =>
                    row.timestamp ? new Date(row.timestamp).toLocaleString("es-AR") : "—",
                },
                {
                  header: "Usuario",
                  accessor: "userName",
                  render: (row) => row.userName || "N/A",
                },
              ]}
              data={Array.isArray(workOrder?.audit_logs) ? workOrder.audit_logs : []}
              emptyMessage="No hay historial de acciones para esta orden."
            />
          </CardContent>
        </Card>
      )}

      {/* Modal para emitir informe */}
      <Modal
        show={showEmitReportModal}
        onClose={() => (!emittingReport ? setShowEmitReportModal(false) : null)}
      >
        <div className="w-full max-w-md">
          <h3 className="mb-4 font-heading text-base font-medium">
            {modifiedAfterReport
              ? "Emitir informe actualizado (modificación)"
              : "Emitir informe"}
          </h3>
          <p className="mb-4 text-sm text-muted-foreground">
            {modifiedAfterReport
              ? "Se generará un nuevo informe como modificación al ya emitido. ¿Desea continuar?"
              : "¿Desea emitir el informe de este ensayo? Esto finalizará la orden de trabajo y actualizará el estado del ensayo."}
          </p>
          <div className="flex gap-2 justify-end">
            <Button
              variant="ghost"
              onClick={() => setShowEmitReportModal(false)}
              disabled={emittingReport}
            >
              Cancelar
            </Button>
            <Button
              disabled={emittingReport}
              onClick={handleEmitReport}
            >
              {emittingReport ? (
                <>
                  <Loader2 className="size-3.5 animate-spin mr-1.5" />
                  Emitiendo...
                </>
              ) : (
                "Confirmar"
              )}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
