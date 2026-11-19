import { useEffect, useState } from "react";
import {
  Shield,
  Lock,
  KeyRound,
  Smartphone,
  Mail,
  Laptop,
  Monitor,
  Tablet,
  CheckCircle2,
  AlertCircle,
  Trash2,
  LogOut,
  Copy,
  Check,
  Eye,
  EyeOff,
  Loader2,
  RotateCw,
  Globe,
  Calendar,
  Clock,
  ShieldCheck,
  ShieldAlert,
  Info,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/shared/page-header";
import ErrorAlert from "../components/ErrorAlert";
import OtpInput from "../components/auth/OtpInput";
import { usersService } from "../services/usersService";
import { useAuth } from "../context/AuthContext";

export default function AccountSettings() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("security"); // "security" | "sessions"

  // -----------------------------
  // ESTADO: CAMBIO DE CONTRASEÑA
  // -----------------------------
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [passwordError, setPasswordError] = useState("");

  // -----------------------------
  // ESTADO: 2FA (DOBLE FACTOR)
  // -----------------------------
  const [twoFactorStatus, setTwoFactorStatus] = useState({
    enabled: false,
    method: "NONE",
    confirmedAt: null,
    mail: "",
  });
  const [loading2FA, setLoading2FA] = useState(true);
  const [error2FA, setError2FA] = useState("");
  const [success2FA, setSuccess2FA] = useState("");

  // Modales de configuración 2FA
  const [totpModalOpen, setTotpModalOpen] = useState(false);
  const [totpData, setTotpData] = useState(null); // { secret, qrCode, otpauthUrl }
  const [totpCode, setTotpCode] = useState("");
  const [totpError, setTotpError] = useState("");
  const [totpLoading, setTotpLoading] = useState(false);
  const [copiedSecret, setCopiedSecret] = useState(false);

  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [emailCode, setEmailCode] = useState("");
  const [emailError, setEmailError] = useState("");
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailResending, setEmailResending] = useState(false);
  const [emailCooldown, setEmailCooldown] = useState(0);

  const [disableModalOpen, setDisableModalOpen] = useState(false);
  const [disablePassword, setDisablePassword] = useState("");
  const [disableError, setDisableError] = useState("");
  const [disableLoading, setDisableLoading] = useState(false);

  // -----------------------------
  // ESTADO: CÓDIGOS DE RECUPERACIÓN
  // -----------------------------
  const [recoveryStatus, setRecoveryStatus] = useState({
    enabled: false,
    totalCodes: 0,
    remainingCodes: 0,
  });
  const [loadingRecoveryCodes, setLoadingRecoveryCodes] = useState(false);
  const [newRecoveryCodesModalOpen, setNewRecoveryCodesModalOpen] = useState(false);
  const [newRecoveryCodes, setNewRecoveryCodes] = useState([]);
  const [generateModalOpen, setGenerateModalOpen] = useState(false);
  const [generatePassword, setGeneratePassword] = useState("");
  const [generateError, setGenerateError] = useState("");
  const [generateLoading, setGenerateLoading] = useState(false);
  const [copiedCodes, setCopiedCodes] = useState(false);

  // -----------------------------
  // ESTADO: DISPOSITIVOS DE CONFIANZA
  // -----------------------------
  const [trustedDevices, setTrustedDevices] = useState([]);
  const [trustedDevicesLoading, setTrustedDevicesLoading] = useState(false);
  const [trustedDevicesError, setTrustedDevicesError] = useState("");
  const [trustedDevicesSuccess, setTrustedDevicesSuccess] = useState("");
  const [revokingDeviceId, setRevokingDeviceId] = useState(null);
  const [revokingAllDevices, setRevokingAllDevices] = useState(false);

  // -----------------------------
  // ESTADO: SESIONES ACTIVAS
  // -----------------------------
  const [sessions, setSessions] = useState([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [sessionsError, setSessionsError] = useState("");
  const [sessionsSuccess, setSessionsSuccess] = useState("");
  const [revokingId, setRevokingId] = useState(null);
  const [revokingOthers, setRevokingOthers] = useState(false);

  // Cargar estado de códigos de recuperación
  const loadRecoveryCodesStatus = async () => {
    try {
      setLoadingRecoveryCodes(true);
      const data = await usersService.getRecoveryCodesStatus();
      setRecoveryStatus(data);
    } catch {
      // No crítico si falla
    } finally {
      setLoadingRecoveryCodes(false);
    }
  };

  // Cargar dispositivos de confianza
  const loadTrustedDevices = async () => {
    try {
      setTrustedDevicesLoading(true);
      setTrustedDevicesError("");
      const list = await usersService.getTrustedDevices();
      setTrustedDevices(Array.isArray(list) ? list : []);
    } catch (err) {
      setTrustedDevicesError(
        err.response?.data?.message || "Error al obtener dispositivos de confianza"
      );
    } finally {
      setTrustedDevicesLoading(false);
    }
  };

  // Cargar estado de 2FA
  const load2FAStatus = async () => {
    try {
      setLoading2FA(true);
      setError2FA("");
      const status = await usersService.getTwoFactorStatus();
      setTwoFactorStatus(status);
      if (status.enabled) {
        loadRecoveryCodesStatus();
      }
    } catch (err) {
      setError2FA(err.response?.data?.message || "No se pudo cargar el estado de 2FA");
    } finally {
      setLoading2FA(false);
    }
  };

  // Cargar sesiones activas
  const loadSessions = async () => {
    try {
      setSessionsLoading(true);
      setSessionsError("");
      const list = await usersService.getActiveSessions();
      setSessions(Array.isArray(list) ? list : []);
    } catch (err) {
      setSessionsError(err.response?.data?.message || "Error al obtener las sesiones activas");
    } finally {
      setSessionsLoading(false);
    }
  };

  useEffect(() => {
    load2FAStatus();
    loadSessions();
    loadTrustedDevices();
  }, []);

  // Manejar cambio de contraseña
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    if (!currentPassword) {
      setPasswordError("Ingresá tu contraseña actual");
      return;
    }
    if (!newPassword || newPassword.length < 12) {
      setPasswordError("La nueva contraseña debe tener al menos 12 caracteres");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("La nueva contraseña y su confirmación no coinciden");
      return;
    }
    if (currentPassword === newPassword) {
      setPasswordError("La nueva contraseña no puede ser idéntica a la actual");
      return;
    }

    try {
      setPasswordLoading(true);
      const res = await usersService.changePassword({
        currentPassword,
        newPassword,
        confirmPassword,
      });
      setPasswordSuccess(res.message || "Contraseña actualizada exitosamente.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      loadSessions(); // Las demás sesiones fueron revocadas
      loadTrustedDevices(); // Los dispositivos de confianza se revocan al cambiar contraseña
    } catch (err) {
      setPasswordError(
        err.response?.data?.message || err.message || "Error al cambiar la contraseña"
      );
    } finally {
      setPasswordLoading(false);
    }
  };

  // Iniciar configuración de Google Authenticator
  const handleStartTotpSetup = async () => {
    setTotpError("");
    setTotpCode("");
    setTotpLoading(true);
    try {
      const data = await usersService.setupTotp2FA();
      setTotpData(data);
      setTotpModalOpen(true);
    } catch (err) {
      setError2FA(err.response?.data?.message || "No se pudo iniciar la configuración de TOTP");
    } finally {
      setTotpLoading(false);
    }
  };

  // Confirmar código de Google Authenticator
  const handleConfirmTotp = async (e) => {
    e?.preventDefault?.();
    if (!totpCode || totpCode.length < 6) {
      setTotpError("Ingresá el código de 6 dígitos que muestra tu app Authenticator");
      return;
    }
    setTotpLoading(true);
    setTotpError("");
    try {
      const res = await usersService.confirmTotp2FA(totpCode);
      setTotpModalOpen(false);
      setSuccess2FA(res.message || "Google Authenticator activado exitosamente");
      await load2FAStatus();
      const codes = res.recoveryCodes || res.codes || [];
      if (Array.isArray(codes) && codes.length > 0) {
        setNewRecoveryCodes(codes);
        setNewRecoveryCodesModalOpen(true);
      }
    } catch (err) {
      setTotpError(err.response?.data?.message || "Código incorrecto o expirado");
    } finally {
      setTotpLoading(false);
    }
  };

  // Iniciar configuración de OTP por correo
  const handleStartEmailSetup = async () => {
    setEmailError("");
    setEmailCode("");
    setEmailLoading(true);
    try {
      await usersService.setupEmail2FA();
      setEmailModalOpen(true);
      setEmailCooldown(60);
      const interval = setInterval(() => {
        setEmailCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      setError2FA(err.response?.data?.message || "Error al enviar código de prueba al correo");
    } finally {
      setEmailLoading(false);
    }
  };

  // Reenviar código OTP por correo
  const handleResendEmailOtp = async () => {
    if (emailCooldown > 0 || emailResending) return;
    setEmailResending(true);
    setEmailError("");
    try {
      await usersService.setupEmail2FA();
      setEmailCooldown(60);
      const interval = setInterval(() => {
        setEmailCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      setEmailError(err.response?.data?.message || "Error al reenviar el código");
    } finally {
      setEmailResending(false);
    }
  };

  // Confirmar OTP por correo
  const handleConfirmEmailOtp = async (e) => {
    e?.preventDefault?.();
    if (!emailCode || emailCode.length < 6) {
      setEmailError("Ingresá el código de 6 dígitos recibido por correo");
      return;
    }
    setEmailLoading(true);
    setEmailError("");
    try {
      const res = await usersService.confirmEmail2FA(emailCode);
      setEmailModalOpen(false);
      setSuccess2FA(res.message || "OTP por correo activado exitosamente");
      await load2FAStatus();
      const codes = res.recoveryCodes || res.codes || [];
      if (Array.isArray(codes) && codes.length > 0) {
        setNewRecoveryCodes(codes);
        setNewRecoveryCodesModalOpen(true);
      }
    } catch (err) {
      setEmailError(err.response?.data?.message || "Código incorrecto o expirado");
    } finally {
      setEmailLoading(false);
    }
  };

  // Desactivar 2FA
  const handleDisable2FA = async (e) => {
    e.preventDefault();
    if (!disablePassword) {
      setDisableError("Ingresá tu contraseña actual para confirmar");
      return;
    }
    setDisableLoading(true);
    setDisableError("");
    try {
      const res = await usersService.disable2FA(disablePassword);
      setDisableModalOpen(false);
      setDisablePassword("");
      setSuccess2FA(res.message || "Doble factor desactivado correctamente");
      await load2FAStatus();
      await loadTrustedDevices();
      setRecoveryStatus({ enabled: false, totalCodes: 0, remainingCodes: 0, total: 0, remaining: 0 });
    } catch (err) {
      setDisableError(err.response?.data?.message || "Contraseña incorrecta");
    } finally {
      setDisableLoading(false);
    }
  };

  // Generar nuevos códigos de recuperación con confirmación de contraseña
  const handleGenerateRecoveryCodes = async (e) => {
    e.preventDefault();
    if (!generatePassword) {
      setGenerateError("Ingresá tu contraseña actual para confirmar");
      return;
    }
    setGenerateLoading(true);
    setGenerateError("");
    try {
      const res = await usersService.generateRecoveryCodes(generatePassword);
      setGenerateModalOpen(false);
      setGeneratePassword("");
      const codes = res.recoveryCodes || res.codes || [];
      if (Array.isArray(codes) && codes.length > 0) {
        setNewRecoveryCodes(codes);
        setNewRecoveryCodesModalOpen(true);
      }
      await loadRecoveryCodesStatus();
    } catch (err) {
      setGenerateError(err.response?.data?.message || "Contraseña incorrecta");
    } finally {
      setGenerateLoading(false);
    }
  };

  // Copiar todos los códigos de recuperación al portapapeles
  const handleCopyAllRecoveryCodes = () => {
    if (!newRecoveryCodes || newRecoveryCodes.length === 0) return;
    const text = newRecoveryCodes.join("\n");
    navigator.clipboard.writeText(text);
    setCopiedCodes(true);
    setTimeout(() => setCopiedCodes(false), 2500);
  };

  // Descargar códigos de recuperación como archivo .txt
  const handleDownloadRecoveryCodes = () => {
    if (!newRecoveryCodes || newRecoveryCodes.length === 0) return;
    const content = [
      "===========================================================",
      "CENTRO TECNOLÓGICO DEL MUEBLE (CTM) - OFICINA VIRTUAL",
      "CÓDIGOS DE RECUPERACIÓN Y CONFIANZA (2FA)",
      `Usuario: ${user?.mail || ""}`,
      `Fecha de emisión: ${new Date().toLocaleString("es-AR")}`,
      "===========================================================",
      "",
      "INSTRUCCIONES:",
      "- Cada código es de un único uso.",
      "- Podés ingresar cualquiera de estos códigos al iniciar sesión si",
      "  perdés tu dispositivo o acceso a tu app Authenticator / Correo.",
      "- Guardá este archivo en un lugar protegido y confidencial.",
      "",
      "TUS CÓDIGOS DE RECUPERACIÓN:",
      ...newRecoveryCodes.map((c, i) => `  ${i + 1}. ${c}`),
      "",
      "===========================================================",
    ].join("\r\n");

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const safeUser = (user?.mail || "usuario").replace(/[^a-zA-Z0-9]/g, "_");
    a.download = `CTM-codigos-recuperacion-${safeUser}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  // Revocar un dispositivo de confianza
  const handleRevokeTrustedDevice = async (id) => {
    if (
      !confirm(
        "¿Revocar este dispositivo de confianza? Se volverá a solicitar el segundo factor al iniciar sesión desde este equipo."
      )
    ) {
      return;
    }
    setRevokingDeviceId(id);
    setTrustedDevicesError("");
    setTrustedDevicesSuccess("");
    try {
      await usersService.revokeTrustedDevice(id);
      setTrustedDevicesSuccess("Dispositivo revocado de la lista de confianza.");
      await loadTrustedDevices();
    } catch (err) {
      setTrustedDevicesError(err.response?.data?.message || "Error al revocar el dispositivo");
    } finally {
      setRevokingDeviceId(null);
    }
  };

  // Revocar todos los dispositivos de confianza
  const handleRevokeAllTrustedDevices = async () => {
    if (
      !confirm(
        "¿Revocar todos los dispositivos de confianza? Todos los equipos requerirán 2FA en el próximo inicio de sesión."
      )
    ) {
      return;
    }
    setRevokingAllDevices(true);
    setTrustedDevicesError("");
    setTrustedDevicesSuccess("");
    try {
      const res = await usersService.revokeAllTrustedDevices();
      setTrustedDevicesSuccess(
        `Se revocaron ${res.count || 0} dispositivo(s) de confianza.`
      );
      await loadTrustedDevices();
    } catch (err) {
      setTrustedDevicesError(err.response?.data?.message || "Error al revocar los dispositivos");
    } finally {
      setRevokingAllDevices(false);
    }
  };

  // Copiar clave secreta TOTP al portapapeles
  const handleCopySecret = () => {
    if (totpData?.secret) {
      navigator.clipboard.writeText(totpData.secret);
      setCopiedSecret(true);
      setTimeout(() => setCopiedSecret(false), 2500);
    }
  };

  // Revocar una sesión específica
  const handleRevokeSession = async (sessionId) => {
    if (!confirm("¿Estás seguro de que querés cerrar esta sesión?")) return;
    setRevokingId(sessionId);
    setSessionsError("");
    setSessionsSuccess("");
    try {
      await usersService.revokeSession(sessionId);
      setSessionsSuccess("Sesión cerrada exitosamente.");
      await loadSessions();
    } catch (err) {
      setSessionsError(err.response?.data?.message || "Error al cerrar la sesión");
    } finally {
      setRevokingId(null);
    }
  };

  // Revocar todas las demás sesiones
  const handleRevokeOtherSessions = async () => {
    if (
      !confirm(
        "¿Estás seguro de que querés cerrar todas las demás sesiones? Los otros dispositivos deberán iniciar sesión nuevamente."
      )
    ) {
      return;
    }
    setRevokingOthers(true);
    setSessionsError("");
    setSessionsSuccess("");
    try {
      const res = await usersService.revokeOtherSessions();
      setSessionsSuccess(
        `Se cerraron ${res.count || 0} sesión(es) remotas. Tu sesión actual se mantiene activa.`
      );
      await loadSessions();
    } catch (err) {
      setSessionsError(err.response?.data?.message || "Error al cerrar las demás sesiones");
    } finally {
      setRevokingOthers(false);
    }
  };

  // Formato de fecha legible
  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    try {
      const d = new Date(dateStr);
      return d.toLocaleString("es-AR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  // Ícono de dispositivo
  const getDeviceIcon = (clientName = "") => {
    const lower = clientName.toLowerCase();
    if (lower.includes("iphone") || lower.includes("android")) {
      return <Smartphone className="size-5 text-primary" />;
    }
    if (lower.includes("ipad") || lower.includes("tablet")) {
      return <Tablet className="size-5 text-primary" />;
    }
    if (lower.includes("mac") || lower.includes("laptop")) {
      return <Laptop className="size-5 text-primary" />;
    }
    return <Monitor className="size-5 text-primary" />;
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Encabezado */}
      <PageHeader
        title="Configuración de Cuenta"
        description="Administrá tus credenciales de acceso, métodos de autenticación en dos factores y sesiones activas."
      />

      {/* Selector de Pestañas */}
      <div className="flex border-b border-border">
        <button
          type="button"
          onClick={() => setActiveTab("security")}
          className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-semibold transition-colors ${
            activeTab === "security"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Shield className="size-4" />
          Seguridad y Autenticación
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("sessions")}
          className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-semibold transition-colors ${
            activeTab === "sessions"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Laptop className="size-4" />
          Sesiones Activas
          {sessions.length > 0 && (
            <span className="ml-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">
              {sessions.length}
            </span>
          )}
        </button>
      </div>

      {/* ========================================================= */}
      {/* PESTAÑA 1: SEGURIDAD Y AUTENTICACIÓN                      */}
      {/* ========================================================= */}
      {activeTab === "security" && (
        <div className="space-y-8">
          {/* Mensajes de feedback general de 2FA */}
          {success2FA && (
            <div className="flex items-center gap-2.5 rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3.5 text-sm text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="size-5 shrink-0" />
              <span>{success2FA}</span>
            </div>
          )}
          {error2FA && <ErrorAlert message={error2FA} />}

          {/* SECCIÓN 1: CAMBIO DE CONTRASEÑA */}
          <div className="rounded-xl border border-border bg-card p-5 sm:p-6 shadow-sm">
            <div className="flex items-center gap-3 border-b border-border pb-4 mb-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Lock className="size-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-foreground">Cambio de Contraseña</h2>
                <p className="text-xs text-muted-foreground">
                  Actualizá tu contraseña periódicamente para proteger tu cuenta.
                </p>
              </div>
            </div>

            {passwordSuccess && (
              <div className="mb-4 flex items-center gap-2.5 rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="size-4 shrink-0" />
                <span>{passwordSuccess}</span>
              </div>
            )}
            {passwordError && (
              <div className="mb-4">
                <ErrorAlert message={passwordError} />
              </div>
            )}

            <form onSubmit={handlePasswordSubmit} className="max-w-xl space-y-4">
              {/* Contraseña actual */}
              <div className="space-y-1">
                <Label htmlFor="current-pass">Contraseña actual</Label>
                <div className="relative">
                  <Input
                    id="current-pass"
                    type={showCurrentPass ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="h-10 pr-10"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPass(!showCurrentPass)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground"
                  >
                    {showCurrentPass ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>

              {/* Nueva contraseña */}
              <div className="space-y-1">
                <Label htmlFor="new-pass">Nueva contraseña (mínimo 12 caracteres)</Label>
                <div className="relative">
                  <Input
                    id="new-pass"
                    type={showNewPass ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="h-10 pr-10"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPass(!showNewPass)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground"
                  >
                    {showNewPass ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>

              {/* Confirmar nueva contraseña */}
              <div className="space-y-1">
                <Label htmlFor="confirm-pass">Confirmar nueva contraseña</Label>
                <div className="relative">
                  <Input
                    id="confirm-pass"
                    type={showConfirmPass ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="h-10 pr-10"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPass(!showConfirmPass)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground"
                  >
                    {showConfirmPass ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={passwordLoading || !currentPassword || !newPassword || !confirmPassword}
                  className="h-10 font-semibold"
                >
                  {passwordLoading ? (
                    <>
                      <Loader2 className="mr-2 size-4 animate-spin" />
                      Actualizando...
                    </>
                  ) : (
                    "Actualizar Contraseña"
                  )}
                </Button>
              </div>
            </form>
          </div>

          {/* SECCIÓN 2: DOBLE FACTOR DE AUTENTICACIÓN (2FA) */}
          <div className="rounded-xl border border-border bg-card p-5 sm:p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4 mb-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <ShieldCheck className="size-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-foreground">
                    Autenticación en Dos Pasos (2FA)
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Añade una capa adicional de protección a tu cuenta al iniciar sesión.
                  </p>
                </div>
              </div>

              {/* Estado actual badge */}
              <div className="flex items-center gap-2">
                {twoFactorStatus.enabled ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    <CheckCircle2 className="size-3.5" />
                    2FA Activado (
                    {twoFactorStatus.method === "EMAIL"
                      ? "OTP por Correo"
                      : "Google Authenticator"}
                    )
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground border border-border">
                    <AlertCircle className="size-3.5" />
                    2FA Desactivado
                  </span>
                )}
              </div>
            </div>

            {/* Si está activado, ofrecer botón de desactivación */}
            {twoFactorStatus.enabled && (
              <div className="mb-6 rounded-lg border border-primary/20 bg-primary/5 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-foreground">
                    Tu cuenta está actualmente protegida con 2FA
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Método activo:{" "}
                    <strong>
                      {twoFactorStatus.method === "EMAIL"
                        ? "Código OTP enviado a tu correo"
                        : "Aplicación Google Authenticator (TOTP)"}
                    </strong>
                    {twoFactorStatus.confirmedAt && (
                      <span> · Activado el {formatDate(twoFactorStatus.confirmedAt)}</span>
                    )}
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => {
                    setDisableError("");
                    setDisablePassword("");
                    setDisableModalOpen(true);
                  }}
                  className="text-destructive hover:bg-destructive/10 border-destructive/30 shrink-0 text-xs font-semibold h-9"
                >
                  Desactivar 2FA
                </Button>
              </div>
            )}

            {/* Opciones de 2FA */}
            <div className="grid gap-4 md:grid-cols-2">
              {/* Opción A: Google Authenticator */}
              <div
                className={`rounded-xl border p-5 transition-all ${
                  twoFactorStatus.enabled && twoFactorStatus.method === "TOTP"
                    ? "border-primary bg-primary/5 shadow-sm ring-1 ring-primary/20"
                    : "border-border bg-card hover:border-border/80"
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Smartphone className="size-5" />
                  </div>
                  {twoFactorStatus.enabled && twoFactorStatus.method === "TOTP" && (
                    <span className="rounded-full bg-primary/15 px-2.5 py-0.5 text-[11px] font-bold text-primary">
                      Activo
                    </span>
                  )}
                </div>
                <h3 className="font-bold text-sm text-foreground">Google Authenticator / TOTP</h3>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  Generá códigos temporales de 6 dígitos desde cualquier app como Google Authenticator,
                  Microsoft Authenticator o Authy en tu teléfono.
                </p>

                <div className="mt-4 pt-3 border-t border-border/50">
                  {twoFactorStatus.enabled && twoFactorStatus.method === "TOTP" ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setDisableError("");
                        setDisablePassword("");
                        setDisableModalOpen(true);
                      }}
                      className="w-full text-xs text-destructive hover:bg-destructive/10"
                    >
                      Desactivar este método
                    </Button>
                  ) : (
                    <Button
                      variant="default"
                      size="sm"
                      onClick={handleStartTotpSetup}
                      disabled={totpLoading}
                      className="w-full text-xs font-semibold"
                    >
                      {totpLoading ? (
                        <>
                          <Loader2 className="mr-1.5 size-3.5 animate-spin" />
                          Generando clave...
                        </>
                      ) : (
                        "Configurar Google Authenticator"
                      )}
                    </Button>
                  )}
                </div>
              </div>

              {/* Opción B: OTP por Correo */}
              <div
                className={`rounded-xl border p-5 transition-all ${
                  twoFactorStatus.enabled && twoFactorStatus.method === "EMAIL"
                    ? "border-primary bg-primary/5 shadow-sm ring-1 ring-primary/20"
                    : "border-border bg-card hover:border-border/80"
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Mail className="size-5" />
                  </div>
                  {twoFactorStatus.enabled && twoFactorStatus.method === "EMAIL" && (
                    <span className="rounded-full bg-primary/15 px-2.5 py-0.5 text-[11px] font-bold text-primary">
                      Activo
                    </span>
                  )}
                </div>
                <h3 className="font-bold text-sm text-foreground">OTP por Correo Electrónico</h3>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  Recibí un código de seguridad de 6 dígitos en tu casilla{" "}
                  <strong>{user?.mail}</strong> cada vez que inicies sesión.
                </p>

                <div className="mt-4 pt-3 border-t border-border/50">
                  {twoFactorStatus.enabled && twoFactorStatus.method === "EMAIL" ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setDisableError("");
                        setDisablePassword("");
                        setDisableModalOpen(true);
                      }}
                      className="w-full text-xs text-destructive hover:bg-destructive/10"
                    >
                      Desactivar este método
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleStartEmailSetup}
                      disabled={emailLoading}
                      className="w-full text-xs font-semibold"
                    >
                      {emailLoading ? (
                        <>
                          <Loader2 className="mr-1.5 size-3.5 animate-spin" />
                          Enviando código...
                        </>
                      ) : (
                        "Activar OTP por Correo"
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* SUBSECCIÓN: CÓDIGOS DE RECUPERACIÓN / CONFIANZA (Sólo visible si 2FA está activado) */}
            {twoFactorStatus.enabled && (() => {
              const remCodes = recoveryStatus.remainingCodes ?? recoveryStatus.remaining ?? 0;
              const totCodes = recoveryStatus.totalCodes ?? recoveryStatus.total ?? 8;

              return (
                <div className="mt-6 pt-6 border-t border-border">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                        <KeyRound className="size-4" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-foreground">
                          Códigos de Recuperación y Confianza (2FA)
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          Permiten iniciar sesión de respaldo si perdés el acceso a tu teléfono o correo.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {loadingRecoveryCodes ? (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Loader2 className="size-3 animate-spin" /> Cargando...
                        </span>
                      ) : (
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold border ${
                            remCodes === 0
                              ? "bg-destructive/10 text-destructive border-destructive/20"
                              : remCodes <= 2
                              ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                              : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                          }`}
                        >
                          <CheckCircle2 className="size-3" />
                          {remCodes} de {totCodes} disponibles
                        </span>
                      )}
                    </div>
                  </div>

                  {remCodes === 0 && !loadingRecoveryCodes && (
                    <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive flex items-center gap-2">
                      <AlertCircle className="size-4 shrink-0" />
                      <span>
                        ¡Atención! No te quedan códigos de recuperación disponibles. Generá un nuevo lote ahora para no perder el acceso a tu cuenta en caso de emergencia.
                      </span>
                    </div>
                  )}

                  {remCodes > 0 && remCodes <= 2 && !loadingRecoveryCodes && (
                    <div className="mb-4 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-700 dark:text-amber-300 flex items-center gap-2">
                      <AlertCircle className="size-4 shrink-0" />
                      <span>
                        Te quedan pocos códigos de recuperación ({remCodes}). Te recomendamos generar un nuevo lote.
                      </span>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-muted/40 rounded-lg p-3.5 border border-border">
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Cada código sólo puede utilizarse una única vez. Al generar un nuevo lote de códigos, los anteriores quedan invalidados automáticamente.
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setGenerateError("");
                        setGeneratePassword("");
                        setGenerateModalOpen(true);
                      }}
                      className="shrink-0 text-xs font-semibold"
                    >
                      <KeyRound className="mr-1.5 size-3.5" />
                      Generar Nuevos Códigos
                    </Button>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* SECCIÓN 3: DISPOSITIVOS DE CONFIANZA */}
          <div className="rounded-xl border border-border bg-card p-5 sm:p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4 mb-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Laptop className="size-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-foreground">Dispositivos de Confianza</h2>
                  <p className="text-xs text-muted-foreground">
                    Equipos reconocidos por su huella digital donde no se solicita el 2FA durante 7 días.
                  </p>
                </div>
              </div>

              {trustedDevices.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRevokeAllTrustedDevices}
                  disabled={revokingAllDevices}
                  className="text-destructive hover:bg-destructive/10 border-destructive/30 text-xs font-semibold h-9 shrink-0"
                >
                  {revokingAllDevices ? (
                    <>
                      <Loader2 className="mr-1.5 size-3.5 animate-spin" />
                      Revocando...
                    </>
                  ) : (
                    <>
                      <Trash2 className="mr-1.5 size-3.5" />
                      Revocar todos los dispositivos
                    </>
                  )}
                </Button>
              )}
            </div>

            {trustedDevicesSuccess && (
              <div className="mb-4 flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3 text-xs text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="size-4 shrink-0" />
                <span>{trustedDevicesSuccess}</span>
              </div>
            )}
            {trustedDevicesError && <div className="mb-4"><ErrorAlert message={trustedDevicesError} /></div>}

            {trustedDevicesLoading ? (
              <div className="flex items-center justify-center py-8 text-muted-foreground text-xs">
                <Loader2 className="mr-2 size-4 animate-spin" />
                <span>Cargando dispositivos de confianza...</span>
              </div>
            ) : trustedDevices.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border p-6 text-center">
                <ShieldCheck className="mx-auto size-8 text-muted-foreground/60 mb-2" />
                <p className="text-sm font-semibold text-foreground">No tenés dispositivos de confianza activos</p>
                <p className="text-xs text-muted-foreground mt-1 max-w-md mx-auto">
                  Al iniciar sesión con 2FA, podés marcar la casilla <strong>"Confiar en este dispositivo por 7 días"</strong> para no tener que ingresar el código en este equipo durante una semana.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {trustedDevices.map((device) => (
                  <div
                    key={device.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-3.5 first:pt-0 last:pb-0"
                  >
                    <div className="flex items-start gap-3.5">
                      <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted border border-border">
                        {getDeviceIcon(device.device_name)}
                      </div>
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-bold text-foreground">
                            {device.device_name || "Navegador Web"}
                          </span>
                          {device.is_current && (
                            <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                              Este equipo actual
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2.5 text-xs text-muted-foreground flex-wrap">
                          <span className="flex items-center gap-1">
                            <Clock className="size-3" />
                            Confianza válida hasta:{" "}
                            <strong className="text-foreground">{formatDate(device.trusted_until)}</strong>
                          </span>
                          <span>·</span>
                          <span className="flex items-center gap-1">
                            <Calendar className="size-3" />
                            Último uso: {formatDate(device.last_used_at)}
                          </span>
                          {device.ip_address && (
                            <>
                              <span>·</span>
                              <span className="flex items-center gap-1">
                                <Globe className="size-3" />
                                IP: {device.ip_address}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="self-end sm:self-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRevokeTrustedDevice(device.id)}
                        disabled={revokingDeviceId === device.id}
                        className="h-8 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive font-medium"
                      >
                        {revokingDeviceId === device.id ? (
                          <Loader2 className="mr-1.5 size-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="mr-1.5 size-3.5" />
                        )}
                        Revocar confianza
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* PESTAÑA 2: SESIONES ACTIVAS                               */}
      {/* ========================================================= */}
      {activeTab === "sessions" && (
        <div className="space-y-6">
          {sessionsSuccess && (
            <div className="flex items-center gap-2.5 rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3.5 text-sm text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="size-5 shrink-0" />
              <span>{sessionsSuccess}</span>
            </div>
          )}
          {sessionsError && <ErrorAlert message={sessionsError} />}

          <div className="rounded-xl border border-border bg-card p-5 sm:p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4 mb-5">
              <div>
                <h2 className="text-base font-bold text-foreground">Dispositivos y Sesiones Activas</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Estas son las sesiones iniciadas en tu cuenta actualmente registradas en el sistema.
                </p>
              </div>

              {sessions.filter((s) => !s.isCurrent).length > 0 && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleRevokeOtherSessions}
                  disabled={revokingOthers}
                  className="text-xs font-semibold h-9 shrink-0 shadow-sm"
                >
                  {revokingOthers ? (
                    <>
                      <Loader2 className="mr-1.5 size-3.5 animate-spin" />
                      Cerrando sesiones...
                    </>
                  ) : (
                    <>
                      <LogOut className="mr-1.5 size-3.5" />
                      Cerrar todas las demás sesiones
                    </>
                  )}
                </Button>
              )}
            </div>

            {sessionsLoading ? (
              <div className="flex items-center justify-center py-12 text-muted-foreground">
                <Loader2 className="mr-2 size-5 animate-spin" />
                <span>Cargando sesiones...</span>
              </div>
            ) : sessions.length === 0 ? (
              <div className="py-8 text-center text-sm text-muted-foreground">
                No se encontraron sesiones registradas.
              </div>
            ) : (
              <div className="divide-y divide-border">
                {sessions.map((session) => (
                  <div
                    key={session.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4 first:pt-0 last:pb-0"
                  >
                    <div className="flex items-start gap-3.5">
                      <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted border border-border">
                        {getDeviceIcon(session.clientName)}
                      </div>
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-bold text-foreground">
                            {session.clientName || "Dispositivo Web"}
                          </span>
                          {session.isCurrent ? (
                            <span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                              Esta sesión actual
                            </span>
                          ) : null}
                        </div>

                        <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                          <span className="flex items-center gap-1">
                            <Globe className="size-3" />
                            IP: {session.ipAddress}
                          </span>
                          <span>·</span>
                          <span className="flex items-center gap-1">
                            <Clock className="size-3" />
                            Última actividad: {formatDate(session.lastActiveAt)}
                          </span>
                          <span>·</span>
                          <span className="flex items-center gap-1">
                            <Calendar className="size-3" />
                            Iniciada: {formatDate(session.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {!session.isCurrent && (
                      <div className="self-end sm:self-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRevokeSession(session.id)}
                          disabled={revokingId === session.id}
                          className="h-8 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive font-medium"
                        >
                          {revokingId === session.id ? (
                            <Loader2 className="mr-1.5 size-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="mr-1.5 size-3.5" />
                          )}
                          Cerrar sesión
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 1: CONFIGURAR GOOGLE AUTHENTICATOR (TOTP)           */}
      {/* ========================================================= */}
      {totpModalOpen && totpData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center gap-3 border-b border-border pb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Smartphone className="size-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground">Configurar Google Authenticator</h3>
                <p className="text-xs text-muted-foreground">Paso a paso para vincular tu app</p>
              </div>
            </div>

            <div className="space-y-4 text-xs text-muted-foreground leading-relaxed">
              <p>
                <strong>1.</strong> Abrí tu app Authenticator (Google Authenticator, Microsoft Authenticator o Authy) en tu teléfono y escaneá este código QR:
              </p>

              {/* Código QR */}
              <div className="flex justify-center p-3 bg-white rounded-lg border border-border shadow-xs">
                <img
                  src={totpData.qrCode}
                  alt="Código QR para Google Authenticator"
                  className="w-48 h-48 object-contain"
                />
              </div>

              {/* Clave secreta manual */}
              <div>
                <p className="mb-1.5">
                  <strong>O ingresá la clave manualmente si no podés escanear:</strong>
                </p>
                <div className="flex items-center gap-2 bg-muted p-2.5 rounded-lg border border-border font-mono text-xs text-foreground select-all justify-between">
                  <span className="truncate font-semibold">{totpData.secret}</span>
                  <button
                    type="button"
                    onClick={handleCopySecret}
                    className="p-1 text-primary hover:text-primary/80 transition-colors shrink-0"
                    title="Copiar clave secreta"
                  >
                    {copiedSecret ? <Check className="size-4 text-emerald-500" /> : <Copy className="size-4" />}
                  </button>
                </div>
              </div>

              {totpError && <ErrorAlert message={totpError} />}

              {/* Input OTP */}
              <div>
                <p className="font-semibold text-foreground mb-2">
                  <strong>2.</strong> Ingresá el código de 6 dígitos que muestra tu app:
                </p>
                <OtpInput
                  value={totpCode}
                  onChange={(val) => {
                    setTotpCode(val);
                    setTotpError("");
                  }}
                  hasError={Boolean(totpError)}
                  disabled={totpLoading}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-border">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setTotpModalOpen(false)}
                disabled={totpLoading}
              >
                Cancelar
              </Button>
              <Button
                size="sm"
                onClick={handleConfirmTotp}
                disabled={totpLoading || totpCode.length < 6}
                className="font-semibold"
              >
                {totpLoading ? (
                  <>
                    <Loader2 className="mr-1.5 size-3.5 animate-spin" />
                    Verificando...
                  </>
                ) : (
                  "Verificar y Activar"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 2: ACTIVAR OTP POR CORREO                           */}
      {/* ========================================================= */}
      {emailModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 border-b border-border pb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Mail className="size-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground">Confirmar OTP por Correo</h3>
                <p className="text-xs text-muted-foreground">Validación de recepción de código</p>
              </div>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              Enviamos un código de seguridad de 6 dígitos a tu casilla{" "}
              <strong>{user?.mail}</strong>. Ingresalo para confirmar que podés recibir correos correctamente:
            </p>

            {emailError && <ErrorAlert message={emailError} />}

            <div className="py-2">
              <OtpInput
                value={emailCode}
                onChange={(val) => {
                  setEmailCode(val);
                  setEmailError("");
                }}
                hasError={Boolean(emailError)}
                disabled={emailLoading}
              />
            </div>

            <div className="text-center">
              <button
                type="button"
                disabled={emailCooldown > 0 || emailResending || emailLoading}
                onClick={handleResendEmailOtp}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline disabled:opacity-50 disabled:no-underline transition-colors"
              >
                <RotateCw className={`size-3.5 ${emailResending ? "animate-spin" : ""}`} />
                {emailCooldown > 0
                  ? `Reenviar código en ${emailCooldown}s`
                  : "No recibí el código, reenviar"}
              </button>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-border">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEmailModalOpen(false)}
                disabled={emailLoading}
              >
                Cancelar
              </Button>
              <Button
                size="sm"
                onClick={handleConfirmEmailOtp}
                disabled={emailLoading || emailCode.length < 6}
                className="font-semibold"
              >
                {emailLoading ? (
                  <>
                    <Loader2 className="mr-1.5 size-3.5 animate-spin" />
                    Confirmando...
                  </>
                ) : (
                  "Confirmar y Activar"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 3: DESACTIVAR 2FA (PIDE CONTRASEÑA)                 */}
      {/* ========================================================= */}
      {disableModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 border-b border-border pb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
                <ShieldAlert className="size-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground">Desactivar 2FA</h3>
                <p className="text-xs text-muted-foreground">Confirmación de seguridad</p>
              </div>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              Para desactivar la autenticación en dos factores, por favor ingresá tu contraseña actual:
            </p>

            {disableError && <ErrorAlert message={disableError} />}

            <form onSubmit={handleDisable2FA} className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="disable-pass">Contraseña actual</Label>
                <Input
                  id="disable-pass"
                  type="password"
                  placeholder="••••••••••••"
                  value={disablePassword}
                  onChange={(e) => setDisablePassword(e.target.value)}
                  autoFocus
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setDisableModalOpen(false)}
                  disabled={disableLoading}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="destructive"
                  size="sm"
                  disabled={disableLoading || !disablePassword}
                  className="font-semibold"
                >
                  {disableLoading ? (
                    <>
                      <Loader2 className="mr-1.5 size-3.5 animate-spin" />
                      Desactivando...
                    </>
                  ) : (
                    "Confirmar Desactivación"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 4: GENERAR NUEVOS CÓDIGOS DE RECUPERACIÓN (CONTRASEÑA) */}
      {/* ========================================================= */}
      {generateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 border-b border-border pb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <KeyRound className="size-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground">Generar Códigos de Recuperación</h3>
                <p className="text-xs text-muted-foreground">Confirmación de seguridad requerida</p>
              </div>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              Al generar un nuevo lote de 8 códigos de emergencia, los códigos generados anteriormente quedarán invalidados de forma inmediata. Para continuar, confirmá tu contraseña actual:
            </p>

            {generateError && <ErrorAlert message={generateError} />}

            <form onSubmit={handleGenerateRecoveryCodes} className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="generate-pass">Contraseña actual</Label>
                <Input
                  id="generate-pass"
                  type="password"
                  placeholder="••••••••••••"
                  value={generatePassword}
                  onChange={(e) => setGeneratePassword(e.target.value)}
                  autoFocus
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setGenerateModalOpen(false)}
                  disabled={generateLoading}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={generateLoading || !generatePassword}
                  className="font-semibold"
                >
                  {generateLoading ? (
                    <>
                      <Loader2 className="mr-1.5 size-3.5 animate-spin" />
                      Generando...
                    </>
                  ) : (
                    "Generar 8 Códigos Nuevos"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 5: CÓDIGOS DE RECUPERACIÓN / CONFIANZA GENERADOS   */}
      {/* ========================================================= */}
      {newRecoveryCodesModalOpen && newRecoveryCodes.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-xl border border-border bg-card p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center gap-3 border-b border-border pb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <ShieldCheck className="size-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground">
                  Códigos de Recuperación y Confianza (2FA)
                </h3>
                <p className="text-xs text-muted-foreground">
                  Guardá estos códigos en un lugar seguro (formato .txt disponible)
                </p>
              </div>
            </div>

            <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3.5 text-xs text-amber-700 dark:text-amber-300 flex items-start gap-2.5">
              <AlertCircle className="size-4 shrink-0 mt-0.5" />
              <div>
                <strong className="font-semibold">¡Importante!</strong> Esta es la única vez que se mostrarán estos códigos. Si perdés el acceso a tu método de autenticación habitual y no disponés de estos códigos, no podrás ingresar a tu cuenta.
              </div>
            </div>

            {/* Grilla de códigos */}
            <div className="rounded-lg border border-border bg-muted/40 p-4">
              <div className="grid grid-cols-2 gap-2.5">
                {newRecoveryCodes.map((code, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between bg-card rounded-md border border-border px-3 py-2 font-mono text-sm font-bold text-foreground tracking-wider select-all"
                  >
                    <span className="text-[11px] text-muted-foreground font-sans font-normal mr-2">
                      #{idx + 1}
                    </span>
                    <span>{code}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Acciones de exportación */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCopyAllRecoveryCodes}
                className="flex-1 text-xs font-semibold"
              >
                {copiedCodes ? (
                  <>
                    <Check className="mr-1.5 size-3.5 text-emerald-500" />
                    Copiados al portapapeles
                  </>
                ) : (
                  <>
                    <Copy className="mr-1.5 size-3.5" />
                    Copiar todos los códigos
                  </>
                )}
              </Button>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleDownloadRecoveryCodes}
                className="flex-1 text-xs font-semibold"
              >
                <Download className="mr-1.5 size-3.5" />
                Descargar como .txt
              </Button>
            </div>

            <div className="flex justify-end pt-3 border-t border-border">
              <Button
                type="button"
                size="sm"
                onClick={() => {
                  setNewRecoveryCodesModalOpen(false);
                  setNewRecoveryCodes([]);
                }}
                className="font-semibold px-6"
              >
                Ya guardé mis códigos de forma segura
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
