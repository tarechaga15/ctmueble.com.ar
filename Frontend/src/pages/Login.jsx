import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Eye,
  EyeOff,
  Loader2,
  ShieldCheck,
  CheckCircle2,
  HelpCircle,
  X,
  Mail,
  Smartphone,
  ArrowLeft,
  RotateCw,
  KeyRound,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import ErrorAlert from "../components/ErrorAlert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import RegisterWizard from "../components/auth/RegisterWizard";
import OtpInput from "../components/auth/OtpInput";

const LOGO = "/images/logo.png";
const LOGO_FALLBACK = "https://ctmueble.com.ar/wp-content/uploads/2025/09/cropped-logo-ctm-1-1.png";

export default function Login({ initialMode }) {
  const location = useLocation();
  const [viewMode, setViewMode] = useState(
    initialMode === "register" || location.pathname === "/register"
      ? "register"
      : "login"
  );

  const [mail, setMail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(() => {
    if (typeof localStorage !== "undefined") {
      const saved = localStorage.getItem("ctm_remember_me");
      if (saved !== null) return saved === "true";
    }
    return true;
  });
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [forgotMail, setForgotMail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);
  const [forgotError, setForgotError] = useState("");
  const [logoSrc, setLogoSrc] = useState(LOGO);

  // Estado para desafío de Autenticación en Dos Pasos (2FA)
  const [twoFactorData, setTwoFactorData] = useState(null); // { method, tempToken, emailMasked }
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [twoFactorError, setTwoFactorError] = useState("");
  const [resendingCode, setResendingCode] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [trustDevice, setTrustDevice] = useState(true);
  const [isRecoveryMode, setIsRecoveryMode] = useState(false);
  const [recoveryCode, setRecoveryCode] = useState("");

  const navigate = useNavigate();
  const { login, verify2FA, resend2FA } = useAuth();

  const clearFieldError = (name) => {
    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const errors = {};

    if (!mail.trim()) {
      errors.mail = "Hay que completarlo";
    }
    if (!password) {
      errors.password = "Hay que completarlo";
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setLoading(true);
    try {
      const res = await login(mail, password, { rememberMe });
      if (res && res.requires2FA) {
        setTwoFactorData({ ...res, rememberMe });
        setTwoFactorCode("");
        setTwoFactorError("");
        setIsRecoveryMode(false);
        setRecoveryCode("");
        setTrustDevice(true);
        setLoading(false);
        return;
      }
      navigate("/dashboard");
    } catch {
      setError("Credenciales inválidas. Por favor, verificá tu correo y contraseña.");
    } finally {
      setLoading(false);
    }
  };

  const handle2FASubmit = async (e) => {
    e?.preventDefault?.();

    const effectiveRememberMe = twoFactorData?.rememberMe ?? rememberMe;

    if (isRecoveryMode) {
      const clean = recoveryCode.trim();
      if (!clean || clean.length < 8) {
        setTwoFactorError("Ingresá un código de recuperación válido (ej. ABCD-1234)");
        return;
      }

      setLoading(true);
      setTwoFactorError("");
      try {
        await verify2FA({
          tempToken: twoFactorData.tempToken,
          code: clean,
          isRecoveryCode: true,
          trustDevice,
          rememberMe: effectiveRememberMe,
        });
        navigate("/dashboard");
      } catch (err) {
        const msg =
          err.response?.data?.message || err.message || "Código de recuperación inválido o ya utilizado";
        setTwoFactorError(msg);
      } finally {
        setLoading(false);
      }
      return;
    }

    if (!twoFactorCode || twoFactorCode.length < 6) {
      setTwoFactorError("Ingresá el código de 6 dígitos completo");
      return;
    }

    setLoading(true);
    setTwoFactorError("");
    try {
      await verify2FA({
        tempToken: twoFactorData.tempToken,
        code: twoFactorCode,
        isRecoveryCode: false,
        trustDevice,
        rememberMe: effectiveRememberMe,
      });
      navigate("/dashboard");
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Código de seguridad incorrecto";
      setTwoFactorError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleResend2FA = async () => {
    if (resendCooldown > 0 || resendingCode) return;
    setResendingCode(true);
    setTwoFactorError("");
    try {
      await resend2FA({ tempToken: twoFactorData.tempToken });
      setResendCooldown(60);
      const interval = setInterval(() => {
        setResendCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      setTwoFactorError(err.response?.data?.message || "Error al reenviar el código");
    } finally {
      setResendingCode(false);
    }
  };

  return (
    <div className="fixed inset-0 z-20 grid h-screen w-screen overflow-hidden bg-background lg:grid-cols-2">
      {/* Columna Hero / Visual (Solo escritorio, sin scroll) */}
      <aside className="relative hidden h-full overflow-hidden lg:flex lg:flex-col lg:justify-between bg-gradient-to-br from-[#1b080a] via-[#2d0e12] to-[#451419] p-10 xl:p-12 text-white select-none">
        {/* Imagen de fondo */}
        <div
          className="pointer-events-none absolute inset-0 bg-cover bg-center brightness-[0.72] contrast-[1.05]"
          style={{ backgroundImage: "url('/images/hero.png')" }}
        />

        {/* Tinte oscuro ambiental */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-black/85 via-black/50 to-black/30" />

        {/* Gráficos decorativos de fondo con patrón */}
        <div className="pointer-events-none absolute inset-0 opacity-20">
          <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern
                id="grid-pattern"
                width="40"
                height="40"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 40 0 L 0 0 0 40"
                  fill="none"
                  stroke="rgba(255, 255, 255, 0.18)"
                  strokeWidth="1"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid-pattern)" />
          </svg>
        </div>

        {/* Resplandor ambiental de marca */}
        <div className="pointer-events-none absolute -top-24 -left-24 size-96 rounded-full bg-[var(--cl-verde)]/25 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -right-24 size-96 rounded-full bg-[var(--cl-verde)]/20 blur-3xl" />

        {/* Gradientes oscuros superior e inferior */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-black/75 to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-72 bg-gradient-to-t from-black/90 via-black/60 to-transparent" />

        {/* Contenido superior: Logo CTM Claro */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="flex items-center gap-3 rounded-xl bg-white/10 px-4 py-2.5 backdrop-blur-md border border-white/15 shadow-sm">
            <img
              src={logoSrc}
              onError={() => setLogoSrc(LOGO_FALLBACK)}
              alt="Centro Tecnológico del Mueble"
              className="h-9 w-auto object-contain drop-shadow"
            />
            <div className="border-l border-white/20 pl-3">
              <p className="text-xs font-semibold tracking-wider uppercase text-white/95">
                Oficina Virtual
              </p>
              <p className="text-[10px] text-white/70">Gestión de Ensayos & Calidad</p>
            </div>
          </div>
        </div>

        {/* Tarjeta flotante intermedia decorativa */}
        <div className="relative z-10 my-auto max-w-sm rounded-2xl border border-white/15 bg-white/10 p-6 backdrop-blur-md shadow-2xl">
          <div className="flex items-center justify-between pb-4 border-b border-white/10 text-xs font-medium text-emerald-200">
            <span className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
              Sistema activo
            </span>
            <span className="rounded bg-white/15 px-2.5 py-0.5 text-white/90 text-[11px] font-mono border border-white/10">
              v2026
            </span>
          </div>
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-white/80">Gestión de ensayos</span>
              <span className="font-semibold text-white">En tiempo real</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-white/80">Trazabilidad de muestras</span>
              <span className="font-semibold text-emerald-300">Sincronizada</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-white/80">Informes y certificados</span>
              <span className="font-semibold text-white">Digitales</span>
            </div>
          </div>
        </div>

        {/* Contenido inferior: Titular inspirador y características */}
        <div className="relative z-10 max-w-md">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/40 px-3.5 py-1 text-xs font-medium text-white/90 backdrop-blur-md">
            <ShieldCheck className="size-3.5 text-emerald-400" />
            Centro Tecnológico del Mueble
          </div>
          <h2 className="text-2xl font-semibold leading-snug text-white lg:text-3xl">
            Innovación, desarrollo y ensayos para el sector del mueble
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-white/85">
            Plataforma centralizada para la solicitud de ensayos físicos y mecánicos, seguimiento de probetas y emisión de informes normalizados.
          </p>

          <div className="mt-6 flex flex-wrap gap-2 text-xs text-white/85">
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/10 px-2.5 py-1 backdrop-blur-sm">
              <CheckCircle2 className="size-3 text-emerald-400" />
              Normas IRAM y regionales
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/10 px-2.5 py-1 backdrop-blur-sm">
              <CheckCircle2 className="size-3 text-emerald-400" />
              Trazabilidad de muestras
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/10 px-2.5 py-1 backdrop-blur-sm">
              <CheckCircle2 className="size-3 text-emerald-400" />
              Informes certificados
            </span>
          </div>
        </div>
      </aside>

      {/* Columna Derecha: Sin scrolling global, scroll interno en el formulario */}
      <main className="relative flex h-full w-full flex-col overflow-hidden bg-background">
        {viewMode === "register" ? (
          <RegisterWizard onSwitchToLogin={() => setViewMode("login")} />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-between p-6 sm:p-10 lg:p-12 overflow-hidden">
            <div className="flex h-full w-full max-w-md flex-col overflow-hidden justify-between">
              {twoFactorData ? (
                <div className="flex flex-col h-full justify-between">
                  <div className="space-y-4">
                    <button
                      type="button"
                      onClick={() => {
                        setTwoFactorData(null);
                        setTwoFactorCode("");
                        setTwoFactorError("");
                        setIsRecoveryMode(false);
                        setRecoveryCode("");
                      }}
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <ArrowLeft className="size-3.5" />
                      Volver a ingresar credenciales
                    </button>

                    {isRecoveryMode ? (
                      <>
                        <div className="flex items-center gap-3 pt-2">
                          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 shrink-0">
                            <KeyRound className="size-6" />
                          </div>
                          <div>
                            <h2 className="text-xl font-bold text-foreground">
                              Código de Recuperación
                            </h2>
                            <p className="text-xs text-muted-foreground">
                              Acceso de emergencia sin tu método habitual
                            </p>
                          </div>
                        </div>

                        <p className="text-sm text-muted-foreground leading-relaxed">
                          Ingresá uno de tus códigos de recuperación de 8 caracteres (formato{" "}
                          <span className="font-mono font-medium text-foreground">XXXX-XXXX</span>). Recordá que cada código sólo puede ser utilizado una única vez.
                        </p>

                        {twoFactorError && <ErrorAlert message={twoFactorError} />}

                        <form id="two-factor-form" onSubmit={handle2FASubmit} className="py-2 space-y-4">
                          <div className="space-y-1.5">
                            <Label htmlFor="recovery-code" className="text-xs font-medium text-muted-foreground">
                              Código de Emergencia
                            </Label>
                            <Input
                              id="recovery-code"
                              type="text"
                              maxLength={9}
                              placeholder="ABCD-1234"
                              value={recoveryCode}
                              onChange={(e) => {
                                const raw = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "");
                                const formatted =
                                  raw.length > 4 ? `${raw.slice(0, 4)}-${raw.slice(4, 8)}` : raw;
                                setRecoveryCode(formatted);
                                setTwoFactorError("");
                              }}
                              className="h-12 text-center font-mono text-lg font-semibold tracking-widest uppercase border-border/80 focus:border-primary"
                              disabled={loading}
                              autoFocus
                            />
                          </div>

                          <div className="pt-1">
                            <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-muted-foreground hover:text-foreground transition-colors">
                              <input
                                type="checkbox"
                                checked={trustDevice}
                                onChange={(e) => setTrustDevice(e.target.checked)}
                                className="size-4 rounded border-border text-primary focus:ring-primary accent-primary"
                              />
                              <span>Confiar en este dispositivo por 7 días</span>
                            </label>
                          </div>

                          <div className="text-center pt-2">
                            <button
                              type="button"
                              onClick={() => {
                                setIsRecoveryMode(false);
                                setTwoFactorError("");
                              }}
                              className="text-xs font-medium text-primary hover:underline transition-colors"
                            >
                              Volver a ingresar código de autenticación (6 dígitos)
                            </button>
                          </div>
                        </form>
                      </>
                    ) : (
                      <>
                        <div className="flex items-center gap-3 pt-2">
                          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20 shrink-0">
                            {twoFactorData.method === "EMAIL" ? (
                              <Mail className="size-6 text-primary" />
                            ) : (
                              <Smartphone className="size-6 text-primary" />
                            )}
                          </div>
                          <div>
                            <h2 className="text-xl font-bold text-foreground">
                              Doble Factor de Seguridad
                            </h2>
                            <p className="text-xs text-muted-foreground">
                              {twoFactorData.method === "EMAIL"
                                ? "Código enviado por correo electrónico"
                                : "Código de Google Authenticator"}
                            </p>
                          </div>
                        </div>

                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {twoFactorData.method === "EMAIL" ? (
                            <>
                              Ingresá el código de 6 dígitos que acabamos de enviar a{" "}
                              <span className="font-semibold text-foreground">
                                {twoFactorData.emailMasked}
                              </span>
                              :
                            </>
                          ) : (
                            <>
                              Abrí la aplicación <strong>Google Authenticator</strong> (o Authy) en tu teléfono e ingresá el código de 6 dígitos:
                            </>
                          )}
                        </p>

                        {twoFactorError && <ErrorAlert message={twoFactorError} />}

                        <form id="two-factor-form" onSubmit={handle2FASubmit} className="py-2 space-y-4">
                          <div>
                            <OtpInput
                              value={twoFactorCode}
                              onChange={(val) => {
                                setTwoFactorCode(val);
                                setTwoFactorError("");
                              }}
                              hasError={Boolean(twoFactorError)}
                              disabled={loading}
                            />
                          </div>

                          <div className="pt-1">
                            <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-muted-foreground hover:text-foreground transition-colors">
                              <input
                                type="checkbox"
                                checked={trustDevice}
                                onChange={(e) => setTrustDevice(e.target.checked)}
                                className="size-4 rounded border-border text-primary focus:ring-primary accent-primary"
                              />
                              <span>Confiar en este dispositivo por 7 días</span>
                            </label>
                          </div>

                          {twoFactorData.method === "EMAIL" && (
                            <div className="text-center pt-1">
                              <button
                                type="button"
                                disabled={resendCooldown > 0 || resendingCode || loading}
                                onClick={handleResend2FA}
                                className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline disabled:opacity-50 disabled:no-underline transition-colors"
                              >
                                <RotateCw className={`size-3.5 ${resendingCode ? "animate-spin" : ""}`} />
                                {resendCooldown > 0
                                  ? `Reenviar código en ${resendCooldown}s`
                                  : "Reenviar código a mi correo"}
                              </button>
                            </div>
                          )}

                          <div className="text-center pt-1">
                            <button
                              type="button"
                              onClick={() => {
                                setIsRecoveryMode(true);
                                setTwoFactorError("");
                              }}
                              className="text-xs font-medium text-muted-foreground hover:text-foreground hover:underline transition-colors"
                            >
                              ¿Perdiste tu método 2FA? Usar un código de recuperación
                            </button>
                          </div>
                        </form>
                      </>
                    )}
                  </div>

                  <div className="shrink-0 pt-4 space-y-3 border-t border-border/40">
                    <Button
                      type="submit"
                      form="two-factor-form"
                      size="lg"
                      className="w-full h-11 text-base font-medium rounded-lg shadow-sm hover:shadow transition-all bg-primary text-primary-foreground hover:bg-primary/90"
                      disabled={
                        loading ||
                        (isRecoveryMode ? recoveryCode.trim().length < 8 : twoFactorCode.length < 6)
                      }
                    >
                      {loading ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
                      {isRecoveryMode ? "Acceder con Código de Recuperación" : "Verificar e Iniciar Sesión"}
                    </Button>
                    <p className="text-center text-xs text-muted-foreground">
                      Protegido mediante cifrado de extremo a extremo · CTM
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  {/* Contenido superior de Login */}
                  <div className="shrink-0 pb-4 space-y-4">
                    {/* Logo móvil */}
                    <div className="flex flex-col items-center justify-center gap-2 lg:hidden">
                      <img
                        src={logoSrc}
                        onError={() => setLogoSrc(LOGO_FALLBACK)}
                        alt="Centro Tecnológico del Mueble"
                        className="h-12 w-auto object-contain"
                      />
                      <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                        Oficina Virtual
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      <h1 className="text-2xl font-bold leading-snug text-foreground lg:text-3xl">
                        Entrá a la Oficina Virtual
                      </h1>
                      <p className="text-sm text-muted-foreground">
                        Ingresá tus credenciales para acceder a la plataforma.
                      </p>
                    </div>

                    {error && <ErrorAlert message={error} />}
                  </div>

                  {/* Formulario con scrollbar suave si la pantalla es reducida */}
                  <div className="flex-1 min-h-0 overflow-y-auto scrollbar-soft py-2 pr-1">
                    <form id="login-form" onSubmit={handleSubmit} className="space-y-4">
                      {/* Correo */}
                      <div className="space-y-1">
                        <Label htmlFor="login-mail" className={fieldErrors.mail ? "text-destructive" : ""}>
                          Correo electrónico
                        </Label>
                        <Input
                          id="login-mail"
                          type="email"
                          autoComplete="email"
                          autoFocus
                          placeholder="ejemplo@empresa.com"
                          value={mail}
                          onChange={(e) => {
                            setMail(e.target.value);
                            clearFieldError("mail");
                          }}
                          className={`h-11 rounded-lg px-3.5 bg-card transition-colors ${
                            fieldErrors.mail
                              ? "border-destructive focus-visible:ring-destructive/30 bg-destructive/5"
                              : "border-input"
                          }`}
                        />
                        {fieldErrors.mail && (
                          <p className="text-[11px] font-medium text-destructive">
                            {fieldErrors.mail}
                          </p>
                        )}
                      </div>

                      {/* Contraseña */}
                      <div className="space-y-1">
                        <Label htmlFor="login-password" className={fieldErrors.password ? "text-destructive" : ""}>
                          Contraseña
                        </Label>
                        <div className="relative">
                          <Input
                            id="login-password"
                            type={showPassword ? "text" : "password"}
                            autoComplete="current-password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => {
                              setPassword(e.target.value);
                              clearFieldError("password");
                            }}
                            className={`h-11 rounded-lg px-3.5 pr-11 bg-card transition-colors ${
                              fieldErrors.password
                                ? "border-destructive focus-visible:ring-destructive/30 bg-destructive/5"
                                : "border-input"
                            }`}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword((prev) => !prev)}
                            className="absolute right-1 top-1/2 flex min-h-[38px] min-w-[38px] -translate-y-1/2 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground"
                          >
                            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                          </button>
                        </div>
                        {fieldErrors.password && (
                          <p className="text-[11px] font-medium text-destructive">
                            {fieldErrors.password}
                          </p>
                        )}
                      </div>

                      {/* Recordarme y Olvido */}
                      <div className="flex items-center justify-between gap-3 pt-1">
                        <label className="flex items-center gap-2.5 text-sm text-muted-foreground cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                            className="size-4 rounded border-input accent-[var(--cl-verde)] cursor-pointer"
                          />
                          <span>No cerrar sesión</span>
                        </label>
                        <button
                          type="button"
                          onClick={() => setForgotModalOpen(true)}
                          className="text-sm font-medium text-primary hover:underline hover:text-primary/90 transition-colors"
                        >
                          ¿Olvidaste tu contraseña?
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* Acciones inferiores Sticky / Fijas */}
                  <div className="shrink-0 pt-4 space-y-4 border-t border-border/40">
                    <Button
                      type="submit"
                      form="login-form"
                      size="lg"
                      className="w-full h-11 text-base font-medium rounded-lg shadow-sm hover:shadow transition-all bg-primary text-primary-foreground hover:bg-primary/90"
                      disabled={loading}
                    >
                      {loading ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
                      Entrar
                    </Button>

                    <div className="relative flex items-center justify-center">
                      <div className="w-full border-t border-border/80" />
                      <span className="absolute bg-background px-3 text-xs uppercase tracking-wider text-muted-foreground font-medium">
                        O
                      </span>
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setViewMode("register")}
                      className="w-full h-11 text-sm font-medium rounded-lg border-input hover:bg-muted/60 transition-all text-foreground"
                    >
                      Registrar nueva cuenta
                    </Button>

                    <div className="text-center text-xs text-muted-foreground">
                      <span>¿Ya solicitaste ensayos y no tenés usuario? </span>
                      <button
                        type="button"
                        onClick={() => setViewMode("register")}
                        className="font-semibold text-primary hover:underline hover:text-primary/90 transition-colors"
                      >
                        Registrate acá
                      </button>
                    </div>

                    <div className="pt-2 text-center text-xs text-muted-foreground">
                      <p>© {new Date().getFullYear()} CTM · Centro Tecnológico del Mueble</p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Modal / Diálogo para Olvido de Contraseña */}
      {forgotModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in"
          onClick={() => setForgotModalOpen(false)}
        >
          <div
            className="relative w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-xl space-y-4 text-card-foreground animate-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <HelpCircle className="size-5" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">
                    Recuperación de contraseña
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Asistencia de acceso
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setForgotModalOpen(false)}
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                <X className="size-4" />
              </button>
            </div>

            <p className="text-sm leading-relaxed text-muted-foreground">
              Ingresá tu correo electrónico registrado y te enviaremos un código de verificación y un enlace para restablecer tu contraseña.
            </p>

            {forgotSent ? (
              <div className="space-y-4">
                <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3.5 text-xs text-emerald-700 dark:text-emerald-300 space-y-1">
                  <p className="font-semibold">Solicitud enviada</p>
                  <p>
                    Si el correo <strong>{forgotMail}</strong> está registrado, recibirás las instrucciones en tu bandeja de entrada.
                  </p>
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setForgotModalOpen(false);
                      setForgotSent(false);
                      setForgotError("");
                      navigate(`/reset-password?mail=${encodeURIComponent(forgotMail.trim())}`);
                    }}
                  >
                    Tengo el código
                  </Button>
                  <Button
                    type="button"
                    onClick={() => {
                      setForgotModalOpen(false);
                      setForgotSent(false);
                      setForgotError("");
                    }}
                  >
                    Entendido
                  </Button>
                </div>
              </div>
            ) : (
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  setForgotError("");
                  if (!forgotMail.trim()) {
                    setForgotError("Ingresá tu correo electrónico.");
                    return;
                  }
                  setForgotLoading(true);
                  try {
                    await AuthService.forgotPassword(forgotMail.trim());
                    setForgotSent(true);
                  } catch (err) {
                    setForgotError(
                      err?.response?.data?.message ||
                        "No se pudo procesar la solicitud. Intentá nuevamente."
                    );
                  } finally {
                    setForgotLoading(false);
                  }
                }}
                className="space-y-4"
              >
                {forgotError && (
                  <p className="text-xs font-medium text-destructive">{forgotError}</p>
                )}
                <div className="space-y-1.5">
                  <Label htmlFor="forgot-mail">Correo electrónico</Label>
                  <Input
                    id="forgot-mail"
                    type="email"
                    placeholder="nombre@empresa.com"
                    value={forgotMail}
                    onChange={(e) => setForgotMail(e.target.value)}
                    required
                    className="h-11"
                  />
                </div>
                <div className="pt-2 flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setForgotModalOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={forgotLoading}>
                    {forgotLoading ? "Enviando..." : "Enviar instrucciones"}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
