import { useState, useEffect } from "react";
import {
  Mail,
  KeyRound,
  ShieldCheck,
  Send,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Server,
  Lock,
  Bell,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiKeysService } from "../../services/apiKeysService";
import { useToast } from "../../context/ToastContext";

export default function MailingConfigTab() {
  const { success: showSuccessToast, error: showErrorToast } = useToast();

  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);

  // Form State
  const [provider, setProvider] = useState("RESEND");
  const [apiKey, setApiKey] = useState("");
  const [fromEmail, setFromEmail] = useState("onboarding@resend.dev");
  const [fromName, setFromName] = useState("CTM Oficina Virtual");
  const [showKey, setShowKey] = useState(false);
  const [notifyNewRequests, setNotifyNewRequests] = useState(false);
  const [notificationEmail, setNotificationEmail] = useState("");

  // Test Email State
  const [testEmail, setTestEmail] = useState("");
  const [showTestModal, setShowTestModal] = useState(false);

  // Validation State (en rojo si falta, mensaje "Hay que completarlo")
  const [fieldErrors, setFieldErrors] = useState({});

  const clearFieldError = (name) => {
    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const loadStatus = async () => {
    setLoading(true);
    try {
      const data = await apiKeysService.getStatus("MAILING");
      setStatus(data);
      if (data?.provider) setProvider(data.provider);
      if (data?.metadata?.fromEmail) setFromEmail(data.metadata.fromEmail);
      if (data?.metadata?.fromName) setFromName(data.metadata.fromName);
      if (data?.metadata?.notifyNewRequests !== undefined) {
        setNotifyNewRequests(Boolean(data.metadata.notifyNewRequests));
      }
      if (data?.metadata?.notificationEmail) {
        setNotificationEmail(data.metadata.notificationEmail);
      }
    } catch (err) {
      console.error("Error al cargar estado de mailing:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStatus();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    const errors = {};

    if (!apiKey.trim() && !status?.isConfigured) {
      errors.apiKey = "Hay que completarlo";
    }
    if (!fromEmail.trim()) {
      errors.fromEmail = "Hay que completarlo";
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setSaving(true);
    try {
      await apiKeysService.saveApiKey({
        service: "MAILING",
        provider,
        name: `Resend API Key (${provider})`,
        apiKey: apiKey.trim() || undefined,
        metadata: {
          fromEmail: fromEmail.trim(),
          fromName: fromName.trim(),
          notifyNewRequests: Boolean(notifyNewRequests),
          notificationEmail: notificationEmail.trim() || undefined,
        },
      });

      showSuccessToast("Configuración de mailing guardada y cifrada con éxito.");
      setApiKey("");
      await loadStatus();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Error al guardar configuración";
      showErrorToast(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleTestSend = async (e) => {
    e.preventDefault();
    if (!testEmail.trim()) {
      showErrorToast("Ingresá un correo de destino");
      return;
    }

    setTesting(true);
    try {
      await apiKeysService.testMailing(testEmail.trim());
      showSuccessToast(`Correo de prueba enviado con éxito a ${testEmail}`);
      setShowTestModal(false);
      setTestEmail("");
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Error al enviar correo de prueba";
      showErrorToast(msg);
    } finally {
      setTesting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="size-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Tarjeta de Estado Actual */}
      <div className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Mail className="size-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-foreground">
                Estado del Servicio de Mailing
              </h2>
              <p className="text-xs text-muted-foreground">
                Gestión de credenciales para el envío de códigos OTP y notificaciones
              </p>
            </div>
          </div>

          <div>
            {status?.isConfigured ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                <CheckCircle2 className="size-3.5" />
                Configurado y Activo
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 px-3 py-1 text-xs font-semibold text-amber-700 dark:text-amber-400 border border-amber-500/20">
                <AlertCircle className="size-3.5" />
                No configurado (OTP opcional)
              </span>
            )}
          </div>
        </div>

        {status?.isConfigured && (
          <div className="grid gap-3 sm:grid-cols-3 text-xs">
            <div className="rounded-lg bg-muted/40 p-3 border border-border/50">
              <span className="text-muted-foreground block mb-1">Proveedor activo:</span>
              <span className="font-semibold text-foreground">{status.provider}</span>
            </div>
            <div className="rounded-lg bg-muted/40 p-3 border border-border/50">
              <span className="text-muted-foreground block mb-1">API Key protegida:</span>
              <span className="font-mono font-medium text-foreground">{status.keyHint}</span>
            </div>
            <div className="rounded-lg bg-muted/40 p-3 border border-border/50">
              <span className="text-muted-foreground block mb-1">Algoritmo de cifrado:</span>
              <span className="font-mono text-primary font-medium">{status.algorithm || "AES-256-GCM"}</span>
            </div>
          </div>
        )}
      </div>

      {/* Formulario de Configuración */}
      <form onSubmit={handleSave} className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-5">
        <div className="flex items-center gap-2 pb-2 border-b border-border text-xs font-semibold uppercase tracking-wider text-foreground">
          <KeyRound className="size-3.5 text-primary" />
          Configurar Proveedor y API Key
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {/* Selector de Proveedor */}
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="provider">Proveedor de correos</Label>
            <select
              id="provider"
              value={provider}
              onChange={(e) => setProvider(e.target.value)}
              className="h-10 w-full rounded-lg border border-input bg-card px-3 text-sm focus-visible:ring-2 focus-visible:ring-primary/30"
            >
              <option value="RESEND">Resend (Recomendado - Proveedor actual por default)</option>
            </select>
            <p className="text-[11px] text-muted-foreground">
              El cliente Resend está implementado por defecto para el envío de códigos de verificación.
            </p>
          </div>

          {/* API Key */}
          <div className="space-y-1.5 sm:col-span-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="apiKey" className={fieldErrors.apiKey ? "text-destructive" : ""}>
                API Key de {provider} *
              </Label>
              {status?.isConfigured && (
                <span className="text-[11px] text-muted-foreground font-mono">
                  Actual: {status.keyHint} (Dejá vacío para conservar)
                </span>
              )}
            </div>
            <div className="relative">
              <Input
                id="apiKey"
                type={showKey ? "text" : "password"}
                placeholder="re_12345678_abcdef..."
                value={apiKey}
                onChange={(e) => {
                  setApiKey(e.target.value);
                  clearFieldError("apiKey");
                }}
                className={`h-10 rounded-lg px-3.5 pr-11 bg-card transition-colors ${
                  fieldErrors.apiKey
                    ? "border-destructive focus-visible:ring-destructive/30 bg-destructive/5"
                    : "border-input"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowKey((prev) => !prev)}
                className="absolute right-1 top-1/2 flex min-h-[38px] min-w-[38px] -translate-y-1/2 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground"
              >
                {showKey ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
            {fieldErrors.apiKey ? (
              <p className="text-[11px] font-medium text-destructive">
                {fieldErrors.apiKey}
              </p>
            ) : (
              <p className="text-[11px] text-muted-foreground">
                La clave se cifra automáticamente en reposo mediante AES-256-GCM antes de guardarse en la base de datos.
              </p>
            )}
          </div>

          {/* Remitente Email */}
          <div className="space-y-1.5">
            <Label htmlFor="fromEmail" className={fieldErrors.fromEmail ? "text-destructive" : ""}>
              Correo remitente (From Email) *
            </Label>
            <Input
              id="fromEmail"
              type="email"
              placeholder="onboarding@resend.dev"
              value={fromEmail}
              onChange={(e) => {
                setFromEmail(e.target.value);
                clearFieldError("fromEmail");
              }}
              className={`h-10 rounded-lg bg-card transition-colors ${
                fieldErrors.fromEmail
                  ? "border-destructive focus-visible:ring-destructive/30 bg-destructive/5"
                  : "border-input"
              }`}
            />
            {fieldErrors.fromEmail && (
              <p className="text-[11px] font-medium text-destructive">
                {fieldErrors.fromEmail}
              </p>
            )}
          </div>

          {/* Remitente Nombre */}
          <div className="space-y-1.5">
            <Label htmlFor="fromName">Nombre remitente (From Name)</Label>
            <Input
              id="fromName"
              placeholder="CTM Oficina Virtual"
              value={fromName}
              onChange={(e) => setFromName(e.target.value)}
              className="h-10 rounded-lg bg-card"
            />
          </div>
        </div>

        {/* Notificaciones al Laboratorio */}
        <div className="pt-4 border-t border-border space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-foreground">
            <Bell className="size-3.5 text-primary" />
            Notificaciones al Laboratorio por Nuevas Solicitudes
          </div>
          <div className="rounded-xl border border-border/70 bg-muted/20 p-4 space-y-3">
            <div className="flex items-start gap-3">
              <input
                id="notifyNewRequests"
                type="checkbox"
                checked={notifyNewRequests}
                onChange={(e) => setNotifyNewRequests(e.target.checked)}
                className="mt-0.5 size-4 rounded border-input text-primary focus:ring-primary/30 accent-primary cursor-pointer"
              />
              <div className="text-xs space-y-0.5">
                <label
                  htmlFor="notifyNewRequests"
                  className="font-medium text-foreground cursor-pointer select-none"
                >
                  Recibir correos que notifiquen cuando ha entrado una nueva solicitud de ensayo
                </label>
                <p className="text-muted-foreground leading-relaxed">
                  Cuando un solicitante envíe un ensayo, el laboratorio recibirá un correo automático con los datos de la empresa, solicitante, producto y enlace directo a la solicitud.
                </p>
              </div>
            </div>

            {notifyNewRequests && (
              <div className="pt-2 pl-7 space-y-1.5">
                <Label htmlFor="notificationEmail" className="text-xs font-medium text-foreground">
                  Correo electrónico destinatario para avisos (Opcional)
                </Label>
                <Input
                  id="notificationEmail"
                  type="email"
                  placeholder="ej. ctmlaboratorio@gmail.com (dejar vacío para usar el correo oficial institucional)"
                  value={notificationEmail}
                  onChange={(e) => setNotificationEmail(e.target.value)}
                  className="h-9 text-xs bg-card"
                />
                <p className="text-[11px] text-muted-foreground">
                  Si se deja en blanco, el sistema enviará la notificación al correo oficial institucional configurado en Datos del Laboratorio.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Acciones */}
        <div className="pt-3 border-t border-border flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {status?.isConfigured && (
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowTestModal(true)}
                className="h-10 text-xs font-medium"
              >
                <Send className="mr-2 size-3.5" />
                Enviar correo de prueba
              </Button>
            )}
          </div>

          <Button
            type="submit"
            disabled={saving}
            className="h-10 px-5 text-sm font-semibold"
          >
            {saving ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
            Guardar configuración
          </Button>
        </div>
      </form>

      {/* Bloque Arquitectónico de Seguridad */}
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 sm:p-5 space-y-3">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
          <ShieldCheck className="size-4" />
          Arquitectura de Seguridad y Envelope Encryption
        </div>
        <p className="text-xs leading-relaxed text-muted-foreground">
          El subsistema de <strong>API Keys</strong> es independiente y multi-uso (preparado para soportar claves de AFIP, pasarelas de pago y almacenamiento).
          Cada credencial es protegida mediante <strong>AES-256-GCM</strong> utilizando claves maestras versionadas en las variables de entorno del servidor.
          La arquitectura cuenta con la interfaz desacoplada para habilitar <strong>Envelope Encryption con AWS KMS o Google Cloud KMS</strong> en entornos productivos regulados.
        </p>
      </div>

      {/* Modal de Correo de Prueba */}
      {showTestModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in"
          onClick={() => setShowTestModal(false)}
        >
          <div
            className="relative w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-xl space-y-4 text-card-foreground animate-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Send className="size-5" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-foreground">
                  Probar envío de correos
                </h3>
                <p className="text-xs text-muted-foreground">
                  Verificá que Resend entregue correos correctamente
                </p>
              </div>
            </div>

            <form onSubmit={handleTestSend} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="testEmail">Correo destinatario</Label>
                <Input
                  id="testEmail"
                  type="email"
                  placeholder="tu-correo@ejemplo.com"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  required
                  className="h-10 rounded-lg bg-card"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowTestModal(false)}
                  disabled={testing}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={testing}>
                  {testing ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
                  Enviar prueba
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
