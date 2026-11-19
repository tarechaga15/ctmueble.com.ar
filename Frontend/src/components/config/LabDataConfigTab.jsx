import { useState, useEffect, useMemo } from "react";
import {
  Building2,
  Mail,
  UserCheck,
  CreditCard,
  FlaskConical,
  Plus,
  Trash2,
  Save,
  RotateCcw,
  CheckCircle2,
  Loader2,
  Sliders,
  AlertCircle,
  HelpCircle,
} from "lucide-react";
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
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "../../context/ToastContext";
import { envService } from "../../services/envService";

// Definición y clasificación de los datos por defecto del laboratorio
const LAB_DATA_SECTIONS = [
  {
    id: "institucional",
    title: "Datos Institucionales y Sede",
    description:
      "Identificación legal y sede física de la entidad titular del laboratorio.",
    icon: Building2,
    fields: [
      {
        id: "SOCIAL_NAME",
        label: "Razón Social del Laboratorio",
        placeholder: "ej. Fundación para el Desarrollo de Cañada de Gómez (FU.DE.CA.)",
        description: "Figura en encabezados de contratos, solicitudes e informes de ensayo.",
        type: "TEXT",
        colSpan: "col-span-1 md:col-span-2",
      },
      {
        id: "CUIT",
        label: "CUIT del Laboratorio",
        placeholder: "ej. 30-67387889-6",
        description: "Identificación tributaria institucional para contratos y facturación.",
        type: "TEXT",
        colSpan: "col-span-1",
      },
      {
        id: "LOCAL_ADDRESS",
        label: "Domicilio legal / Sede",
        placeholder: "ej. Sarmiento 153",
        description: "Dirección física donde opera el laboratorio.",
        type: "TEXT",
        colSpan: "col-span-1",
      },
      {
        id: "LOCATION",
        label: "Localidad / Ciudad",
        placeholder: "ej. Cañada de Gómez",
        description: "Ciudad de radicación del laboratorio.",
        type: "TEXT",
        colSpan: "col-span-1",
      },
      {
        id: "PROVINCE",
        label: "Provincia",
        placeholder: "ej. Santa Fe",
        description: "Jurisdicción provincial.",
        type: "TEXT",
        colSpan: "col-span-1",
      },
    ],
  },
  {
    id: "contacto",
    title: "Contacto Oficial",
    description:
      "Vías oficiales de comunicación impresas en los pies de página y encabezados.",
    icon: Mail,
    fields: [
      {
        id: "LAB_PHONE",
        label: "Teléfono de Contacto",
        placeholder: "ej. +54 9 3471 41-7535",
        description: "Línea telefónica directa o WhatsApp del laboratorio.",
        type: "TEXT",
        inputType: "tel",
        colSpan: "col-span-1",
      },
      {
        id: "LAB_MAIL",
        label: "Correo Electrónico Oficial",
        placeholder: "ej. ctmlaboratorio@gmail.com",
        description: "Casilla institucional de atención y notificaciones.",
        type: "TEXT",
        inputType: "email",
        colSpan: "col-span-1",
      },
    ],
  },
  {
    id: "autoridades",
    title: "Autoridades y Firmantes Legales",
    description:
      "Responsables técnicos y autoridades institucionales que suscriben la documentación.",
    icon: UserCheck,
    fields: [
      {
        id: "LAB_DIRECTOR",
        label: "Director/a del Laboratorio",
        placeholder: "ej. Lic. Verónica Florencia Solís",
        description: "Responsable técnico/a que suscribe los informes y protocolos de ensayo.",
        type: "TEXT",
        colSpan: "col-span-1 md:col-span-3 lg:col-span-1",
      },
      {
        id: "PRESIDENT",
        label: "Presidente de la Institución",
        placeholder: "ej. Mario Lauría",
        description: "Representante legal institucional para contratos de servicios.",
        type: "TEXT",
        colSpan: "col-span-1 md:col-span-3 lg:col-span-1",
      },
      {
        id: "PRESIDENT_DNI",
        label: "DNI del Presidente",
        placeholder: "ej. 32.074.001",
        description: "Documento de identidad del titular representante legal.",
        type: "TEXT",
        colSpan: "col-span-1 md:col-span-3 lg:col-span-1",
      },
    ],
  },
  {
    id: "bancaria",
    title: "Información Bancaria",
    description:
      "Cuentas bancarias institucionales para acreditación de pagos y contratos de servicio.",
    icon: CreditCard,
    fields: [
      {
        id: "BANK",
        label: "Entidad Bancaria",
        placeholder: "ej. BANCO CREDICOOP filial 275",
        description: "Nombre del banco oficial de la entidad.",
        type: "TEXT",
        colSpan: "col-span-1 md:col-span-3 lg:col-span-1",
      },
      {
        id: "BANK_CC",
        label: "Cuenta Corriente en Pesos",
        placeholder: "ej. 2621/1",
        description: "Número de cuenta bancaria.",
        type: "TEXT",
        colSpan: "col-span-1 md:col-span-3 lg:col-span-1",
      },
      {
        id: "BANK_CBU",
        label: "CBU (Clave Bancaria Uniforme)",
        placeholder: "ej. 1910275555027500262114",
        description: "Clave de 22 dígitos para transferencias de clientes.",
        type: "TEXT",
        colSpan: "col-span-1 md:col-span-3 lg:col-span-1",
      },
    ],
  },
  {
    id: "tecnica",
    title: "Parámetros Técnicos y Ensayos",
    description:
      "Constantes y valores técnicos del laboratorio empleados en los cálculos analíticos.",
    icon: FlaskConical,
    fields: [
      {
        id: "UNCERTAINTY",
        label: "Incertidumbre de Medición",
        placeholder: "ej. 0.05",
        description:
          "Incertidumbre expandida aplicada por defecto en los cálculos e informes de ensayo.",
        type: "DECIMAL",
        inputType: "number",
        step: "any",
        colSpan: "col-span-1 md:col-span-2",
      },
    ],
  },
];

// IDs de variables que pertenecen al esquema por defecto y no pueden ser borradas
const DEFAULT_FIELD_IDS = new Set(
  LAB_DATA_SECTIONS.flatMap((sec) => sec.fields.map((f) => f.id)).concat([
    "UNCERTAINLY",
  ])
);

export default function LabDataConfigTab() {
  const { success: showSuccessToast, error: showErrorToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [savingSection, setSavingSection] = useState(null); // id de la sección que se está guardando
  const [savingGlobal, setSavingGlobal] = useState(false);
  const [savingCustomId, setSavingCustomId] = useState(null);
  const [deletingCustomId, setDeletingCustomId] = useState(null);

  // Mapa de valores guardados { [varId]: stringValue }
  const [serverValues, setServerValues] = useState({});
  // Mapa de valores en edición { [varId]: stringValue }
  const [formValues, setFormValues] = useState({});
  // Metadatos de variables existentes { [varId]: { label, type, hardcoded, isExisting } }
  const [varMeta, setVarMeta] = useState({});

  // Variables personalizadas: array de { id, label, type, value, editValue, isExisting, isNew }
  const [customVariables, setCustomVariables] = useState([]);

  // Variables adicionales hardcoded que no estén en la lista estática (si hubiera alguna)
  const [extraHardcodedVars, setExtraHardcodedVars] = useState([]);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await envService.fetch();
      const list = Array.isArray(data) ? data : [];

      const initialValues = {};
      const initialMeta = {};
      const customs = [];
      const extraHardcoded = [];

      list.forEach((item) => {
        const id = item.id;
        const val = item.value == null ? "" : String(item.value);
        initialMeta[id] = {
          label: item.label || id,
          type: item.type || "TEXT",
          hardcoded: Boolean(item.hardcoded),
          isExisting: true,
        };

        if (DEFAULT_FIELD_IDS.has(id)) {
          // Si es UNCERTAINLY y no tenemos UNCERTAINTY, usarlo
          if (id === "UNCERTAINLY") {
            if (!initialValues["UNCERTAINTY"]) {
              initialValues["UNCERTAINTY"] = val;
            }
          } else {
            initialValues[id] = val;
          }
        } else if (item.hardcoded) {
          extraHardcoded.push({
            id,
            label: item.label || id,
            type: item.type || "TEXT",
            value: val,
            editValue: val,
          });
          initialValues[id] = val;
        } else {
          customs.push({
            id,
            label: item.label || id,
            type: item.type || "TEXT",
            value: val,
            editValue: val,
            isExisting: true,
          });
        }
      });

      // Asegurar que todos los campos de secciones tengan valor inicial definido (aunque no estén aún en DB)
      LAB_DATA_SECTIONS.forEach((section) => {
        section.fields.forEach((field) => {
          if (initialValues[field.id] === undefined) {
            initialValues[field.id] = "";
          }
        });
      });

      setServerValues(initialValues);
      setFormValues(initialValues);
      setVarMeta(initialMeta);
      setCustomVariables(customs);
      setExtraHardcodedVars(extraHardcoded);
    } catch (err) {
      console.error("Error al cargar datos del laboratorio:", err);
      showErrorToast(
        err?.response?.data?.error ||
          err?.message ||
          "Error al obtener los datos del laboratorio."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleFieldChange = (id, val) => {
    setFormValues((prev) => ({
      ...prev,
      [id]: val,
    }));
  };

  // Determinar si un campo específico fue modificado
  const isFieldDirty = (id) => {
    return (formValues[id] ?? "") !== (serverValues[id] ?? "");
  };

  // Determinar si una sección tiene cambios pendientes
  const isSectionDirty = (section) => {
    return section.fields.some((field) => isFieldDirty(field.id));
  };

  // Conteo total de cambios pendientes en secciones por defecto
  const totalDirtyCount = useMemo(() => {
    let count = 0;
    LAB_DATA_SECTIONS.forEach((section) => {
      section.fields.forEach((field) => {
        if (isFieldDirty(field.id)) count += 1;
      });
    });
    extraHardcodedVars.forEach((field) => {
      if (isFieldDirty(field.id)) count += 1;
    });
    return count;
  }, [formValues, serverValues, extraHardcodedVars]);

  // Descartar cambios de una sección
  const handleResetSection = (section) => {
    setFormValues((prev) => {
      const next = { ...prev };
      section.fields.forEach((field) => {
        next[field.id] = serverValues[field.id] ?? "";
      });
      return next;
    });
  };

  // Descartar todos los cambios
  const handleResetAll = () => {
    setFormValues(serverValues);
  };

  // Guardar una sección específica
  const handleSaveSection = async (section) => {
    const dirtyFields = section.fields.filter((field) => isFieldDirty(field.id));
    if (dirtyFields.length === 0) return;

    setSavingSection(section.id);
    try {
      await Promise.all(
        dirtyFields.map(async (field) => {
          const rawVal = formValues[field.id] ?? "";
          let parsedVal = rawVal;
          if (field.type === "NUMBER") {
            const n = parseInt(rawVal, 10);
            if (!Number.isNaN(n)) parsedVal = n;
          } else if (field.type === "DECIMAL") {
            const f = parseFloat(rawVal);
            if (!Number.isNaN(f)) parsedVal = f;
          }

          const existingMeta = varMeta[field.id];
          if (existingMeta?.isExisting) {
            await envService.update({ id: field.id, value: parsedVal });
          } else {
            await envService.add({
              id: field.id,
              label: field.label,
              type: field.type,
              value: parsedVal,
            });
          }

          // Si guardamos UNCERTAINTY y existe UNCERTAINLY en varMeta, sincronizarlo
          if (field.id === "UNCERTAINTY" && varMeta["UNCERTAINLY"]?.isExisting) {
            try {
              await envService.update({ id: "UNCERTAINLY", value: parsedVal });
            } catch (ignore) {
              // ignore sync error
            }
          }
        })
      );

      // Actualizar valores de referencia del servidor
      setServerValues((prev) => {
        const next = { ...prev };
        dirtyFields.forEach((field) => {
          next[field.id] = formValues[field.id] ?? "";
        });
        return next;
      });

      // Actualizar metadatos si eran nuevos
      setVarMeta((prev) => {
        const next = { ...prev };
        dirtyFields.forEach((field) => {
          next[field.id] = {
            label: field.label,
            type: field.type,
            hardcoded: true,
            isExisting: true,
          };
        });
        return next;
      });

      showSuccessToast(`${section.title} actualizados correctamente.`);
    } catch (err) {
      console.error(`Error al guardar ${section.title}:`, err);
      showErrorToast(
        err?.response?.data?.error ||
          err?.message ||
          `Error al guardar los datos de ${section.title.toLowerCase()}.`
      );
    } finally {
      setSavingSection(null);
    }
  };

  // Guardar todos los cambios de todas las secciones
  const handleSaveAll = async () => {
    if (totalDirtyCount === 0) return;
    setSavingGlobal(true);
    try {
      const allDirtyFields = [];
      LAB_DATA_SECTIONS.forEach((section) => {
        section.fields.forEach((field) => {
          if (isFieldDirty(field.id)) {
            allDirtyFields.push(field);
          }
        });
      });
      extraHardcodedVars.forEach((field) => {
        if (isFieldDirty(field.id)) {
          allDirtyFields.push(field);
        }
      });

      await Promise.all(
        allDirtyFields.map(async (field) => {
          const rawVal = formValues[field.id] ?? "";
          let parsedVal = rawVal;
          if (field.type === "NUMBER") {
            const n = parseInt(rawVal, 10);
            if (!Number.isNaN(n)) parsedVal = n;
          } else if (field.type === "DECIMAL") {
            const f = parseFloat(rawVal);
            if (!Number.isNaN(f)) parsedVal = f;
          }

          const existingMeta = varMeta[field.id];
          if (existingMeta?.isExisting) {
            await envService.update({ id: field.id, value: parsedVal });
          } else {
            await envService.add({
              id: field.id,
              label: field.label,
              type: field.type || "TEXT",
              value: parsedVal,
            });
          }

          if (field.id === "UNCERTAINTY" && varMeta["UNCERTAINLY"]?.isExisting) {
            try {
              await envService.update({ id: "UNCERTAINLY", value: parsedVal });
            } catch (ignore) {
              // ignore
            }
          }
        })
      );

      setServerValues({ ...formValues });
      showSuccessToast("Todos los datos del laboratorio han sido guardados.");
    } catch (err) {
      console.error("Error al guardar todos los datos:", err);
      showErrorToast(
        err?.response?.data?.error ||
          err?.message ||
          "Error al guardar los datos del laboratorio."
      );
    } finally {
      setSavingGlobal(false);
    }
  };

  // ----------------------------------------------------
  // Gestión de variables personalizadas
  // ----------------------------------------------------

  const handleAddCustomRow = () => {
    setCustomVariables((prev) => [
      ...prev,
      {
        id: "",
        label: "",
        type: "TEXT",
        value: "",
        editValue: "",
        isExisting: false,
        isNew: true,
      },
    ]);
  };

  const handleCustomChange = (index, field, val) => {
    setCustomVariables((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: val };
      return next;
    });
  };

  const handleRemoveCustomRowLocal = (index) => {
    setCustomVariables((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSaveCustomRow = async (index) => {
    const row = customVariables[index];
    if (!row) return;

    const id = (row.id || "").trim();
    if (!id) {
      showErrorToast("El identificador (ID) de la variable es obligatorio.");
      return;
    }

    // Si es nueva, verificar que no colisione con variables default o existentes
    if (!row.isExisting) {
      if (DEFAULT_FIELD_IDS.has(id)) {
        showErrorToast(`El identificador '${id}' está reservado por el sistema.`);
        return;
      }
      const existingSameId = customVariables.some(
        (c, idx) => idx !== index && c.id.trim().toUpperCase() === id.toUpperCase()
      );
      if (existingSameId) {
        showErrorToast(`Ya existe una variable con el identificador '${id}'.`);
        return;
      }
    }

    const rawVal = row.editValue;
    let parsedVal = rawVal;
    if (row.type === "NUMBER") {
      const n = parseInt(rawVal, 10);
      if (!Number.isNaN(n)) parsedVal = n;
    } else if (row.type === "DECIMAL") {
      const f = parseFloat(rawVal);
      if (!Number.isNaN(f)) parsedVal = f;
    }

    setSavingCustomId(id || `temp-${index}`);
    try {
      if (row.isExisting) {
        await envService.update({ id, value: parsedVal });
      } else {
        const label = (row.label || id).trim();
        await envService.add({
          id,
          label,
          type: row.type || "TEXT",
          value: parsedVal,
        });
      }

      setCustomVariables((prev) => {
        const next = [...prev];
        next[index] = {
          ...next[index],
          id,
          value: parsedVal,
          editValue: parsedVal,
          isExisting: true,
          isNew: false,
        };
        return next;
      });

      showSuccessToast(
        row.isExisting
          ? `Variable ${id} actualizada con éxito.`
          : `Variable personalizada ${id} creada con éxito.`
      );
    } catch (err) {
      console.error(`Error al guardar variable ${id}:`, err);
      showErrorToast(
        err?.response?.data?.error ||
          err?.message ||
          "Error al guardar la variable personalizada."
      );
    } finally {
      setSavingCustomId(null);
    }
  };

  const handleDeleteCustomRow = async (index) => {
    const row = customVariables[index];
    if (!row) return;

    if (!row.isExisting) {
      handleRemoveCustomRowLocal(index);
      return;
    }

    const confirmed = window.confirm(
      `¿Estás seguro de que deseas eliminar la variable personalizada "${row.id}"? Esta acción no se puede deshacer.`
    );
    if (!confirmed) return;

    setDeletingCustomId(row.id);
    try {
      await envService.delete(row.id);
      setCustomVariables((prev) => prev.filter((_, i) => i !== index));
      showSuccessToast(`Variable ${row.id} eliminada correctamente.`);
    } catch (err) {
      console.error(`Error al eliminar variable ${row.id}:`, err);
      showErrorToast(
        err?.response?.data?.error ||
          err?.message ||
          "Error al eliminar la variable."
      );
    } finally {
      setDeletingCustomId(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="rounded-xl border border-border bg-card p-6 space-y-4">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-96" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-6 space-y-4">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-96" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Banner de cambios pendientes globales si los hay */}
      {totalDirtyCount > 0 && (
        <div className="sticky top-4 z-20 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-primary/30 bg-primary/10 px-4 py-3 shadow-md backdrop-blur-md">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <AlertCircle className="size-4 text-primary shrink-0" />
            <span>
              Tenés <strong>{totalDirtyCount}</strong>{" "}
              {totalDirtyCount === 1 ? "campo modificado" : "campos modificados"}{" "}
              sin guardar.
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleResetAll}
              disabled={savingGlobal || savingSection !== null}
            >
              <RotateCcw className="size-3.5 mr-1" />
              Descartar cambios
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleSaveAll}
              disabled={savingGlobal || savingSection !== null}
            >
              {savingGlobal ? (
                <>
                  <Loader2 className="size-3.5 animate-spin mr-1" />
                  Guardando todo...
                </>
              ) : (
                <>
                  <Save className="size-3.5 mr-1" />
                  Guardar todos los cambios
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Secciones de Datos por Defecto del Laboratorio */}
      {LAB_DATA_SECTIONS.map((section) => {
        const SectionIcon = section.icon;
        const isDirty = isSectionDirty(section);
        const isSaving = savingSection === section.id;

        return (
          <Card key={section.id} className="transition-all shadow-xs">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/50 pb-4">
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-primary/10 p-2 text-primary shrink-0 mt-0.5">
                  <SectionIcon className="size-5" />
                </div>
                <div>
                  <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
                    {section.title}
                    {isDirty && (
                      <span className="inline-flex items-center rounded-full bg-amber-500/10 px-2 py-0.5 text-[11px] font-medium text-amber-600 dark:text-amber-400 border border-amber-500/20">
                        Modificado
                      </span>
                    )}
                  </CardTitle>
                  <CardDescription className="text-xs text-muted-foreground mt-0.5">
                    {section.description}
                  </CardDescription>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                {isDirty && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 text-xs text-muted-foreground hover:text-foreground"
                    onClick={() => handleResetSection(section)}
                    disabled={isSaving || savingGlobal}
                  >
                    <RotateCcw className="size-3 mr-1" />
                    Deshacer
                  </Button>
                )}
                <Button
                  type="button"
                  size="sm"
                  variant={isDirty ? "default" : "outline"}
                  className="h-8 text-xs font-medium"
                  disabled={!isDirty || isSaving || savingGlobal}
                  onClick={() => handleSaveSection(section)}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="size-3.5 animate-spin mr-1" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save className="size-3.5 mr-1" />
                      Guardar sección
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>

            <CardContent className="pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {section.fields.map((field) => {
                  const currentValue = formValues[field.id] ?? "";
                  const dirty = isFieldDirty(field.id);

                  return (
                    <div
                      key={field.id}
                      className={`space-y-1.5 ${field.colSpan || "col-span-1"}`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <Label
                          htmlFor={`field-${field.id}`}
                          className="text-xs font-medium text-foreground flex items-center gap-1.5"
                        >
                          {field.label}
                          {dirty && (
                            <span className="size-1.5 rounded-full bg-amber-500 inline-block" />
                          )}
                        </Label>
                        <span className="font-mono text-[10px] text-muted-foreground/70 bg-muted/60 px-1.5 py-0.5 rounded select-all">
                          {field.id}
                        </span>
                      </div>

                      <Input
                        id={`field-${field.id}`}
                        type={field.inputType || "text"}
                        step={field.step}
                        placeholder={field.placeholder}
                        value={currentValue}
                        onChange={(e) =>
                          handleFieldChange(field.id, e.target.value)
                        }
                        className={`text-sm ${
                          dirty
                            ? "border-amber-500/50 bg-amber-500/[0.02] focus-visible:border-amber-500 focus-visible:ring-amber-500/20"
                            : ""
                        }`}
                      />

                      {field.description && (
                        <p className="text-[11px] text-muted-foreground leading-tight">
                          {field.description}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        );
      })}

      {/* Otras variables de sistema hardcoded no clasificadas (si existieran) */}
      {extraHardcodedVars.length > 0 && (
        <Card className="transition-all shadow-xs">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/50 pb-4">
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-primary/10 p-2 text-primary shrink-0 mt-0.5">
                <Sliders className="size-5" />
              </div>
              <div>
                <CardTitle className="text-base font-semibold text-foreground">
                  Otros Datos del Sistema
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground mt-0.5">
                  Variables fijas del sistema adicionales configuradas por defecto.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {extraHardcodedVars.map((field) => {
                const currentValue = formValues[field.id] ?? "";
                const dirty = isFieldDirty(field.id);
                return (
                  <div key={field.id} className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <Label
                        htmlFor={`field-${field.id}`}
                        className="text-xs font-medium text-foreground flex items-center gap-1.5"
                      >
                        {field.label}
                        {dirty && (
                          <span className="size-1.5 rounded-full bg-amber-500 inline-block" />
                        )}
                      </Label>
                      <span className="font-mono text-[10px] text-muted-foreground/70 bg-muted/60 px-1.5 py-0.5 rounded select-all">
                        {field.id}
                      </span>
                    </div>
                    <Input
                      id={`field-${field.id}`}
                      value={currentValue}
                      onChange={(e) =>
                        handleFieldChange(field.id, e.target.value)
                      }
                      className="text-sm"
                    />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabla de Variables Personalizadas */}
      <Card className="transition-all shadow-xs">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/50 pb-4">
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-primary/10 p-2 text-primary shrink-0 mt-0.5">
              <Sliders className="size-5" />
            </div>
            <div>
              <CardTitle className="text-base font-semibold text-foreground">
                Variables Personalizadas
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground mt-0.5">
                Variables dinámicas creadas libremente para ampliar plantillas,
                integraciones o necesidades específicas del laboratorio.
              </CardDescription>
            </div>
          </div>

          <Button
            type="button"
            size="sm"
            onClick={handleAddCustomRow}
            className="h-8 text-xs font-medium self-start sm:self-center"
          >
            <Plus className="size-3.5 mr-1" />
            Nueva variable
          </Button>
        </CardHeader>

        <CardContent className="pt-4">
          {customVariables.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-10 text-center">
              <div className="rounded-full bg-muted p-3 text-muted-foreground mb-3">
                <Sliders className="size-6" />
              </div>
              <h4 className="text-sm font-medium text-foreground">
                No hay variables personalizadas definidas
              </h4>
              <p className="text-xs text-muted-foreground max-w-sm mt-1 mb-4">
                Podés crear identificadores personalizados para utilizarlos como
                parámetros dinámicos en las plantillas y procesos del laboratorio.
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddCustomRow}
                className="text-xs"
              >
                <Plus className="size-3.5 mr-1" />
                Crear primera variable
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted/50 text-[11px] font-medium uppercase tracking-wider text-muted-foreground border-b border-border">
                  <tr>
                    <th className="px-4 py-2.5 w-1/4">Identificador (ID)</th>
                    <th className="px-4 py-2.5 w-1/4">Etiqueta / Nombre</th>
                    <th className="px-4 py-2.5 w-36">Tipo</th>
                    <th className="px-4 py-2.5">Valor</th>
                    <th className="px-4 py-2.5 text-right w-28">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60 bg-card">
                  {customVariables.map((row, index) => {
                    const rowSaving =
                      savingCustomId === (row.id || `temp-${index}`);
                    const rowDeleting = deletingCustomId === row.id;
                    const isRowDirty =
                      row.isNew || String(row.editValue) !== String(row.value);

                    return (
                      <tr
                        key={row.id || `new-${index}`}
                        className="hover:bg-muted/30 transition-colors"
                      >
                        {/* ID */}
                        <td className="px-4 py-2.5 align-middle">
                          {row.isExisting ? (
                            <span className="font-mono text-xs font-semibold text-foreground bg-muted/60 px-2 py-1 rounded inline-block">
                              {row.id}
                            </span>
                          ) : (
                            <Input
                              type="text"
                              placeholder="MI_VARIABLE"
                              value={row.id}
                              onChange={(e) =>
                                handleCustomChange(
                                  index,
                                  "id",
                                  e.target.value.toUpperCase().replace(/\s+/g, "_")
                                )
                              }
                              className="font-mono text-xs uppercase h-8"
                              autoFocus
                            />
                          )}
                        </td>

                        {/* Etiqueta */}
                        <td className="px-4 py-2.5 align-middle">
                          <Input
                            type="text"
                            placeholder="Descripción legible"
                            value={row.label}
                            onChange={(e) =>
                              handleCustomChange(index, "label", e.target.value)
                            }
                            className="text-xs h-8"
                          />
                        </td>

                        {/* Tipo */}
                        <td className="px-4 py-2.5 align-middle">
                          <select
                            value={row.type}
                            onChange={(e) =>
                              handleCustomChange(index, "type", e.target.value)
                            }
                            disabled={row.isExisting}
                            className="h-8 w-full rounded-lg border border-input bg-transparent px-2 text-xs transition-colors outline-none focus-visible:border-ring disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <option value="TEXT">TEXT (Texto)</option>
                            <option value="NUMBER">NUMBER (Entero)</option>
                            <option value="DECIMAL">DECIMAL (Decimal)</option>
                            <option value="TIMESTAMP">TIMESTAMP (Fecha)</option>
                          </select>
                        </td>

                        {/* Valor */}
                        <td className="px-4 py-2.5 align-middle">
                          <div className="space-y-0.5">
                            <Input
                              type={
                                row.type === "NUMBER"
                                  ? "number"
                                  : row.type === "DECIMAL"
                                    ? "number"
                                    : "text"
                              }
                              step={row.type === "DECIMAL" ? "any" : undefined}
                              placeholder="Valor de la variable"
                              value={row.editValue}
                              onChange={(e) =>
                                handleCustomChange(
                                  index,
                                  "editValue",
                                  e.target.value
                                )
                              }
                              className={`text-xs h-8 ${
                                isRowDirty
                                  ? "border-amber-500/50 bg-amber-500/[0.02]"
                                  : ""
                              }`}
                            />
                            {row.isExisting && row.value !== row.editValue && (
                              <p className="text-[10px] text-muted-foreground truncate">
                                Actual:{" "}
                                <span className="font-mono">
                                  {row.value || "—"}
                                </span>
                              </p>
                            )}
                          </div>
                        </td>

                        {/* Acciones */}
                        <td className="px-4 py-2.5 align-middle text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              type="button"
                              size="sm"
                              variant={isRowDirty ? "default" : "outline"}
                              className="h-8 px-2 text-xs"
                              disabled={rowSaving || rowDeleting || (!isRowDirty && row.isExisting)}
                              onClick={() => handleSaveCustomRow(index)}
                              title="Guardar variable"
                            >
                              {rowSaving ? (
                                <Loader2 className="size-3.5 animate-spin" />
                              ) : (
                                <Save className="size-3.5" />
                              )}
                            </Button>

                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              className="h-8 px-2 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                              disabled={rowSaving || rowDeleting}
                              onClick={() => handleDeleteCustomRow(index)}
                              title={
                                row.isExisting
                                  ? "Eliminar variable"
                                  : "Descartar fila"
                              }
                            >
                              {rowDeleting ? (
                                <Loader2 className="size-3.5 animate-spin" />
                              ) : (
                                <Trash2 className="size-3.5" />
                              )}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
