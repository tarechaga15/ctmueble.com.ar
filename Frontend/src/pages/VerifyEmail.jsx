import { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { CheckCircle2, AlertCircle, Loader2, Mail, ArrowRight, ShieldCheck, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiKeysService } from "../services/apiKeysService";
import OtpInput from "../components/auth/OtpInput";

const LOGO = "/images/logo.png";
const LOGO_FALLBACK = "https://ctmueble.com.ar/wp-content/uploads/2025/09/cropped-logo-ctm-1-1.png";

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");
  const mailParam = searchParams.get("mail") || "";
  const isInvitation = searchParams.get("invitation") === "true";

  const [loading, setLoading] = useState(Boolean(token && !isInvitation));
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [manualVerifying, setManualVerifying] = useState(false);
  const [logoSrc, setLogoSrc] = useState(LOGO);

  useEffect(() => {
    if (token && !isInvitation) {
      apiKeysService
        .verifyLink({ token, mail: mailParam })
        .then(() => {
          setVerified(true);
        })
        .catch((err) => {
          setError(
            err.response?.data?.message ||
              "El enlace de verificación es inválido o ha expirado."
          );
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [token, mailParam, isInvitation]);

  const validateInvitationPassword = () => {
    if (!isInvitation) return true;
    if (newPassword.length < 12 || newPassword.length > 64) {
      setError("La contraseña debe tener entre 12 y 64 caracteres.");
      return false;
    }
    if (newPassword !== confirmPassword) {
      setError("Las contraseñas ingresadas no coinciden.");
      return false;
    }
    return true;
  };

  const handleInvitationTokenActivate = async (e) => {
    e?.preventDefault();
    if (!validateInvitationPassword()) return;

    setManualVerifying(true);
    setError("");
    try {
      await apiKeysService.verifyLink({
        token,
        mail: mailParam,
        newPassword,
      });
      setVerified(true);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "No se pudo activar la invitación. Verificá que el enlace no haya expirado."
      );
    } finally {
      setManualVerifying(false);
    }
  };

  const handleManualOtpVerify = async (e) => {
    e?.preventDefault();
    if (otpCode.length !== 6) {
      setError("Ingresá el código completo de 6 dígitos.");
      return;
    }
    if (!validateInvitationPassword()) return;

    setManualVerifying(true);
    setError("");
    try {
      await apiKeysService.verifyOtp({
        mail: mailParam,
        otpCode,
        ...(isInvitation ? { newPassword } : {}),
      });
      setVerified(true);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Código incorrecto o expirado. Por favor, verificá e intentá nuevamente."
      );
    } finally {
      setManualVerifying(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-[var(--cl-crema-claro)] p-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-xl space-y-6 text-center animate-in fade-in">
        {/* Logo */}
        <div className="flex flex-col items-center gap-2">
          <img
            src={logoSrc}
            onError={() => setLogoSrc(LOGO_FALLBACK)}
            alt="Centro Tecnológico del Mueble"
            className="h-12 w-auto object-contain"
          />
          <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
            Oficina Virtual · Validación de Cuenta
          </span>
        </div>

        {/* Loading state from link */}
        {loading ? (
          <div className="py-8 space-y-3">
            <Loader2 className="size-10 animate-spin text-primary mx-auto" />
            <h2 className="text-lg font-semibold text-foreground">
              Verificando tu cuenta...
            </h2>
            <p className="text-xs text-muted-foreground">
              Validando el token criptográfico con el servidor.
            </p>
          </div>
        ) : verified ? (
          /* Success state */
          <div className="py-4 space-y-4">
            <div className="flex size-14 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 mx-auto">
              <CheckCircle2 className="size-8" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">
                {isInvitation ? "¡Cuenta de laboratorio activada!" : "¡Correo verificado con éxito!"}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {isInvitation
                  ? "Tu cuenta interna ha sido activada correctamente dentro del modo laboratorio con tu rol asignado. Ya podés acceder a la plataforma."
                  : "Tu cuenta ha sido activada correctamente. Ya podés acceder a la Oficina Virtual para solicitar ensayos y gestionar tus muestras."}
              </p>
            </div>

            <div className="pt-2">
              <Button
                type="button"
                size="lg"
                onClick={() => navigate("/dashboard")}
                className="w-full h-11 text-base font-semibold shadow-sm"
              >
                Continuar a la plataforma
                <ArrowRight className="ml-2 size-4" />
              </Button>
            </div>
          </div>
        ) : isInvitation && token ? (
          /* Invitation password setup + confirmation via POST */
          <form onSubmit={handleInvitationTokenActivate} className="space-y-4 text-left">
            {error && (
              <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive flex items-start gap-2">
                <AlertCircle className="size-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div className="text-center space-y-1">
              <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary mx-auto mb-2">
                <Lock className="size-6" />
              </div>
              <h2 className="text-lg font-bold text-foreground">
                Activá tu cuenta de laboratorio
              </h2>
              <p className="text-xs text-muted-foreground">
                Creá tu contraseña personal (entre 12 y 64 caracteres) para completar la activación de{" "}
                <strong>{mailParam || "tu cuenta"}</strong>.
              </p>
            </div>

            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="invite-password">Nueva contraseña *</Label>
                <Input
                  id="invite-password"
                  type="password"
                  minLength={12}
                  maxLength={64}
                  placeholder="Mínimo 12 caracteres"
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    setError("");
                  }}
                  disabled={manualVerifying}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="invite-confirm-password">Confirmar contraseña *</Label>
                <Input
                  id="invite-confirm-password"
                  type="password"
                  minLength={12}
                  maxLength={64}
                  placeholder="Repetí tu contraseña"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setError("");
                  }}
                  disabled={manualVerifying}
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={manualVerifying || newPassword.length < 12}
              className="w-full h-11 text-sm font-semibold"
            >
              {manualVerifying ? <Loader2 className="mr-2 size-4 animate-spin" /> : <ShieldCheck className="mr-2 size-4" />}
              Establecer contraseña y activar cuenta
            </Button>

            <div className="pt-2 text-center text-xs text-muted-foreground">
              <Link to="/login" className="text-primary hover:underline">
                Volver al inicio de sesión
              </Link>
            </div>
          </form>
        ) : (
          /* Error or manual OTP entry */
          <div className="space-y-4 text-left">
            {error && (
              <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive flex items-start gap-2">
                <AlertCircle className="size-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div className="text-center space-y-1">
              <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary mx-auto mb-2">
                <Mail className="size-6" />
              </div>
              <h2 className="text-lg font-bold text-foreground">
                {isInvitation ? "Activá tu cuenta con OTP" : "Ingresá tu código OTP"}
              </h2>
              <p className="text-xs text-muted-foreground">
                {isInvitation
                  ? "Ingresá el código de 6 dígitos que recibiste por correo y elegí tu nueva contraseña."
                  : "Si el enlace expiró, podés ingresar los 6 dígitos que recibiste por correo."}
              </p>
            </div>

            <div className="py-2">
              <OtpInput
                length={6}
                value={otpCode}
                onChange={(val) => {
                  setOtpCode(val);
                  setError("");
                }}
                hasError={Boolean(error)}
                disabled={manualVerifying}
              />
            </div>

            {isInvitation && (
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="invite-otp-password">Nueva contraseña *</Label>
                  <Input
                    id="invite-otp-password"
                    type="password"
                    minLength={12}
                    maxLength={64}
                    placeholder="Mínimo 12 caracteres"
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      setError("");
                    }}
                    disabled={manualVerifying}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="invite-otp-confirm">Confirmar contraseña *</Label>
                  <Input
                    id="invite-otp-confirm"
                    type="password"
                    minLength={12}
                    maxLength={64}
                    placeholder="Repetí tu contraseña"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      setError("");
                    }}
                    disabled={manualVerifying}
                  />
                </div>
              </div>
            )}

            <Button
              type="button"
              disabled={otpCode.length !== 6 || manualVerifying || (isInvitation && newPassword.length < 12)}
              onClick={handleManualOtpVerify}
              className="w-full h-11 text-sm font-semibold"
            >
              {manualVerifying ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
              {isInvitation ? "Establecer contraseña y activar cuenta" : "Validar código OTP"}
            </Button>

            <div className="pt-2 text-center text-xs text-muted-foreground">
              <Link to="/login" className="text-primary hover:underline">
                Volver al inicio de sesión
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
