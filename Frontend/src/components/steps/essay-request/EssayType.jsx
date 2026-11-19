import { useState, useEffect } from "react";
import { essaysService } from "../../../services/essaysService";
import { useDataCache } from "../../../context/DataCacheContext";
import { useToast } from "../../../context/ToastContext";
import Card from "../../Card";
import Modal from "../../Modal";
import TemplateSelector from "../../TemplateSelector";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card as UiCard,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { FlaskConical, Package, ClipboardList } from "lucide-react";

function TemplateModal({ show, onClose, templates, selectedId, onSelect }) {
  const handleSelect = (tpl) => {
    onSelect(tpl);
    onClose();
  };

  return (
    <Modal show={show} onClose={onClose} title="Seleccionar plantilla de elemento">
      <div className="max-w-2xl w-full">
        {templates.length === 0 ? (
          <p className="text-sm text-gray-600">
            No tienes plantillas de elementos aún. Puedes crear una nueva plantilla.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[60vh] overflow-auto pr-1">
            {templates.map((t) => {
              const label = [t.product, t.manufacturer, t.country?.name ?? t.country]
                .filter(Boolean)
                .join(" · ");
              const isSelected = String(t.id) === String(selectedId);
              return (
                <Card key={t.id} onClick={() => handleSelect(t)}>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-[16px] font-bold m-0 truncate">
                        {label || t.id}
                      </h3>
                      {isSelected && (
                        <span className="badge badge-success badge-sm ml-2">
                          Seleccionada
                        </span>
                      )}
                    </div>
                    {t.product && (
                      <div className="w-[fit-content] flex items-center gap-2 p-[5px] rounded-[5px] hover:bg-[var(--color-content-bg-alt)]">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-[20px] text-[#235789]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <rect x="4" y="7" width="16" height="11" rx="2" stroke="currentColor" fill="none"/>
                          <path d="M9 7V6c0-1.1.9-2 2-2h2c1.1 0 2 .9 2 2v1" stroke="currentColor" fill="none"/>
                          <path d="M4 11h16" stroke="currentColor" fill="none"/>
                        </svg>
                        <span className="text-[13px] ml-[2px]">{t.product}</span>
                      </div>
                    )}
                    {t.manufacturer && (
                      <div className="w-[fit-content] flex items-center gap-2 p-[5px] rounded-[5px] hover:bg-[var(--color-content-bg-alt)]">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-[20px] text-[#27ae60]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          {/* Cuerpo principal de la fabrica */}
                          <rect x="3" y="11" width="15" height="7" rx="2" stroke="currentColor" fill="none"/>
                          {/* Chimenea */}
                          <rect x="16" y="8" width="3" height="10" rx="1" stroke="currentColor" fill="none"/>
                          {/* Techo escalonado/fachada industrial */}
                          <path d="M3 11 L7 8 L9 10 L13 8 L15 10 L18 8" stroke="currentColor" fill="none"/>
                          {/* Ventanas de la fabrica */}
                          <rect x="5" y="14" width="1.5" height="2" fill="currentColor" stroke="none"/>
                          <rect x="8" y="14" width="1.5" height="2" fill="currentColor" stroke="none"/>
                          <rect x="11" y="14" width="1.5" height="2" fill="currentColor" stroke="none"/>
                        </svg>
                        <span className="text-[13px] ml-[2px]">{t.manufacturer}</span>
                      </div>
                    )}
                    {t.country && (
                      <div className="w-[fit-content] flex items-center gap-2 p-[5px] rounded-[5px] hover:bg-[var(--color-content-bg-alt)]">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-[20px] text-[#d7263d]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" fill="none" />
                          <path d="M3 12h18" stroke="currentColor" strokeWidth="2" />
                          <path d="M12 3c2.5 3 2.5 15 0 18" stroke="currentColor" strokeWidth="2" />
                          <path d="M12 3c-2.5 3-2.5 15 0 18" stroke="currentColor" strokeWidth="2" />
                        </svg>
                        <span className="text-[13px] ml-[2px]">{t.country?.name ?? t.country}</span>
                      </div>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </Modal>
  );
}

function TemplateCreateForm({ onCancel, onCreated, countries }) {
  const [product, setProduct] = useState("");
  const [manufacturer, setManufacturer] = useState("");
  const [country, setCountry] = useState("AR");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const { success: showSuccessToast, error: showErrorToast } = useToast();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    if (!product.trim() || !manufacturer.trim()) {
      setError("Producto y fabricante son obligatorios.");
      return;
    }
    setSaving(true);
    essaysService
      .createElementTemplate({
        product: product.trim(),
        manufacturer: manufacturer.trim(),
        country: country || null,
      })
      .then((created) => {
        showSuccessToast("Plantilla creada correctamente.");
        onCreated(created);
      })
      .catch((err) => {
        const message = err?.message ?? "Error al crear la plantilla";
        setError(message);
        showErrorToast(message);
      })
      .finally(() => setSaving(false));
  };

  return (
    <div className="max-w-md w-full">
      <h3 className="text-lg font-bold mb-4">Nueva plantilla de elemento</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 font-bold text-sm">Producto</label>
          <input
            type="text"
            className="input input-bordered w-full"
            value={product}
            onChange={(e) => setProduct(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block mb-1 font-bold text-sm">Fabricante</label>
          <input
            type="text"
            className="input input-bordered w-full"
            value={manufacturer}
            onChange={(e) => setManufacturer(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block mb-1 font-bold text-sm">País</label>
          <select
            className="input input-bordered w-full"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
          >
            {countries.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        {error && <p className="text-error text-sm">{error}</p>}
        <div className="flex gap-2 justify-end">
          <button
            type="button"
            className="btn btn-ghost"
            onClick={onCancel}
            disabled={saving}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={saving}
          >
            {saving ? "Guardando…" : "Crear plantilla"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function EssayType({ data, onChange }) {
  const [localData, setLocalData] = useState(data);
  const {
    essayTypes,
    elementTemplates,
    countries,
    loadEssayTypes,
    loadElementTemplates,
    loadCountries,
    addTemplate,
  } = useDataCache();
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showCreateTemplateModal, setShowCreateTemplateModal] = useState(false);

  useEffect(() => {
    loadEssayTypes().catch(() => {});
    loadElementTemplates().catch(() => {});
    loadCountries().catch(() => {});
  }, [loadEssayTypes, loadElementTemplates, loadCountries]);

  // Si solo existe un tipo de ensayo, preseleccionarlo
  useEffect(() => {
    if (!essayTypes || essayTypes.length !== 1) return;
    const single = essayTypes[0];
    if (!single?.id) return;
    const currentType = data?.type ?? localData?.type;
    if (currentType !== "" && currentType != null) return;
    const nextEssay = { ...(data || localData || {}), type: single.id, typeName: single.name ?? "" };
    onChange({ key: "essay", data: nextEssay });
    setLocalData(nextEssay);
  }, [essayTypes]);

  useEffect(() => {
    setLocalData(data);
  }, [data]);

  const handleChanges = (e) => {
    const name = e.target.name;
    const value = e.target.value;
    const nextEssay = { ...localData, [name]: value };
    if (name === "type") {
      const selected = (essayTypes || []).find((t) => String(t.id) === String(value));
      nextEssay.typeName = selected?.name ?? "";
    }
    if (name === "template") {
      const selected = (elementTemplates || []).find((t) => String(t.id) === String(value));
      nextEssay.templateLabel = selected
        ? [selected.product, selected.manufacturer, selected.country?.name ?? selected.country].filter(Boolean).join(" · ")
        : "";
    }
    onChange({ key: "essay", data: nextEssay });
    setLocalData(nextEssay);
  };

  const handleTemplateCreated = (created) => {
    addTemplate(created);
    const label = [created.product, created.manufacturer, created.country?.name ?? created.country].filter(Boolean).join(" · ");
    const nextEssay = {
      ...localData,
      template: created.id,
      templateLabel: label,
    };
    onChange({ key: "essay", data: nextEssay });
    setLocalData(nextEssay);
  };

  const handleTemplateSelected = (template) => {
    if (!template) return;
    const label = [template.product, template.manufacturer, template.country?.name ?? template.country]
      .filter(Boolean)
      .join(" · ");
    const nextEssay = {
      ...localData,
      template: template.id,
      templateLabel: label,
    };
    onChange({ key: "essay", data: nextEssay });
    setLocalData(nextEssay);
  };

  const templateSelectorLabel =
    localData.template && localData.templateLabel
      ? localData.templateLabel
      : "Selecciona el elemento a ensayar";

  return (
    <>
      <div className="space-y-4">
        {/* 1. Tipo de Ensayo */}
        <UiCard className="shadow-none">
          <CardHeader className="flex flex-row items-center gap-3 border-b border-border/50 pb-3">
            <div className="rounded-lg bg-primary/10 p-2 text-primary shrink-0">
              <FlaskConical className="size-4" />
            </div>
            <div>
              <CardTitle className="text-sm font-semibold text-foreground">
                Tipo de Ensayo Requerido
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Seleccioná el protocolo o determinación analítica a realizar sobre la muestra.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="pt-3">
            <div className="space-y-1.5">
              <Label htmlFor="essayTypeSelect" className="text-xs font-medium">
                Método / Ensayo
              </Label>
              <select
                id="essayTypeSelect"
                className="h-9 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none focus-visible:border-ring"
                name="type"
                value={localData.type ?? ""}
                onChange={handleChanges}
                required
              >
                <option value="">Seleccione un ensayo...</option>
                {(essayTypes || []).map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>
            </div>
          </CardContent>
        </UiCard>

        {/* 2. Elemento y Muestra */}
        <UiCard className="shadow-none">
          <CardHeader className="flex flex-row items-center gap-3 border-b border-border/50 pb-3">
            <div className="rounded-lg bg-primary/10 p-2 text-primary shrink-0">
              <Package className="size-4" />
            </div>
            <div>
              <CardTitle className="text-sm font-semibold text-foreground">
                Elemento y Muestra a Ensayar
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Información del material analizado, fecha de muestreo y lote.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="pt-3 space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">
                Producto / Material
              </Label>
              <TemplateSelector
                onClickSelect={() => setShowTemplateModal(true)}
                onClickCreate={() => setShowCreateTemplateModal(true)}
                label={templateSelectorLabel}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="sampleDate" className="text-xs font-medium">
                  Fecha de toma de muestra
                </Label>
                <Input
                  id="sampleDate"
                  type="date"
                  name="date"
                  className="h-9 text-sm"
                  required
                  value={localData.date ?? ""}
                  onChange={handleChanges}
                />
                <p className="text-[11px] text-muted-foreground">
                  Fecha en la que fue extraída o tomada la muestra.
                </p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="batchNumber" className="text-xs font-medium">
                  Número de lote
                </Label>
                <Input
                  id="batchNumber"
                  type="text"
                  name="batch_number"
                  placeholder="ej. L-2026-04"
                  className="h-9 text-sm"
                  required
                  value={localData.batch_number ?? ""}
                  onChange={handleChanges}
                />
                <p className="text-[11px] text-muted-foreground">
                  Identificador del lote o partida de fabricación.
                </p>
              </div>
            </div>
          </CardContent>
        </UiCard>

        {/* 3. Observaciones */}
        <UiCard className="shadow-none">
          <CardHeader className="flex flex-row items-center gap-3 border-b border-border/50 pb-3">
            <div className="rounded-lg bg-primary/10 p-2 text-primary shrink-0">
              <ClipboardList className="size-4" />
            </div>
            <div>
              <CardTitle className="text-sm font-semibold text-foreground">
                Observaciones del Ensayo
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Indicaciones particulares o especificaciones para el equipo analista.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="pt-3">
            <div className="space-y-1.5">
              <Label htmlFor="essayObservations" className="text-xs font-medium">
                Observaciones
              </Label>
              <textarea
                id="essayObservations"
                rows={3}
                name="observations"
                placeholder="Ingresá detalles relevantes sobre la solicitud o requisitos de ensayo..."
                className="w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-ring resize-none"
                value={localData.observations ?? ""}
                onChange={handleChanges}
              />
            </div>
          </CardContent>
        </UiCard>
      </div>

      {showTemplateModal && (
        <TemplateModal
          show={showTemplateModal}
          onClose={() => setShowTemplateModal(false)}
          templates={elementTemplates || []}
          selectedId={localData.template}
          onSelect={handleTemplateSelected}
        />
      )}

      <Modal
        show={showCreateTemplateModal}
        onClose={() => setShowCreateTemplateModal(false)}
        title="Crear nueva plantilla de elemento"
      >
        <TemplateCreateForm
          countries={countries || []}
          onCancel={() => setShowCreateTemplateModal(false)}
          onCreated={(created) => {
            handleTemplateCreated(created);
            setShowCreateTemplateModal(false);
          }}
        />
      </Modal>
    </>
  );
}
