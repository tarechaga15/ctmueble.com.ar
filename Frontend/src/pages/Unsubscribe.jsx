import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { CheckCircle2, AlertCircle, Loader2, BellOff, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { essaysService } from "../services/essaysService";

const LOGO = "/images/logo.png";
const LOGO_FALLBACK = "https://ctmueble.com.ar/wp-content/uploads/2025/09/cropped-logo-ctm-1-1.png";

export default function Unsubscribe() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const essayId = searchParams.get("essayId");

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [essayCode, setEssayCode] = useState("");
  const [error, setError] = useState("");
  const [logoSrc, setLogoSrc] = useState(LOGO);

  useEffect(() => {
    if (!token || !essayId) {
      setError("El enlace no contiene los parámetros necesarios para procesar la baja.");
    }
  }, [token, essayId]);

  const handleConfirmUnsubscribe = async () => {
    if (!token || !essayId) {
      setError("El enlace no contiene los parámetros necesarios para procesar la baja.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const res = await essaysService.unsubscribe(essayId, token);
      setSuccess(true);
      if (res?.essayCode) setEssayCode(res.essayCode);
    } catch (err) {
      const rawMsg = err.response?.data?.message || err.response?.data?.error || "";
      const isTechnical =
        !rawMsg ||
        /status code|internal server error|is not defined|invalid status|syntaxerror|typeerror|referenceerror/i.test(
          String(rawMsg)
        );
      setError(
        isTechnical
          ? "El enlace de desuscripción es inválido o no se pudo procesar la solicitud."
          : rawMsg
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md space-y-6 text-center">
        {/* Logo */}
        <div className="flex justify-center">
          <img
            src={logoSrc}
            onError={() => setLogoSrc(LOGO_FALLBACK)}
            alt="Logo CTM"
            className="h-16 w-auto object-contain"
          />
        </div>

        {/* Card principal */}
        <div className="rounded-2xl border border-border bg-card p-8 shadow-lg text-card-foreground">
          {loading ? (
            <div className="space-y-4 py-8">
              <Loader2 className="mx-auto size-10 animate-spin text-primary" />
              <h2 className="text-lg font-semibold text-foreground">Procesando solicitud...</h2>
              <p className="text-xs text-muted-foreground">
                Estamos registrando tu preferencia en el sistema.
              </p>
            </div>
          ) : success ? (
            <div className="space-y-5">
              <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="size-8" />
              </div>

              <div>
                <h2 className="text-xl font-bold tracking-tight text-foreground">
                  Notificaciones desactivadas
                </h2>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  Te has dado de baja correctamente de las notificaciones por correo electrónico{" "}
                  {essayCode ? (
                    <>para la solicitud de ensayo <strong>#{essayCode}</strong>.</>
                  ) : (
                    "para esta solicitud de ensayo."
                  )}
                </p>
              </div>

              <div className="rounded-xl bg-muted/40 p-4 border border-border/60 text-xs text-left text-muted-foreground space-y-1.5">
                <div className="flex items-center gap-2 font-medium text-foreground">
                  <BellOff className="size-4 text-primary shrink-0" />
                  <span>Preferencia registrada en el historial</span>
                </div>
                <p>
                  Ya no recibirás correos sobre los cambios de estado de este ensayo. Si más adelante deseás volver a recibirlas, podés activarlas en cualquier momento desde el detalle de la solicitud en la plataforma.
                </p>
              </div>

              <div className="pt-2">
                <Link to="/dashboard">
                  <Button className="w-full h-10 font-semibold gap-2">
                    Ir a la Oficina Virtual
                    <ArrowRight className="size-4" />
                  </Button>
                </Link>
              </div>
            </div>
          ) : error ? (
            <div className="space-y-5">
              <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-destructive/15 text-destructive">
                <AlertCircle className="size-8" />
              </div>

              <div>
                <h2 className="text-xl font-bold tracking-tight text-foreground">
                  No pudimos procesar la baja
                </h2>
                <p className="mt-2 text-xs text-muted-foreground">{error}</p>
              </div>

              <div className="pt-2">
                <Link to="/dashboard">
                  <Button variant="outline" className="w-full h-10 font-semibold">
                    Volver a la plataforma
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                <BellOff className="size-7" />
              </div>

              <div>
                <h2 className="text-xl font-bold tracking-tight text-foreground">
                  Confirmar baja de notificaciones
                </h2>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  ¿Confirmás que deseás dejar de recibir correos electrónicos con los cambios de estado de esta solicitud de ensayo?
                </p>
              </div>

              <div className="space-y-2.5 pt-2">
                <Button
                  type="button"
                  onClick={handleConfirmUnsubscribe}
                  className="w-full h-10 font-semibold gap-2"
                >
                  Confirmar baja de notificaciones
                  <BellOff className="size-4" />
                </Button>
                <Link to="/dashboard" className="block">
                  <Button variant="outline" className="w-full h-10 font-semibold">
                    Cancelar y volver
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>

        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} Centro Tecnológico del Mueble · Oficina Virtual
        </p>
      </div>
    </div>
  );
}
