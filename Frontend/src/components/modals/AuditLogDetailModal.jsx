import { useState } from "react";
import Modal from "../Modal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import {
  Calendar,
  User,
  Laptop,
  Hash,
  ShieldCheck,
  FileText,
  Info,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

/**
 * Modal para visualizar el detalle de una acción en el historial.
 * Muestra información clara y comprensible para el usuario, reservando los datos
 * técnicos (IP, sesión, firmas, hashes) para el personal de laboratorio.
 */
export default function AuditLogDetailModal({
  show,
  onClose,
  log,
  isLaboratory = false,
}) {
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);

  if (!show || !log) return null;

  const formattedDate = log.timestamp
    ? new Date(log.timestamp).toLocaleString("es-AR", {
        dateStyle: "full",
        timeStyle: "medium",
      })
    : "Fecha no disponible";

  const hasMetadata =
    log.metadata &&
    typeof log.metadata === "object" &&
    Object.keys(log.metadata).length > 0;

  // Extraer valores comunes de metadata para mostrarlos en lenguaje amigable
  const friendlyMetadata = [];
  if (hasMetadata) {
    if (log.metadata.reason) {
      friendlyMetadata.push({ label: "Motivo informado", value: String(log.metadata.reason) });
    }
    if (log.metadata.modificated) {
      friendlyMetadata.push({ label: "Tipo de emisión", value: "Copia con modificación" });
    }
    if (log.metadata.profile) {
      const profileMap = {
        CLIENT: "Cliente",
        LABORATORY: "Laboratorio",
        ADMIN: "Administrador",
      };
      friendlyMetadata.push({
        label: "Perfil del solicitante",
        value: profileMap[log.metadata.profile] || log.metadata.profile,
      });
    }
  }

  return (
    <Modal
      show={show}
      onClose={onClose}
      title="Información de la Acción"
      footer={
        <div className="flex w-full items-center justify-end">
          <Button type="button" onClick={onClose}>
            Cerrar
          </Button>
        </div>
      }
    >
      <div className="w-full space-y-4 text-xs">
        {/* Encabezado del Evento */}
        <div className="flex items-start justify-between gap-3 p-3.5 rounded-lg border border-border/60 bg-muted/30">
          <div className="space-y-1">
            <h4 className="text-sm font-semibold text-foreground">
              {log.eventDescription || log.eventCode || "Acción registrada"}
            </h4>
            <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
              <Calendar className="size-3.5 shrink-0" />
              <span>{formattedDate}</span>
            </div>
          </div>
          {isLaboratory && (
            <Badge variant="outline" className="font-mono text-[11px] shrink-0">
              {log.eventCode || "EVENT"}
            </Badge>
          )}
        </div>

        {/* Participante y Origen */}
        <Card className="shadow-none">
          <CardHeader className="pb-2.5 border-b border-border/50">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <User className="size-3.5" />
              Responsable y Origen
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-2.5 space-y-1.5">
            <div className="flex items-center justify-between py-1 border-b border-border/30">
              <span className="text-muted-foreground">Realizado por:</span>
              <span className="font-semibold text-foreground">
                {log.userName || "Usuario no identificado"}
              </span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-border/30">
              <span className="text-muted-foreground">Dispositivo:</span>
              <span className="font-medium text-foreground">
                {log.clientName || "Dispositivo web registrado"}
              </span>
            </div>
            <div className="flex items-center justify-between py-1">
              <span className="text-muted-foreground">Estado del registro:</span>
              <span className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-medium">
                <CheckCircle2 className="size-3.5" />
                Registrado de forma inalterable
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Datos y Parámetros Amigables */}
        {friendlyMetadata.length > 0 && (
          <Card className="shadow-none">
            <CardHeader className="pb-2.5 border-b border-border/50">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <FileText className="size-3.5" />
                Detalles de la Operación
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-2.5 space-y-1.5">
              {friendlyMetadata.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between py-1 border-b border-border/30 last:border-0">
                  <span className="text-muted-foreground">{item.label}:</span>
                  <span className="font-medium text-foreground">{item.value}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Sección técnica reservada para Laboratorio */}
        {isLaboratory && (
          <div className="pt-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowTechnicalDetails((prev) => !prev)}
              className="text-xs text-muted-foreground hover:text-foreground p-0 h-auto font-normal flex items-center gap-1"
            >
              {showTechnicalDetails ? (
                <>
                  <ChevronUp className="size-3.5" />
                  Ocultar datos técnicos de laboratorio
                </>
              ) : (
                <>
                  <ChevronDown className="size-3.5" />
                  Ver datos técnicos de laboratorio (IP, sesión, hashes y firma)
                </>
              )}
            </Button>

            {showTechnicalDetails && (
              <div className="space-y-3 mt-2">
                {/* Red y Sesión */}
                <Card className="shadow-none bg-muted/20">
                  <CardHeader className="pb-2 border-b border-border/50">
                    <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <Laptop className="size-3.5" />
                      Red y Sesión
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-2 space-y-1.5 text-xs">
                    {log.ipAddress && (
                      <div className="flex items-center justify-between py-1 border-b border-border/30">
                        <span className="text-muted-foreground">Dirección IP:</span>
                        <span className="font-mono text-foreground font-medium">{log.ipAddress}</span>
                      </div>
                    )}
                    {log.sessionId && (
                      <div className="flex items-center justify-between py-1 border-b border-border/30">
                        <span className="text-muted-foreground">ID de Sesión:</span>
                        <span className="font-mono text-[11px] text-muted-foreground select-all">{log.sessionId}</span>
                      </div>
                    )}
                    {log.userId && (
                      <div className="flex items-center justify-between py-1 border-b border-border/30">
                        <span className="text-muted-foreground">ID de Usuario:</span>
                        <span className="font-mono text-[11px] text-muted-foreground select-all">{log.userId}</span>
                      </div>
                    )}
                    {log.userAgent && (
                      <div className="py-1">
                        <span className="text-muted-foreground block mb-0.5">User Agent:</span>
                        <p className="font-mono text-[10px] text-muted-foreground break-all bg-muted/50 p-2 rounded">
                          {log.userAgent}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Evidencia Criptográfica */}
                <Card className="shadow-none bg-muted/20">
                  <CardHeader className="pb-2 border-b border-border/50">
                    <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <ShieldCheck className="size-3.5 text-emerald-600" />
                      Evidencia Criptográfica del Registro
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-2 space-y-2 text-xs">
                    <div>
                      <span className="text-muted-foreground block mb-0.5">Hash SHA-256 del registro:</span>
                      <code className="block bg-muted/60 p-2 rounded text-[11px] font-mono break-all select-all">
                        {log.recordHash || "—"}
                      </code>
                    </div>
                    {log.signature && (
                      <div>
                        <span className="text-muted-foreground block mb-0.5">Firma RSA del sistema:</span>
                        <code className="block bg-muted/60 p-2 rounded text-[10px] font-mono break-all select-all text-muted-foreground max-h-16 overflow-y-auto">
                          {log.signature}
                        </code>
                      </div>
                    )}
                    {log.previousHash && (
                      <div>
                        <span className="text-muted-foreground block mb-0.5">Hash anterior encadenado:</span>
                        <code className="block bg-muted/60 p-1.5 rounded text-[10px] font-mono break-all select-all text-muted-foreground">
                          {log.previousHash}
                        </code>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Payload crudo de metadata */}
                {hasMetadata && (
                  <Card className="shadow-none bg-muted/20">
                    <CardHeader className="pb-2 border-b border-border/50">
                      <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                        <Hash className="size-3.5" />
                        Metadatos Completos (JSON)
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-2 text-xs">
                      <div className="bg-muted/60 p-2 rounded border border-border/40 font-mono text-[10px] max-h-40 overflow-y-auto">
                        <pre className="whitespace-pre-wrap break-all text-foreground">
                          {JSON.stringify(log.metadata, null, 2)}
                        </pre>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}
