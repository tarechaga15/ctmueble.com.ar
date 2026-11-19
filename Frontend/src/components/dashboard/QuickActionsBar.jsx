import { useNavigate } from "react-router-dom";
import {
  Plus,
  PackagePlus,
  ClipboardList,
  FlaskConical,
  Users,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function QuickActionsBar({
  onNewRequest,
  onReceiveSamples,
  onExport,
}) {
  const navigate = useNavigate();

  return (
    <div className="rounded-2xl border border-border/80 bg-muted/25 p-4 shadow-xs">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
        <span>Acciones rápidas de laboratorio</span>
      </p>
      <div className="flex flex-wrap items-center gap-2.5">
        <Button
          type="button"
          size="sm"
          onClick={onNewRequest}
          className="gap-2 shadow-xs cursor-pointer font-medium"
        >
          <Plus className="h-4 w-4" />
          Nueva solicitud
        </Button>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onReceiveSamples}
          className="gap-2 bg-background hover:bg-muted shadow-xs cursor-pointer text-foreground font-medium border-border"
        >
          <PackagePlus className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          Recibir muestras / Emitir OT
        </Button>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => navigate("/samples")}
          className="gap-2 bg-background hover:bg-muted shadow-xs cursor-pointer text-foreground font-medium border-border"
        >
          <FlaskConical className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          Órdenes de trabajo
        </Button>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => navigate("/essays")}
          className="gap-2 bg-background hover:bg-muted shadow-xs cursor-pointer text-foreground font-medium border-border"
        >
          <ClipboardList className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          Listado de solicitudes
        </Button>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => navigate("/clients")}
          className="gap-2 bg-background hover:bg-muted shadow-xs cursor-pointer text-foreground font-medium border-border"
        >
          <Users className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          Clientes
        </Button>

        {onExport && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onExport}
            className="gap-2 bg-background hover:bg-muted shadow-xs cursor-pointer text-muted-foreground hover:text-foreground font-medium border-border ml-auto"
          >
            <Download className="h-4 w-4" />
            Exportar reporte
          </Button>
        )}
      </div>
    </div>
  );
}
