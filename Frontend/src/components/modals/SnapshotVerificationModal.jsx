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
  ShieldCheck,
  ShieldAlert,
  Calendar,
  Hash,
  CheckCircle2,
  XCircle,
  Download,
  Loader2,
  Clock,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

/**
 * Modal para consultar la autenticidad, integridad y fecha cierta del documento.
 * Muestra un lenguaje claro para clientes y reserva detalles criptográficos/técnicos para el laboratorio.
 */
export default function SnapshotVerificationModal({
  show,
  onClose,
  verificationData,
  loading,
  onDownloadOts,
  isLaboratory = false,
}) {
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);

  if (!show) return null;

  const isValid = Boolean(
    verificationData?.isValid ??
    (verificationData?.tampered === false && verificationData?.integrityValid === true) ??
    verificationData?.cryptography?.integrityCheck?.valid
  );
  const integrityValid = Boolean(
    verificationData?.integrityValid ??
    (verificationData?.tampered === false) ??
    verificationData?.cryptography?.integrityCheck?.valid
  );
  const signatureValid = Boolean(
    verificationData?.signatureValid ??
    verificationData?.cryptography?.integrityCheck?.valid
  );
  const isStamped = Boolean(
    verificationData?.otsStatus === "STAMPED" ||
    verificationData?.openTimestamps?.hasProof === true ||
    verificationData?.otsVerified === true
  );
  const canonicalHash =
    verificationData?.canonicalHash ||
    verificationData?.cryptography?.canonicalHash ||
    verificationData?.cryptography?.integrityCheck?.canonicalHash;
  const signatureAlgorithm =
    verificationData?.signatureAlgorithm ||
    verificationData?.cryptography?.signatureAlgorithm ||
    "RSA-SHA256";
  const otsStampedAt =
    verificationData?.otsStampedAt ||
    verificationData?.openTimestamps?.stampedAt;
  const otsCalendar =
    verificationData?.otsCalendar ||
    verificationData?.openTimestamps?.calendarUrl;
  const snapshotId = verificationData?.snapshotId || verificationData?.id;
  const version = verificationData?.version || 1;

  const formattedStampedDate = otsStampedAt
    ? new Date(otsStampedAt).toLocaleString("es-AR", {
        dateStyle: "full",
        timeStyle: "short",
      })
    : null;

  return (
    <Modal
      show={show}
      onClose={onClose}
      title="Autenticidad y Validez del Documento"
      footer={
        <div className="flex w-full items-center justify-between">
          <div>
            {isLaboratory && snapshotId && isStamped && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onDownloadOts(snapshotId, `comprobante_v${version}.ots`)}
              >
                <Download className="size-4 mr-1.5" />
                Descargar comprobante (.ots)
              </Button>
            )}
          </div>
          <Button type="button" onClick={onClose}>
            Cerrar
          </Button>
        </div>
      }
    >
      {loading ? (
        <div className="flex flex-col items-center justify-center py-10 space-y-3">
          <Loader2 className="size-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">
            Comprobando autenticidad, firma y fecha certificada...
          </p>
        </div>
      ) : (
        <div className="w-full space-y-4">
          {/* Banner de resultado principal */}
          <div
            className={`flex items-start gap-3 rounded-lg border p-3.5 ${
              isValid
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-800 dark:text-emerald-200"
                : "border-destructive/30 bg-destructive/10 text-destructive"
            }`}
          >
            <div className="mt-0.5 shrink-0">
              {isValid ? (
                <ShieldCheck className="size-5 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <ShieldAlert className="size-5 text-destructive" />
              )}
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-semibold">
                {isValid
                  ? "Documento auténtico y verificado"
                  : "Atención: La información no coincide con el registro original"}
              </h4>
              <p className="text-xs leading-relaxed opacity-90">
                {isValid
                  ? "El contenido de este documento coincide exactamente con la versión original emitida por el laboratorio y no ha sufrido modificaciones posteriores."
                  : "Se detectaron diferencias respecto a la versión firmada originalmente."}
              </p>
            </div>
          </div>

          {/* Tarjeta de comprobaciones clave */}
          <Card className="shadow-none">
            <CardHeader className="pb-2.5 border-b border-border/50">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Estado de Verificación
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-3 space-y-2.5 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-border/40">
                <span className="font-medium text-foreground">Contenido del documento:</span>
                <span className="flex items-center gap-1.5 font-semibold">
                  {integrityValid ? (
                    <>
                      <CheckCircle2 className="size-4 text-emerald-600" />
                      <span className="text-emerald-700 dark:text-emerald-400">
                        Original y sin alteraciones
                      </span>
                    </>
                  ) : (
                    <>
                      <XCircle className="size-4 text-destructive" />
                      <span className="text-destructive">Modificado o alterado</span>
                    </>
                  )}
                </span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-border/40">
                <span className="font-medium text-foreground">Firma digital del laboratorio:</span>
                <span className="flex items-center gap-1.5 font-semibold">
                  {signatureValid ? (
                    <>
                      <CheckCircle2 className="size-4 text-emerald-600" />
                      <span className="text-emerald-700 dark:text-emerald-400">
                        Válida y confirmada
                      </span>
                    </>
                  ) : (
                    <>
                      <XCircle className="size-4 text-destructive" />
                      <span className="text-destructive">No verificada</span>
                    </>
                  )}
                </span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-border/40">
                <span className="font-medium text-foreground">Fecha y hora oficial (Fecha Cierta):</span>
                <span className="flex items-center gap-1.5 font-semibold">
                  {isStamped ? (
                    <>
                      <CheckCircle2 className="size-4 text-emerald-600" />
                      <Badge variant="outline" className="border-emerald-500/40 text-emerald-700 dark:text-emerald-300">
                        Certificada
                      </Badge>
                    </>
                  ) : (
                    <>
                      <Clock className="size-4 text-amber-500" />
                      <Badge variant="outline" className="border-amber-500/40 text-amber-700 dark:text-amber-300">
                        En proceso de certificación
                      </Badge>
                    </>
                  )}
                </span>
              </div>

              {formattedStampedDate && (
                <div className="flex items-start gap-2 pt-1 text-muted-foreground">
                  <Calendar className="size-3.5 shrink-0 mt-0.5" />
                  <span>
                    Emitido y certificado el:{" "}
                    <strong className="text-foreground font-medium capitalize">
                      {formattedStampedDate}
                    </strong>
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Detalles técnicos (Exclusivos para laboratorio o desplegables) */}
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
                    Ocultar información técnica de laboratorio
                  </>
                ) : (
                  <>
                    <ChevronDown className="size-3.5" />
                    Ver información técnica de laboratorio (hashes, firma y calendario)
                  </>
                )}
              </Button>

              {showTechnicalDetails && (
                <Card className="shadow-none mt-2 bg-muted/20">
                  <CardHeader className="pb-2 border-b border-border/50">
                    <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <Hash className="size-3.5" />
                      Datos Criptográficos y de Auditoría
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-2.5 space-y-2 text-xs">
                    <div>
                      <span className="text-muted-foreground block mb-0.5">Hash canónico SHA-256:</span>
                      <code className="block bg-muted/60 p-2 rounded text-[11px] font-mono break-all select-all">
                        {canonicalHash || "—"}
                      </code>
                    </div>

                    <div className="flex items-center justify-between py-1 border-t border-border/30">
                      <span className="text-muted-foreground">Algoritmo de firma:</span>
                      <span className="font-mono text-foreground font-medium">{signatureAlgorithm}</span>
                    </div>

                    {otsCalendar && (
                      <div className="py-1 border-t border-border/30">
                        <span className="text-muted-foreground block mb-0.5">Servidor de calendario OTS:</span>
                        <span className="font-mono text-[11px] text-foreground break-all">{otsCalendar}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}
