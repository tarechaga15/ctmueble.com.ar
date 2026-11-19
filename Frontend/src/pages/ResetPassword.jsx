import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Eye, EyeOff, KeyRound, CheckCircle2, AlertCircle, ArrowLeft, Loader2 } from "lucide-react";
import { AuthService } from "../services/AuthService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import OtpInput from "../components/auth/OtpInput";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const tokenFromUrl = searchParams.get("token") || "";
  const mailFromUrl = searchParams.get("mail") || "";

  const [mail, setMail] = useState(mailFromUrl);
  const [otpCode, setOtpCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [validatingToken, setValidatingToken] = useState(Boolean(tokenFromUrl));
  const [tokenValid, setTokenValid] = useState(Boolean(tokenFromUrl));
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!tokenFromUrl) return;
    let cancelled = false;
    setValidatingToken(true);
    AuthService.verifyResetCode({ token: tokenFromUrl })
      .then((res) => {
        if (cancelled) return;
        setTokenValid(true);
        if (res?.mail && !mailFromUrl) {
          setMail(res.mail);
        }
      })
      .catch((err) => {
        if (cancelled) return;
        setTokenValid(false);
        setError(
          err?.response?.data?.message ||
            "El enlace de restablecimiento es inválido o ha expirado."
        );
      })
      .finally(() => {
        if (!cancelled) setValidatingToken(false);
      });
    return () => {
      cancelled = true;
    };
  }, [tokenFromUrl, mailFromUrl]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!tokenFromUrl && (!mail.trim() || otpCode.trim().length !== 6)) {
      setError("Ingresá tu correo electrónico y el código de 6 dígitos.");
      return;
    }

    if (newPassword.length < 12 || newPassword.length > 64) {
      setError("La contraseña debe tener entre 12 y 64 caracteres.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);
    try {
      await AuthService.resetPassword({
        mail: tokenFromUrl ? undefined : mail.trim(),
        otpCode: tokenFromUrl ? undefined : otpCode.trim(),
        token: tokenFromUrl || undefined,
        newPassword,
      });
      setSuccess(true);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "No se pudo restablecer la contraseña. Verificá los datos e intentá nuevamente."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-lg space-y-6">
        <div className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <KeyRound className="size-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Restablecer contraseña</h1>
            <p className="text-xs text-muted-foreground">CTM · Oficina Virtual</p>
          </div>
        </div>

        {validatingToken ? (
          <div className="flex flex-col items-center justify-center py-8 gap-3 text-muted-foreground">
            <Loader2 className="size-6 animate-spin text-primary" />
            <p className="text-sm">Validando enlace de recuperación...</p>
          </div>
        ) : success ? (
          <div className="space-y-4">
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 flex items-start gap-3 text-emerald-700 dark:text-emerald-300">
              <CheckCircle2 className="size-5 shrink-0 mt-0.5" />
              <div className="text-sm space-y-1">
                <p className="font-semibold">¡Contraseña actualizada!</p>
                <p>Ya podés iniciar sesión con tu nueva contraseña.</p>
              </div>
            </div>
            <Button type="button" className="w-full h-11" onClick={() => navigate("/login")}>
              Ir a iniciar sesión
            </Button>
          </div>
        ) : tokenFromUrl && !tokenValid ? (
          <div className="space-y-4">
            <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 flex items-start gap-3 text-destructive">
              <AlertCircle className="size-5 shrink-0 mt-0.5" />
              <p className="text-sm">{error || "El enlace es inválido o ha expirado."}</p>
            </div>
            <Button
              type="button"
              variant="outline"
              className="w-full h-11"
              onClick={() => navigate("/login")}
            >
              <ArrowLeft className="size-4 mr-2" />
              Volver al inicio de sesión
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 flex items-start gap-2.5 text-xs text-destructive">
                <AlertCircle className="size-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {!tokenFromUrl && (
              <>
                <div className="space-y-1.5">
                  <Label htmlFor="reset-mail">Correo electrónico</Label>
                  <Input
                    id="reset-mail"
                    type="email"
                    placeholder="nombre@empresa.com"
                    value={mail}
                    onChange={(e) => setMail(e.target.value)}
                    required
                    className="h-11"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Código de verificación (6 dígitos)</Label>
                  <OtpInput value={otpCode} onChange={setOtpCode} length={6} />
                </div>
              </>
            )}

            {tokenFromUrl && mail && (
              <p className="text-xs text-muted-foreground">
                Restableciendo contraseña para <strong className="text-foreground">{mail}</strong>
              </p>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="new-password">Nueva contraseña (mín. 12 caracteres)</Label>
              <div className="relative">
                <Input
                  id="new-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={12}
                  maxLength={64}
                  className="h-11 pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-1 top-1/2 flex min-h-[38px] min-w-[38px] -translate-y-1/2 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="confirm-password">Confirmar nueva contraseña</Label>
              <Input
                id="confirm-password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={12}
                maxLength={64}
                className="h-11"
              />
            </div>

            <Button type="submit" className="w-full h-11" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="size-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : (
                "Guardar nueva contraseña"
              )}
            </Button>

            <button
              type="button"
              onClick={() => navigate("/login")}
              className="w-full text-center text-xs text-muted-foreground hover:text-foreground pt-1"
            >
              Volver al inicio de sesión
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
