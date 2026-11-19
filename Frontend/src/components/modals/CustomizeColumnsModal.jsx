import { useState, useEffect, useRef } from "react";
import Modal from "../Modal";
import { Button } from "@/components/ui/button";
import { RotateCcw, Columns3, Check } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Modal para personalizar las columnas visibles en tablas.
 * @param {Object} props
 * @param {boolean} props.show
 * @param {() => void} props.onClose
 * @param {Array<{ id: string, label: string, description?: string, defaultVisible?: boolean }>} props.columns - Columnas configurables
 * @param {Record<string, boolean>} props.visibleColumns - Estado actual { [columnId]: boolean }
 * @param {(newVisible: Record<string, boolean>) => void} props.onSave - Callback al guardar
 * @param {() => void} props.onReset - Callback para volver a predeterminados
 * @param {string} [props.title]
 */
export default function CustomizeColumnsModal({
  show,
  onClose,
  columns = [],
  visibleColumns = {},
  onSave,
  onReset,
  title = "Personalizar columnas",
}) {
  const [selected, setSelected] = useState(visibleColumns || {});
  const prevShowRef = useRef(false);

  useEffect(() => {
    if (show && !prevShowRef.current) {
      setSelected({ ...visibleColumns });
    }
    prevShowRef.current = show;
  }, [show, visibleColumns]);

  const handleToggle = (id) => {
    setSelected((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleSave = (e) => {
    e?.preventDefault();
    onSave(selected);
    onClose();
  };

  const handleResetToDefault = () => {
    if (onReset) {
      onReset();
    } else {
      const defaults = {};
      columns.forEach((col) => {
        defaults[col.id] = col.defaultVisible !== false;
      });
      setSelected(defaults);
      onSave(defaults);
    }
    onClose();
  };

  return (
    <Modal
      show={show}
      onClose={onClose}
      title={title}
      onSubmit={handleSave}
      footer={
        <div className="flex w-full flex-col-reverse justify-between gap-2 sm:flex-row sm:items-center">
          <Button
            type="button"
            variant="ghost"
            onClick={handleResetToDefault}
            className="text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
            Restablecer por defecto
          </Button>
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">
              Guardar
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-5 p-1">
        <div className="flex items-start gap-2.5 rounded-lg bg-muted/60 p-3 text-xs text-muted-foreground border border-border/50">
          <Columns3 className="h-4 w-4 shrink-0 text-primary mt-0.5" />
          <span>
            Seleccioná las columnas opcionales que querés ver en la tabla. Las columnas básicas (código, estado y fecha) se muestran siempre para garantizar la correcta identificación.
          </span>
        </div>

        <div className="space-y-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Columnas opcionales
          </span>
          <div className="divide-y divide-border/60 rounded-xl border border-border/70 bg-card overflow-hidden">
            {columns.map((col) => {
              const isChecked = Boolean(selected[col.id]);
              return (
                <label
                  key={col.id}
                  onClick={() => handleToggle(col.id)}
                  className="flex cursor-pointer items-center justify-between gap-3 p-3.5 transition-colors hover:bg-muted/40 select-none"
                >
                  <div className="space-y-0.5">
                    <span className="text-sm font-medium text-foreground block">
                      {col.label}
                    </span>
                    {col.description && (
                      <span className="text-xs text-muted-foreground block">
                        {col.description}
                      </span>
                    )}
                  </div>

                  <div
                    className={cn(
                      "flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors",
                      isChecked
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-input bg-background"
                    )}
                  >
                    {isChecked && <Check className="h-3.5 w-3.5 stroke-[2.5]" />}
                  </div>
                </label>
              );
            })}
          </div>
        </div>
      </div>
    </Modal>
  );
}

