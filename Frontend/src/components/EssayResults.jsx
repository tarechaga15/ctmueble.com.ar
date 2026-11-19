import DataGrid from "./DataGrid";
import { documentsService } from "../services/documentsService";
import { useToast } from "../context/ToastContext";

export default function EssayResults({ essay }) {
  const { success: showSuccessToast } = useToast();
  // Muestras con resultado cargado
  const analyzedSamples = essay?.samples?.filter((s) => s.result != null) || [];
  const sampleCodes = analyzedSamples.length
    ? analyzedSamples.map((s) => s.code).join(", ")
    : "N/A";

  // Fecha de recepción: primera muestra con receivedAt/receptionDate
  const firstReceivedAt =
    essay?.samples?.find(
      (s) => s.receivedAt || s.receptionDate || s.received_at
    );
  const receptionDate = firstReceivedAt
    ? new Date(
        firstReceivedAt.receivedAt ||
          firstReceivedAt.receptionDate ||
          firstReceivedAt.received_at
      ).toLocaleDateString("es-AR")
    : "N/A";

  // Dimensión de las muestras (width, large, height) — máximo 1 decimal
  const dim = essay?.dimensions;
  const parts = dim ? [dim.width, dim.large, dim.height].filter((v) => v != null && v !== "") : [];
  const dimensionsLabel = parts.length
    ? parts.map((v) => Number(v).toFixed(1)).join(" × ") + " mm"
    : "N/A";

  const resultsData = [
    { label: "Valor promedio", value: essay?.result != null ? `${essay.result} mg/m².h` : "N/A" },
    { label: "Incertidumbre", value: essay?.uncertainty ?? essay?.uncertainly ?? "N/A" },
    { label: "Muestras analizadas", value: sampleCodes },
    { label: "Dimensión de las muestras", value: dimensionsLabel },
    { label: "Fecha de recepción", value: receptionDate },
    {
      label: "Fecha de fin de ensayo",
      value: essay?.endDate
        ? new Date(essay.endDate).toLocaleDateString("es-AR")
        : "N/A",
    },
  ];

  const handleDownloadReport = () => {
    if (!essay?.id) return;
    documentsService.downloadByEssayAndType(essay.id, "F-PC15-01", () => showSuccessToast("Descarga iniciada."));
  };

  return (
    <div
      className="mb-[15px] p-[12px] rounded-[10px]"
      style={{
        backgroundColor: "var(--color-alt-content-bg-alt)",
        borderRadius: "10px",
        boxShadow: "var(--shadowGrayBottom2)",
        border: "1px solid var(--color-alt-content-border)",
        color: "var(--color-alt-content-text)",
      }}
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-[var(--color-alt-content-heading)]">
          Resultados de Ensayo
        </h3>
        <button
          onClick={handleDownloadReport}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-[white] font-medium transition-colors hover:opacity-90 whitespace-nowrap"
          style={{ backgroundColor: "var(--primary)", fontSize: "14px" }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-[20px] h-[20px]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
            style={{ marginRight: "5px" }}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          Descargar Informe
        </button>
      </div>

      <DataGrid data={resultsData} />
    </div>
  );
}

