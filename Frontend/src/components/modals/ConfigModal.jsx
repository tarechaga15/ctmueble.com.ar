import { useEffect, useState } from "react";
import Modal from "../Modal";
import StyledTable from "../StyledTable";
import ErrorAlert from "../ErrorAlert";
import { envService } from "../../services/envService";

const KNOWN_VARS = {
  API_URL: {
    label: "URL de la API",
    description: "URL base del backend. Ej: https://api.midominio.com",
  },
};

export default function ConfigModal({ show, onClose }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!show) return;
    setError("");
    setLoading(true);
    envService
      .fetch()
      .then((data) => {
        const list = Array.isArray(data) ? data : [];
        const mapped = list.map((item) => {
          const known = KNOWN_VARS[item.id] || {};
          const currentValue =
            item.value == null
              ? ""
              : item.type === "TIMESTAMP"
              ? String(item.value)
              : String(item.value);
          return {
            id: item.id,
            label: known.label || item.label || item.id,
            description: known.description || "",
            type: item.type || "TEXT",
            value: currentValue,
            editValue: currentValue,
            hardcoded: !!item.hardcoded,
            isExisting: true,
          };
        });
        setRows(mapped);
      })
      .catch((err) => {
        const msg =
          err?.response?.data?.error ||
          err?.message ||
          "Error al obtener las variables de entorno.";
        setError(msg);
      })
      .finally(() => setLoading(false));
  }, [show]);

  const handleChangeId = (index, newId) => {
    setRows((prev) => {
      const next = [...prev];
      const row = { ...next[index], id: newId };
      next[index] = row;
      return next;
    });
  };

  const handleChangeLabel = (index, newLabel) => {
    setRows((prev) => {
      const next = [...prev];
      const row = { ...next[index], label: newLabel };
      next[index] = row;
      return next;
    });
  };

  const handleChangeType = (index, newType) => {
    setRows((prev) => {
      const next = [...prev];
      const row = { ...next[index], type: newType };
      next[index] = row;
      return next;
    });
  };

  const handleChangeValue = (index, newValue) => {
    setRows((prev) => {
      const next = [...prev];
      const row = { ...next[index], editValue: newValue };
      next[index] = row;
      return next;
    });
  };

  const handleAddRow = () => {
    setRows((prev) => [
      ...prev,
      {
        id: "",
        label: "",
        description: "",
        type: "TEXT",
        value: "",
        editValue: "",
        hardcoded: false,
        isExisting: false,
      },
    ]);
  };

  const handleRemoveNewRow = (index) => {
    setRows((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSaveRow = async (index) => {
    setError("");
    setSaving(true);

    try {
      const row = rows[index];
      if (!row) return;
      const id = (row.id || "").trim();
      if (!id) return;

      const valueRaw = row.editValue;
      let value = valueRaw;

      if (row.type === "NUMBER") {
        const n = parseInt(valueRaw, 10);
        if (!Number.isNaN(n)) value = n;
      } else if (row.type === "DECIMAL") {
        const f = parseFloat(valueRaw);
        if (!Number.isNaN(f)) value = f;
      }

      if (row.isExisting) {
        await envService.update({ id, value });
      } else {
        const label = (row.label || id).trim();
        await envService.add({
          id,
          label,
          type: row.type || "TEXT",
          value,
        });
      }

      setRows((prev) => {
        const next = [...prev];
        const updated = { ...next[index] };
        const normalizedValue =
          value == null
            ? ""
            : updated.type === "TIMESTAMP"
            ? String(value)
            : String(value);
        updated.value = normalizedValue;
        updated.editValue = normalizedValue;
        updated.isExisting = true;
        next[index] = updated;
        return next;
      });
    } catch (err) {
      const msg =
        err?.response?.data?.error ||
        err?.message ||
        "Error al guardar la variable de entorno.";
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal show={show} onClose={onClose} title="Configuración de entorno">
      <form className="space-y-4">
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Configurá las variables de entorno definidas en el servidor.
          Solo los usuarios del laboratorio pueden ver y modificar estos valores.
        </p>

        {loading && (
          <p className="text-sm text-gray-500">Cargando variables de entorno...</p>
        )}

        {error && <ErrorAlert message={error} className="text-sm" />}

        {!loading && (
          <StyledTable
            columns={[
              {
                header: "ID",
                className: "p-[8px] align-top",
                render: (row, index) => (
                  <input
                    type="text"
                    className="input input-sm input-bordered w-full"
                    value={row.id}
                    onChange={(e) => handleChangeId(index, e.target.value)}
                    placeholder="MI_VARIABLE"
                    disabled={row.isExisting}
                  />
                ),
              },
              {
                header: "Etiqueta",
                className: "p-[8px] align-top",
                render: (row, index) => (
                  <div>
                    <input
                      type="text"
                      className="input input-sm input-bordered w-full"
                      value={row.label}
                      onChange={(e) => handleChangeLabel(index, e.target.value)}
                      placeholder="Descripción legible"
                    />
                    {row.description && (
                      <p className="mt-1 text-[11px] text-gray-500">
                        {row.description}
                      </p>
                    )}
                  </div>
                ),
              },
              {
                header: "Tipo",
                className: "p-[8px] align-top",
                render: (row, index) => (
                  <select
                    className="select select-sm select-bordered w-full"
                    value={row.type}
                    onChange={(e) => handleChangeType(index, e.target.value)}
                    disabled={row.isExisting}
                  >
                    <option value="TEXT">Texto</option>
                    <option value="NUMBER">Número</option>
                    <option value="DECIMAL">Decimal</option>
                    <option value="TIMESTAMP">Fecha/Hora</option>
                  </select>
                ),
              },
              {
                header: "Acciones",
                className: "p-[8px] align-top",
                render: (row, index) => (
                  <div className="space-y-1">
                    <div className="text-[11px] text-gray-500">
                      Valor actual:{" "}
                      <span className="font-mono break-all">
                        {row.value || "—"}
                      </span>
                    </div>
                    <div className="flex gap-1">
                      <input
                        type="text"
                        className="input input-xs input-bordered flex-1"
                        value={row.editValue}
                        onChange={(e) => handleChangeValue(index, e.target.value)}
                        placeholder="Nuevo valor"
                      />
                      <button
                        type="button"
                        className="btn btn-primary btn-xs"
                        onClick={() => handleSaveRow(index)}
                        disabled={saving}
                      >
                        Guardar
                      </button>
                    </div>
                    {!row.isExisting && (
                      <button
                        type="button"
                        onClick={() => handleRemoveNewRow(index)}
                        className="btn btn-ghost btn-xs text-red-500"
                      >
                        Eliminar
                      </button>
                    )}
                  </div>
                ),
              },
            ]}
            data={rows}
            emptyMessage="No hay variables de entorno definidas."
          />
        )}

        <div className="flex justify-between items-center pt-2">
          <div className="space-x-2">
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={handleAddRow}
            >
              Añadir variable
            </button>
          </div>

          <div className="space-x-2">
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={onClose}
            >
              Cancelar
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
}

