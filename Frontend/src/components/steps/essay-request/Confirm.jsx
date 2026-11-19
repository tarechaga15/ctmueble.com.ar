import { ClipboardCheck, FlaskConical, Building2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useDataCache } from "../../../context/DataCacheContext";
import ErrorAlert from "../../ErrorAlert";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

export default function Confirm({ data, error }) {
  const [localData, setLocalData] = useState(data);
  const [essayTypeName, setEssayTypeName] = useState(
    data?.essay?.typeName ?? ""
  );
  const { loadEssayTypes } = useDataCache();

  useEffect(() => {
    let mounted = true;
    setLocalData(data);
    const updateName = async () => {
      if (data?.essay?.typeName) {
        setEssayTypeName(data.essay.typeName);
        return;
      }
      if (!data?.essay?.type) {
        setEssayTypeName("—");
        return;
      }
      try {
        const types = await loadEssayTypes();
        if (!mounted) return;
        const t = types.find((x) => String(x.id) === String(data.essay.type));
        setEssayTypeName(t?.name ?? "—");
      } catch {
        if (mounted) setEssayTypeName("—");
      }
    };
    updateName();
    return () => {
      mounted = false;
    };
  }, [data]);

  return (
    <div className="space-y-4">
      {error && <ErrorAlert message={error} className="mb-2" />}

      {/* 1. Ensayo y Muestra */}
      <Card className="shadow-none">
        <CardHeader className="flex flex-row items-center gap-3 border-b border-border/50 pb-3">
          <div className="rounded-lg bg-primary/10 p-2 text-primary shrink-0">
            <FlaskConical className="size-4" />
          </div>
          <div>
            <CardTitle className="text-sm font-semibold text-foreground">
              Datos del Ensayo y Muestra
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Revisá los parámetros del ensayo y datos de la muestra antes de confirmar.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="pt-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1 sm:col-span-2">
              <p className="text-xs text-muted-foreground">Tipo de Ensayo</p>
              <p className="text-sm font-semibold text-foreground">
                {essayTypeName || "—"}
              </p>
            </div>

            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Elemento / Material</p>
              <p className="text-sm font-medium text-foreground">
                {localData.essay?.templateLabel || "—"}
              </p>
            </div>

            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Fecha de Toma de Muestra</p>
              <p className="text-sm font-medium text-foreground">
                {localData.essay?.date
                  ? new Date(localData.essay.date).toLocaleDateString("es-AR")
                  : "—"}
              </p>
            </div>

            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Número de Lote</p>
              <p className="text-sm font-medium text-foreground font-mono">
                {localData.essay?.batch_number || "—"}
              </p>
            </div>

            <div className="space-y-1 sm:col-span-2">
              <p className="text-xs text-muted-foreground">Observaciones</p>
              <p className="text-sm text-foreground whitespace-pre-wrap">
                {localData.essay?.observations || "Sin observaciones adicionales"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 2. Empresa / Cliente */}
      <Card className="shadow-none">
        <CardHeader className="flex flex-row items-center gap-3 border-b border-border/50 pb-3">
          <div className="rounded-lg bg-primary/10 p-2 text-primary shrink-0">
            <Building2 className="size-4" />
          </div>
          <div>
            <CardTitle className="text-sm font-semibold text-foreground">
              Titular del Servicio
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Empresa y contacto a cuyo nombre se registrará la solicitud.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="pt-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Empresa (Cliente)</p>
              <p className="text-sm font-semibold text-foreground">
                {localData.client?.name || "A nombre personal"}
              </p>
            </div>
            {localData.client?.cuit && (
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">CUIT</p>
                <p className="text-sm font-mono text-foreground">
                  {localData.client.cuit}
                </p>
              </div>
            )}
            {localData.client?.contact?.name && (
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Solicitante</p>
                <p className="text-sm text-foreground">
                  {localData.client.contact.name}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
