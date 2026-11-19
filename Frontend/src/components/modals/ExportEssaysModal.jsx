import { useState, useEffect } from "react";
import Modal from "../Modal";
import { Button } from "react-daisyui";
import { essaysService } from "../../services/essaysService";
import StyledRadio from "../inputs/StyledRadio";

function FormatBadgeExcel() {
  return (
    <span
      className="box-border inline-flex h-[21px] w-[21px] min-h-[21px] min-w-[21px] shrink-0 items-center justify-center rounded-[3px] bg-[#217346]"
      aria-hidden
    >
      <svg width="11" height="11" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white">
        <path d="M2.4 2.4l7.2 7.2M9.6 2.4L2.4 9.6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      </svg>
    </span>
  );
}

function FormatBadgeCsv() {
  return (
    <span
      className="box-border inline-flex h-[21px] w-[21px] min-h-[21px] min-w-[21px] shrink-0 items-center justify-center overflow-hidden rounded-[3px] bg-[#e8bb2e] text-center text-[6px] font-extrabold leading-none tracking-tight text-[#3f3506]"
      aria-hidden
    >
      CSV
    </span>
  );
}

/**
 * @param {Object} props
 * @param {boolean} props.show
 * @param {() => void} props.onClose
 * @param {string} [props.initialCode]
 * @param {string|null} [props.initialStatus]
 * @param {Array<{ value: string|null, label: string }>} props.statusOptions
 */
export default function ExportEssaysModal({ show, onClose, initialCode = "", initialStatus = null, statusOptions = [] }) {
  const [code, setCode] = useState("");
  const [status, setStatus] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [format, setFormat] = useState(null);
  const [count, setCount] = useState(null);
  const [countLoading, setCountLoading] = useState(false);
  const [countError, setCountError] = useState(null);
  const [downloadError, setDownloadError] = useState(null);
  const [downloading, setDownloading] = useState(false);
  /** Incrementa al abrir el modal para remount del grupo de radios (evita estilos/transform acumulados). */
  const [formatGroupKey, setFormatGroupKey] = useState(0);

  useEffect(() => {
    if (!show) {
      setCode("");
      setStatus("");
      setDateFrom("");
      setDateTo("");
      setFormat(null);
      setCount(null);
      setCountLoading(false);
      setCountError(null);
      setDownloadError(null);
      return;
    }
    setCode(initialCode || "");
    setStatus(initialStatus != null ? initialStatus : "");
    setDateFrom("");
    setDateTo("");
    setFormat(null);
    setCount(null);
    setCountError(null);
    setDownloadError(null);
  }, [show, initialCode, initialStatus]);

  useEffect(() => {
    if (!show) return;
    setFormatGroupKey((k) => k + 1);
  }, [show, format]);

  const dateOrderInvalid = Boolean(dateFrom && dateTo && dateFrom > dateTo);

  useEffect(() => {
    if (!show) return;
    if (dateOrderInvalid) {
      setCount(null);
      setCountError("La fecha desde no puede ser posterior a la fecha hasta.");
      return;
    }
    setCountError(null);
    const filters = {
      code: code.trim() || undefined,
      status: status ? status : undefined,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
    };
    const handle = setTimeout(async () => {
      setCountLoading(true);
      try {
        const c = await essaysService.fetchExportCount(filters);
        setCount(c);
        setCountError(null);
      } catch (err) {
        setCount(null);
        setCountError(err?.response?.data?.error || err?.message || "No se pudo calcular la cantidad");
      } finally {
        setCountLoading(false);
      }
    }, 350);
    return () => clearTimeout(handle);
  }, [show, code, status, dateFrom, dateTo, dateOrderInvalid]);

  const safeOptions = Array.isArray(statusOptions) ? statusOptions : [];
  const statusLabel = !status
    ? safeOptions.find((o) => o?.value == null)?.label ?? "Todos"
    : safeOptions.find((o) => o?.value === status)?.label ?? status;

  const handleDownload = async () => {
    if (!format || dateOrderInvalid) return;
    setDownloadError(null);
    setDownloading(true);
    try {
      await essaysService.downloadExport(format, {
        code: code.trim() || undefined,
        status: status ? status : undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
      });
      requestClose();
    } catch (err) {
      setDownloadError(err?.response?.data?.error || err?.message || "Error al descargar");
    } finally {
      setDownloading(false);
    }
  };

  const inputClass =
    "w-full rounded-lg border border-[var(--color-alt-content-border)] bg-[var(--color-alt-content-bg-alt)] px-3 py-2 text-sm text-[var(--color-alt-content-text)]";

  const requestClose = () => {
    if (!downloading) onClose();
  };

  return (
    <Modal show={show} onClose={requestClose} title="Exportar solicitudes">
      <div className="space-y-4">
        <p className="text-sm text-gray-600 dark:text-gray-400 m-0">
          Exporta solicitudes de ensayos de manera rápida y sencilla. Elegí el periodo y el formato de archivo.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label className="block text-sm font-medium text-[var(--color-alt-content-text)]">
            Fecha solicitud desde
            <input type="date" className={`mt-1 ${inputClass}`} value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
          </label>
          <label className="block text-sm font-medium text-[var(--color-alt-content-text)]">
            Fecha solicitud hasta
            <input type="date" className={`mt-1 ${inputClass}`} value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
          </label>
        </div>

        <label className="block text-sm font-medium text-[var(--color-alt-content-text)]">
          Código de ensayo (opcional)
          <input
            type="text"
            className={`mt-1 ${inputClass}`}
            placeholder="Ej. 250301A"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
        </label>

        <label className="block text-sm font-medium text-[var(--color-alt-content-text)]">
          Estado
          <select className={`mt-1 ${inputClass}`} value={status} onChange={(e) => setStatus(e.target.value)}>
            {safeOptions.map((opt) => (
              <option key={opt.value ?? "all"} value={opt.value ?? ""}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>

        <span className="mt-[10px] mb-[10px] bg-[var(--color-alt-content-bg-alt)] flex flex-col gap-y-[10px] border-[var(--color-alt-content-border)] border-[1px] rounded-[8px] px-[10px] py-[10px] min-w-0">
          <label className="block text-sm font-medium text-[var(--color-alt-content-text)]">Formato de archivo</label>
          <div key={formatGroupKey} className="flex flex-row flex-wrap items-start gap-x-6 gap-y-2">
            <StyledRadio
              name="exportFormat"
              value="xlsx"
              checked={format === "xlsx"}
              onChange={() => setFormat("xlsx")}
              icon={<FormatBadgeExcel />}
            >
              Excel (.xlsx)
            </StyledRadio>
            <StyledRadio
              name="exportFormat"
              value="csv"
              checked={format === "csv"}
              onChange={() => setFormat("csv")}
              icon={<FormatBadgeCsv />}
            >
              CSV
            </StyledRadio>
          </div>
        </span>

        <div
          className="rounded-[8px] px-[10px] py-[10px] text-sm border border-[var(--color-alt-content-border)] bg-[var(--color-alt-content-bg)]"
          role="status"
        >
          {countLoading && <p className="m-0 text-gray-600 dark:text-gray-400">Calculando cantidad…</p>}
          {!countLoading && countError && <p className="m-0 text-red-600 dark:text-red-400">{countError}</p>}
          {!countLoading && !countError && count !== null && (
            <p className="m-[0px] text-[var(--color-alt-content-text)]">
              <strong>{count}</strong> {count === 1 ? "solicitud" : "solicitudes"} coinciden con estos filtros y se incluirán en el archivo.
            </p>
          )}
        </div>

        {downloadError && <p className="text-sm text-red-600 dark:text-red-400 m-0">{downloadError}</p>}

        <div className="flex flex-wrap justify-end gap-2 pt-2">
          <Button type="button" color="ghost" disabled={downloading} onClick={requestClose}>
            Cancelar
          </Button>
          <Button
            type="button"
            className="bg-[var(--primary)] border-[var(--primary)] text-white hover:bg-[var(--primary)]"
            disabled={downloading || countLoading || dateOrderInvalid || !format}
            onClick={handleDownload}
          >
            {downloading ? "Descargando…" : "Descargar"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
