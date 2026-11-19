import { useState, useEffect, useRef } from "react";
import Modal from "../Modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar, User, Tag, RotateCcw } from "lucide-react";

/**
 * Modal para filtros avanzados (fechas, clientes/solicitante, estado).
 * @param {Object} props
 * @param {boolean} props.show
 * @param {() => void} props.onClose
 * @param {({ dateFrom: string, dateTo: string, client: string, status: string|null }) => void} props.onApply
 * @param {() => void} props.onReset
 * @param {{ dateFrom?: string, dateTo?: string, client?: string, status?: string|null }} props.initialValues
 * @param {Array<{ value: string|null, label: string }>} props.statusOptions
 * @param {Array<string>} [props.clientSuggestions]
 * @param {string} [props.title]
 */
export default function FilterModal({
  show,
  onClose,
  onApply,
  onReset,
  initialValues = {},
  statusOptions = [],
  clientSuggestions = [],
  title = "Filtros",
}) {
  const [dateFrom, setDateFrom] = useState(initialValues.dateFrom || "");
  const [dateTo, setDateTo] = useState(initialValues.dateTo || "");
  const [client, setClient] = useState(initialValues.client || "");
  const [status, setStatus] = useState(initialValues.status ?? "");
  const [dateError, setDateError] = useState("");

  const prevShowRef = useRef(false);

  useEffect(() => {
    if (show && !prevShowRef.current) {
      setDateFrom(initialValues.dateFrom || "");
      setDateTo(initialValues.dateTo || "");
      setClient(initialValues.client || "");
      setStatus(initialValues.status ?? "");
      setDateError("");
    }
    prevShowRef.current = show;
  }, [show, initialValues]);

  const handleApply = (e) => {
    e?.preventDefault();
    if (dateFrom && dateTo && dateFrom > dateTo) {
      setDateError("La fecha desde no puede ser posterior a la fecha hasta");
      return;
    }
    setDateError("");
    onApply({
      dateFrom: dateFrom || "",
      dateTo: dateTo || "",
      client: client.trim(),
      status: status !== "" ? status : null,
    });
    onClose();
  };

  const handleReset = () => {
    setDateFrom("");
    setDateTo("");
    setClient("");
    setStatus("");
    setDateError("");
    if (onReset) {
      onReset();
    } else {
      onApply({
        dateFrom: "",
        dateTo: "",
        client: "",
        status: null,
      });
    }
    onClose();
  };

  return (
    <Modal
      show={show}
      onClose={onClose}
      title={title}
      onSubmit={handleApply}
      footer={
        <div className="flex w-full flex-col-reverse justify-between gap-2 sm:flex-row sm:items-center">
          <Button
            type="button"
            variant="ghost"
            onClick={handleReset}
            className="text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
            Limpiar filtros
          </Button>
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">
              Aplicar filtros
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-5 p-1">
        {/* Rango de fechas */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>Rango de fechas</span>
          </label>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <span className="mb-1 block text-xs text-muted-foreground">Desde</span>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => {
                  setDateFrom(e.target.value);
                  setDateError("");
                }}
                className="w-full"
              />
            </div>
            <div>
              <span className="mb-1 block text-xs text-muted-foreground">Hasta</span>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => {
                  setDateTo(e.target.value);
                  setDateError("");
                }}
                className="w-full"
              />
            </div>
          </div>
          {dateError && (
            <p className="text-xs font-medium text-destructive">{dateError}</p>
          )}
        </div>

        {/* Cliente / Solicitante */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <User className="h-4 w-4 text-muted-foreground" />
            <span>Cliente / Solicitante</span>
          </label>
          <Input
            type="text"
            list="filter-client-suggestions"
            placeholder="Filtrar por nombre o CUIT de cliente / solicitante..."
            value={client}
            onChange={(e) => setClient(e.target.value)}
            className="w-full"
          />
          {clientSuggestions && clientSuggestions.length > 0 && (
            <datalist id="filter-client-suggestions">
              {clientSuggestions.map((item, idx) => (
                <option key={`${item}-${idx}`} value={item} />
              ))}
            </datalist>
          )}
          <span className="block text-xs text-muted-foreground">
            Podés ingresar el nombre de la empresa, persona de contacto o representante.
          </span>
        </div>

        {/* Estado */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Tag className="h-4 w-4 text-muted-foreground" />
            <span>Estado</span>
          </label>
          <select
            className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="">Todos los estados</option>
            {statusOptions
              .filter((opt) => opt.value !== null)
              .map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
          </select>
        </div>
      </div>
    </Modal>
  );
}
