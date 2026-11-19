import {
  Clock,
  CheckCircle2,
  XCircle,
  Package,
  FlaskConical,
  ShieldCheck,
  FileText,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Banner de estado para la vista de clientes en la solicitud de ensayo.
 * Muestra un mensaje claro con icono y estilizado según la etapa del flujo.
 *
 * @param {object} props
 * @param {string} props.status - Código de estado del ensayo (REQUESTED, ACCEPTED, etc.)
 * @param {string} [props.observations] - Observaciones (ej. motivo de rechazo o cancelación)
 * @param {(tabId: string) => void} [props.onNavigateTab] - Callback para navegar a una pestaña (contract, results, etc.)
 * @param {string} [props.className] - Clases adicionales de estilo
 */
export default function ClientEssayStatusBanner({
  status,
  observations,
  onNavigateTab,
  className,
}) {
  const getBannerConfig = () => {
    switch (status) {
      case "REQUESTED":
        return {
          title: "Esperando respuesta del laboratorio acerca de tu solicitud",
          description:
            "Tu solicitud de ensayo fue enviada exitosamente. El equipo del laboratorio está revisando la viabilidad técnica para aceptarla.",
          icon: Clock,
          containerClass:
            "border-amber-200/80 bg-amber-50/70 text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/20 dark:text-amber-200",
          iconWrapperClass:
            "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
          action: null,
        };

      case "ACCEPTED":
        return {
          title: "La solicitud fue aceptada",
          description:
            "El laboratorio aceptó tu solicitud. En este momento se están formalizando los términos del contrato de servicio.",
          icon: CheckCircle2,
          containerClass:
            "border-blue-200/80 bg-blue-50/70 text-blue-900 dark:border-blue-900/50 dark:bg-blue-950/20 dark:text-blue-200",
          iconWrapperClass:
            "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
          action: null,
        };

      case "REJECTED":
        return {
          title: "La solicitud fue rechazada",
          description: observations
            ? `El laboratorio no pudo aceptar esta solicitud. Motivo indicado: ${observations}`
            : "El laboratorio revisó la solicitud y no fue posible aceptarla.",
          icon: XCircle,
          containerClass:
            "border-red-200/80 bg-red-50/70 text-red-900 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-200",
          iconWrapperClass:
            "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
          action: null,
        };

      case "CANCELLED":
        return {
          title: "El ensayo fue cancelado",
          description: observations
            ? `El ensayo fue cancelado. Motivo: ${observations}`
            : "Este ensayo se encuentra cancelado.",
          icon: XCircle,
          containerClass:
            "border-red-200/80 bg-red-50/70 text-red-900 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-200",
          iconWrapperClass:
            "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
          action: null,
        };

      case "SERVICE_AGREEMENT_MADED":
        return {
          title: "Esperando recepción de muestras",
          description:
            "El acuerdo de servicio está definido. El laboratorio aguarda la llegada de las muestras y contramuestras físicas para dar inicio a los análisis.",
          icon: Package,
          containerClass:
            "border-purple-200/80 bg-purple-50/70 text-purple-900 dark:border-purple-900/50 dark:bg-purple-950/20 dark:text-purple-200",
          iconWrapperClass:
            "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
          action: onNavigateTab
            ? {
                label: "Ver contrato",
                onClick: () => onNavigateTab("contract"),
                icon: FileText,
              }
            : null,
        };

      case "IN_WORK":
        return {
          title: "El laboratorio está analizando las muestras",
          description:
            "Las muestras fueron recibidas de conformidad. El equipo técnico del laboratorio se encuentra ejecutando los ensayos correspondientes.",
          icon: FlaskConical,
          containerClass:
            "border-sky-200/80 bg-sky-50/70 text-sky-900 dark:border-sky-900/50 dark:bg-sky-950/20 dark:text-sky-200",
          iconWrapperClass:
            "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300",
          action: onNavigateTab
            ? {
                label: "Ver muestras",
                onClick: () => onNavigateTab("samples"),
                icon: FlaskConical,
              }
            : null,
        };

      case "COMPLETED":
        return {
          title: "Informe emitido",
          description:
            "El ensayo ha finalizado exitosamente. El informe formal técnico ya está emitido y listo para su consulta y descarga.",
          icon: ShieldCheck,
          containerClass:
            "border-emerald-200/80 bg-emerald-50/70 text-emerald-900 dark:border-emerald-900/50 dark:bg-emerald-950/20 dark:text-emerald-200",
          iconWrapperClass:
            "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
          action: onNavigateTab
            ? {
                label: "Ver resultados",
                onClick: () => onNavigateTab("results"),
                icon: ShieldCheck,
              }
            : null,
        };

      default:
        return null;
    }
  };

  const config = getBannerConfig();
  if (!config) return null;

  const IconComponent = config.icon;
  const ActionIcon = config.action?.icon || ArrowRight;

  return (
    <div
      className={cn(
        "rounded-xl border p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs transition-colors",
        config.containerClass,
        className
      )}
    >
      <div className="flex items-center gap-3 min-w-0">
        <div
          className={cn(
            "p-2 rounded-lg shrink-0 flex items-center justify-center",
            config.iconWrapperClass
          )}
        >
          <IconComponent className="size-5" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold leading-snug">{config.title}</p>
          <p className="text-xs opacity-90 leading-relaxed mt-0.5">
            {config.description}
          </p>
        </div>
      </div>

      {config.action && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={config.action.onClick}
          className="text-xs h-8 shrink-0 bg-background/85 hover:bg-background border-current/20 font-medium"
        >
          <ActionIcon className="size-3.5 mr-1.5" />
          {config.action.label}
        </Button>
      )}
    </div>
  );
}
