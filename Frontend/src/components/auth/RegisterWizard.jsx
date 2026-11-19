import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Building2,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  ShieldCheck,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  Receipt,
  MapPin,
  UserCheck,
  RefreshCw,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import ErrorAlert from "../ErrorAlert";
import { useAuth } from "../../context/AuthContext";
import { useDataCache } from "../../context/DataCacheContext";
import { useToast } from "../../context/ToastContext";
import { clientsService } from "../../services/clientsService";
import { apiKeysService } from "../../services/apiKeysService";
import OtpInput from "./OtpInput";
import { mapProvinceCodeToDistrictId } from "../../lib/districtUtils";
import {
  formatCuit,
  isLegalEntityCuit,
  extractDniFromCuit,
} from "../steps/client-creation/BussinessSearch";

const FALLBACK_PROVINCES = [
  { id: "AR-C", name: "Ciudad Autónoma de Buenos Aires" },
  { id: "AR-B", name: "Provincia de Buenos Aires" },
  { id: "AR-K", name: "Catamarca" },
  { id: "AR-H", name: "Chaco" },
  { id: "AR-U", name: "Chubut" },
  { id: "AR-X", name: "Córdoba" },
  { id: "AR-W", name: "Corrientes" },
  { id: "AR-E", name: "Entre Ríos" },
  { id: "AR-P", name: "Formosa" },
  { id: "AR-Y", name: "Jujuy" },
  { id: "AR-L", name: "La Pampa" },
  { id: "AR-F", name: "La Rioja" },
  { id: "AR-M", name: "Mendoza" },
  { id: "AR-N", name: "Misiones" },
  { id: "AR-Q", name: "Neuquén" },
  { id: "AR-R", name: "Río Negro" },
  { id: "AR-A", name: "Salta" },
  { id: "AR-J", name: "San Juan" },
  { id: "AR-D", name: "San Luis" },
  { id: "AR-Z", name: "Santa Cruz" },
  { id: "AR-S", name: "Santa Fe" },
  { id: "AR-G", name: "Santiago del Estero" },
  { id: "AR-V", name: "Tierra del Fuego" },
  { id: "AR-T", name: "Tucumán" },
];

export default function RegisterWizard({ onSwitchToLogin }) {
  const navigate = useNavigate();
  const { register: authRegister } = useAuth();
  const { districts, loadDistricts, refreshClients, countries, loadCountries } = useDataCache();
  const { success: showSuccessToast, error: showErrorToast } = useToast();

  // Mode: null | "personal" | "business"
  const [targetType, setTargetType] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);

  // Form State - Empresa / Cliente
  const [cuit, setCuit] = useState("");
  const [businessName, setBusinessName] = useState("");

  // Representative (for legal entity in business mode)
  const [representativeName, setRepresentativeName] = useState("");
  const [representativeDni, setRepresentativeDni] = useState("");
  const [representativeCountryCode, setRepresentativeCountryCode] = useState("54");
  const [representativePhone, setRepresentativePhone] = useState("");
  const [representativeMail, setRepresentativeMail] = useState("");

  // Address
  const [address, setAddress] = useState("");
  const [location, setLocation] = useState("");
  const [province, setProvince] = useState("AR-C");

  // Applicant / Auth User State
  const [applicantName, setApplicantName] = useState("");
  const [applicantDni, setApplicantDni] = useState("");
  const [applicantCountryCode, setApplicantCountryCode] = useState("54");
  const [applicantPhone, setApplicantPhone] = useState("");
  const [applicantMail, setApplicantMail] = useState("");

  // Billing State
  const [billingSameAsClient, setBillingSameAsClient] = useState(true);
  const [billingCuit, setBillingCuit] = useState("");
  const [billingAddress, setBillingAddress] = useState("");
  const [billingLocation, setBillingLocation] = useState("");
  const [billingProvince, setBillingProvince] = useState("AR-C");
  const [billingPaysIva, setBillingPaysIva] = useState(false);

  // Security / Password State
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // OTP Verification State
  const [mailingRequired, setMailingRequired] = useState(false);
  const [pendingPersonPayload, setPendingPersonPayload] = useState(null);
  const [otpCode, setOtpCode] = useState("");
  const [otpError, setOtpError] = useState("");
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [resendingCode, setResendingCode] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Error States
  const [fieldErrors, setFieldErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!districts) {
      loadDistricts().catch(() => {});
    }
    if (!countries) {
      loadCountries?.().catch(() => {});
    }
  }, [districts, loadDistricts, countries, loadCountries]);

  // Temporizador para reenvío de OTP
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const provinceOptions =
    Array.isArray(districts) && districts.length > 0
      ? districts
      : FALLBACK_PROVINCES;

  const clearFieldError = (fieldName) => {
    if (fieldErrors[fieldName]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[fieldName];
        return next;
      });
    }
  };

  const handleCuitChange = (value) => {
    const raw = String(value || "").replace(/\D/g, "").slice(0, 11);
    setCuit(raw);
    clearFieldError("cuit");
    if (targetType === "personal") {
      const extractedDni = extractDniFromCuit(raw);
      if (extractedDni && (!applicantDni || applicantDni === extractDniFromCuit(cuit))) {
        setApplicantDni(extractedDni);
        clearFieldError("applicantDni");
      }
    }
  };

  const isValidEmail = (email) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || "").trim());

  // Validación de campos por paso
  const validateStep = () => {
    const errors = {};
    setServerError("");

    if (currentStep === 0) {
      if (!targetType) {
        setServerError("Por favor, seleccioná una de las opciones para continuar.");
        return false;
      }
      return true;
    }

    if (targetType === "personal") {
      // Step 1: Datos Personales y de Cliente
      if (currentStep === 1) {
        if (!applicantName.trim()) {
          errors.applicantName = "Hay que completarlo";
        }
        if (!cuit.trim()) {
          errors.cuit = "Hay que completarlo";
        } else if (cuit.length !== 11) {
          errors.cuit = "El CUIT debe tener 11 dígitos";
        }
        if (!applicantDni.trim()) {
          errors.applicantDni = "Hay que completarlo";
        } else if (applicantDni.length < 7) {
          errors.applicantDni = "Debe tener entre 7 y 8 dígitos";
        }
        if (!applicantMail.trim()) {
          errors.applicantMail = "Hay que completarlo";
        } else if (!isValidEmail(applicantMail)) {
          errors.applicantMail = "Ingresá un correo válido";
        }
        if (!applicantPhone.trim()) {
          errors.applicantPhone = "Hay que completarlo";
        }
        if (!address.trim()) {
          errors.address = "Hay que completarlo";
        }
        if (!location.trim()) {
          errors.location = "Hay que completarlo";
        }
      }

      // Step 2: Facturación
      if (currentStep === 2) {
        if (!billingSameAsClient) {
          const cleanBillCuit = billingCuit.replace(/\D/g, "");
          if (!cleanBillCuit) {
            errors.billingCuit = "Hay que completarlo";
          } else if (cleanBillCuit.length !== 11) {
            errors.billingCuit = "Debe tener 11 dígitos";
          }
          if (!billingAddress.trim()) {
            errors.billingAddress = "Hay que completarlo";
          }
          if (!billingLocation.trim()) {
            errors.billingLocation = "Hay que completarlo";
          }
        }
      }

      // Step 3: Contraseña
      if (currentStep === 3) {
        if (!password) {
          errors.password = "Hay que completarlo";
        } else if (password.length < 12) {
          errors.password = "Debe tener al menos 12 caracteres";
        }
        if (!confirmPassword) {
          errors.confirmPassword = "Hay que completarlo";
        } else if (password !== confirmPassword) {
          errors.confirmPassword = "Las contraseñas no coinciden";
        }
      }
    } else {
      // Step 1: Datos de la Empresa
      if (currentStep === 1) {
        if (!cuit.trim()) {
          errors.cuit = "Hay que completarlo";
        } else if (cuit.length !== 11) {
          errors.cuit = "El CUIT debe tener 11 dígitos";
        }
        if (!businessName.trim()) {
          errors.businessName = "Hay que completarlo";
        }
        if (isLegalEntityCuit(cuit)) {
          if (!representativeName.trim()) {
            errors.representativeName = "Hay que completarlo";
          }
          if (!representativeDni.trim()) {
            errors.representativeDni = "Hay que completarlo";
          } else if (representativeDni.length !== 8) {
            errors.representativeDni = "Debe tener 8 dígitos";
          }
        }
        if (!address.trim()) {
          errors.address = "Hay que completarlo";
        }
        if (!location.trim()) {
          errors.location = "Hay que completarlo";
        }
        if (!billingSameAsClient) {
          const cleanBillCuit = billingCuit.replace(/\D/g, "");
          if (!cleanBillCuit) {
            errors.billingCuit = "Hay que completarlo";
          } else if (cleanBillCuit.length !== 11) {
            errors.billingCuit = "Debe tener 11 dígitos";
          }
          if (!billingAddress.trim()) {
            errors.billingAddress = "Hay que completarlo";
          }
        }
      }

      // Step 2: Solicitante
      if (currentStep === 2) {
        if (!applicantName.trim()) {
          errors.applicantName = "Hay que completarlo";
        }
        if (!applicantDni.trim()) {
          errors.applicantDni = "Hay que completarlo";
        } else if (applicantDni.length < 7) {
          errors.applicantDni = "Debe tener entre 7 y 8 dígitos";
        }
        if (!applicantPhone.trim()) {
          errors.applicantPhone = "Hay que completarlo";
        }
        if (!applicantMail.trim()) {
          errors.applicantMail = "Hay que completarlo";
        } else if (!isValidEmail(applicantMail)) {
          errors.applicantMail = "Ingresá un correo válido";
        }
      }

      // Step 3: Contraseña
      if (currentStep === 3) {
        if (!password) {
          errors.password = "Hay que completarlo";
        } else if (password.length < 12) {
          errors.password = "Debe tener al menos 12 caracteres";
        }
        if (!confirmPassword) {
          errors.confirmPassword = "Hay que completarlo";
        } else if (password !== confirmPassword) {
          errors.confirmPassword = "Las contraseñas no coinciden";
        }
      }
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return false;
    }

    setFieldErrors({});
    return true;
  };

  const handleNext = () => {
    if (!validateStep()) return;
    setCurrentStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setServerError("");
    setFieldErrors({});
    if (currentStep === 1) {
      setCurrentStep(0);
    } else {
      setCurrentStep((prev) => Math.max(0, prev - 1));
    }
  };

  // Crea el cliente en el backend
  const createClientRecord = async () => {
    const isPersonal = targetType === "personal";
    const clientNameValue = isPersonal ? applicantName.trim() : businessName.trim();
    const cleanCuit = cuit.replace(/\D/g, "");
    const cleanBillingCuit = billingSameAsClient
      ? cleanCuit
      : billingCuit.replace(/\D/g, "") || cleanCuit;

    const provCode = mapProvinceCodeToDistrictId(province, districts) || "AR-C";
    const billingProvCode = billingSameAsClient
      ? provCode
      : (mapProvinceCodeToDistrictId(billingProvince, districts) || "AR-C");

    const isLegal = !isPersonal && isLegalEntityCuit(cleanCuit);

    const representativePayload = isLegal
      ? {
          name: representativeName.trim(),
          dni: String(representativeDni).trim(),
          phone: representativePhone.trim() || undefined,
          country_code: (representativeCountryCode || "54").trim(),
          countryCode: (representativeCountryCode || "54").trim(),
          mail: representativeMail.trim() || undefined,
        }
      : undefined;

    const clientPayload = {
      cuit: cleanCuit,
      name: clientNameValue,
      address: {
        address: address.trim(),
        location: location.trim(),
        province: provCode,
        district: provCode,
      },
      representative: representativePayload,
      billing: {
        cuit: cleanBillingCuit,
        address: (billingSameAsClient ? address : billingAddress).trim(),
        location: (billingSameAsClient ? location : billingLocation).trim(),
        province: billingProvCode,
        paysIva: Boolean(billingPaysIva),
      },
    };

    try {
      await clientsService.create(clientPayload);
      await refreshClients().catch(() => {});
    } catch (clientErr) {
      console.warn("Aviso al crear cliente en onboarding:", clientErr);
    }
  };

  // Envío del registro inicial (Paso 4 -> crea usuario y chequea si exige OTP)
  const handleSubmit = async () => {
    if (!validateStep()) return;
    setLoading(true);
    setServerError("");

    const provCode = mapProvinceCodeToDistrictId(province, districts) || "AR-C";
    const personPayload = {
      name: applicantName.trim(),
      dni: applicantDni.trim(),
      phone: applicantPhone.trim() || undefined,
      country_code: (applicantCountryCode || "54").trim(),
      countryCode: (applicantCountryCode || "54").trim(),
      mail: applicantMail.trim().toLowerCase(),
      address: address.trim() || undefined,
      location: location.trim() || undefined,
      province: provCode,
      district: provCode,
    };

    try {
      // 1. Chequear si el sistema tiene mailing configurado
      const mailingStatus = await apiKeysService.getMailingStatus();
      const isMailingActive = Boolean(mailingStatus?.mailingRequired);
      setMailingRequired(isMailingActive);

      // 2. Si el mailing está activo, exigir validación OTP ANTES de crear usuario/cliente en DB
      if (isMailingActive) {
        setPendingPersonPayload(personPayload);
        await apiKeysService.sendVerification({
          mail: applicantMail.trim().toLowerCase(),
          name: applicantName.trim(),
          frontendUrl: typeof window !== "undefined" ? window.location.origin : "",
        });
        setResendCooldown(60);
        setCurrentStep(5); // Paso de verificación OTP
        return;
      }

      // 3. Si NO hay mailing configurado, registrar usuario, crear cliente y acceder al dashboard
      await authRegister({
        mail: applicantMail.trim().toLowerCase(),
        password,
        person: personPayload,
      });

      await createClientRecord();

      showSuccessToast("¡Cuenta creada exitosamente! Bienvenido a la Oficina Virtual.");
      navigate("/dashboard");
    } catch (err) {
      console.error("Error en registro:", err);
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "No fue posible completar el registro. Verificá los datos ingresados.";
      setServerError(msg);
      showErrorToast(msg);
    } finally {
      setLoading(false);
    }
  };

  // Valida el código OTP en el paso 5 y luego crea la cuenta y su ficha de cliente
  const handleVerifyOtp = async () => {
    if (otpCode.length !== 6) {
      setOtpError("Ingresá el código completo de 6 dígitos");
      return;
    }

    setVerifyingOtp(true);
    setOtpError("");

    try {
      const normalizedMail = applicantMail.trim().toLowerCase();
      await apiKeysService.verifyOtp({
        mail: normalizedMail,
        otpCode,
      });

      const provCode = mapProvinceCodeToDistrictId(province, districts) || "AR-C";
      const finalPersonPayload = pendingPersonPayload || {
        name: applicantName.trim(),
        dni: applicantDni.trim(),
        phone: applicantPhone.trim() || undefined,
        country_code: (applicantCountryCode || "54").trim(),
        countryCode: (applicantCountryCode || "54").trim(),
        mail: normalizedMail,
        address: address.trim() || undefined,
        location: location.trim() || undefined,
        province: provCode,
        district: provCode,
      };

      await authRegister({
        mail: normalizedMail,
        password,
        person: finalPersonPayload,
      });

      await createClientRecord();

      showSuccessToast("¡Correo verificado y cuenta creada con éxito! Bienvenido a la Oficina Virtual.");
      navigate("/dashboard");
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        "Código incorrecto o expirado. Verificá e intentá nuevamente.";
      setOtpError(msg);
    } finally {
      setVerifyingOtp(false);
    }
  };

  // Reenviar código OTP
  const handleResendCode = async () => {
    if (resendCooldown > 0 || resendingCode) return;
    setResendingCode(true);
    setOtpError("");

    try {
      await apiKeysService.sendVerification({
        mail: applicantMail.trim().toLowerCase(),
        name: applicantName.trim(),
        frontendUrl: typeof window !== "undefined" ? window.location.origin : "",
      });
      showSuccessToast("Nuevo código de verificación enviado a tu correo.");
      setResendCooldown(60);
      setOtpCode("");
    } catch (err) {
      showErrorToast("Error al reenviar el código. Intentá más tarde.");
    } finally {
      setResendingCode(false);
    }
  };

  const totalSteps = mailingRequired ? 5 : 4;

  return (
    <div className="flex h-full w-full flex-col overflow-hidden items-center justify-between p-4 sm:p-6 lg:p-8">
      <div className="flex h-full w-full max-w-xl flex-col overflow-hidden">
        {/* CABECERA FIJA SUPERIOR */}
        <div className="shrink-0 pb-3 space-y-1.5 border-b border-border/40">
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
              <ShieldCheck className="size-3.5" />
              {currentStep === 5 ? "Verificación de Seguridad" : "Registro de Usuario"}
            </div>
            {currentStep > 0 && (
              <span className="text-xs font-medium text-muted-foreground">
                Paso {currentStep} de {totalSteps}
              </span>
            )}
          </div>

          {currentStep === 0 ? (
            <>
              <h1 className="text-xl sm:text-2xl font-bold leading-tight text-foreground">
                ¿Para quién querés solicitar ensayos?
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Seleccioná una opción para configurar tu cuenta y cliente en la plataforma.
              </p>
            </>
          ) : currentStep === 5 ? (
            <>
              <h1 className="text-xl sm:text-2xl font-bold leading-tight text-foreground">
                Verificá tu correo electrónico
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Te enviamos un código OTP y un enlace directo a{" "}
                <strong className="text-foreground">{applicantMail}</strong>.
              </p>
            </>
          ) : (
            <>
              <h1 className="text-xl sm:text-2xl font-bold leading-tight text-foreground">
                {targetType === "personal"
                  ? currentStep === 1
                    ? "Tus datos personales y de cliente"
                    : currentStep === 2
                    ? "Condición de facturación"
                    : currentStep === 3
                    ? "Establecer tu contraseña"
                    : "Revisá y confirmá tu registro"
                  : currentStep === 1
                  ? "Datos de la empresa a representar"
                  : currentStep === 2
                  ? "Datos del solicitante (Usuario de acceso)"
                  : currentStep === 3
                  ? "Establecer tu contraseña"
                  : "Revisá y confirmá tu registro"}
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {targetType === "personal"
                  ? "Completá los campos para dar de alta tu cuenta individual."
                  : "Completá los campos de la empresa y del solicitante responsable."}
              </p>
            </>
          )}

          {serverError && <ErrorAlert message={serverError} />}
        </div>

        {/* CONTENEDOR CON SCROLL SUAVE DENTRO DEL FORM */}
        <div className="flex-1 min-h-0 overflow-y-auto scrollbar-soft py-4 px-1 pr-2 space-y-4">
          {/* PASO 0: CARDS DE SELECCIÓN */}
          {currentStep === 0 && (
            <div className="space-y-4">
              <div className="grid gap-3.5 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => {
                    setTargetType("personal");
                    setServerError("");
                  }}
                  className={`relative flex flex-col justify-between rounded-xl border p-4 sm:p-5 text-left transition-all duration-200 outline-none hover:shadow-md ${
                    targetType === "personal"
                      ? "border-primary bg-primary/5 ring-2 ring-primary/30 shadow-sm"
                      : "border-border bg-card hover:border-primary/50"
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div
                        className={`flex size-10 items-center justify-center rounded-lg ${
                          targetType === "personal"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        <User className="size-5" />
                      </div>
                      <span className="rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground">
                        Persona física
                      </span>
                    </div>

                    <div>
                      <h3 className="text-base font-semibold text-foreground">
                        Para mí
                      </h3>
                      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                        Solicito ensayos a título personal. Carga unificada de mis datos personales como cliente y solicitante.
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-border/50 text-[11px] text-muted-foreground flex items-center gap-1.5 font-medium">
                    <CheckCircle2 className="size-3.5 text-primary" />
                    <span>Gestión directa e individual</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setTargetType("business");
                    setServerError("");
                  }}
                  className={`relative flex flex-col justify-between rounded-xl border p-4 sm:p-5 text-left transition-all duration-200 outline-none hover:shadow-md ${
                    targetType === "business"
                      ? "border-primary bg-primary/5 ring-2 ring-primary/30 shadow-sm"
                      : "border-border bg-card hover:border-primary/50"
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div
                        className={`flex size-10 items-center justify-center rounded-lg ${
                          targetType === "business"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        <Building2 className="size-5" />
                      </div>
                      <span className="rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground">
                        Empresa / Tercero
                      </span>
                    </div>

                    <div>
                      <h3 className="text-base font-semibold text-foreground">
                        Para una empresa o persona que represento
                      </h3>
                      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                        Solicito ensayos en nombre de una fábrica, comercio, taller o entidad. Carga en pasos separados.
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-border/50 text-[11px] text-muted-foreground flex items-center gap-1.5 font-medium">
                    <CheckCircle2 className="size-3.5 text-primary" />
                    <span>Personas jurídicas o físicas</span>
                  </div>
                </button>
              </div>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={onSwitchToLogin}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors py-1"
                >
                  ¿Ya tenés una cuenta registrada?{" "}
                  <span className="font-semibold text-primary underline">
                    Iniciar sesión
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* FLOW "PARA MÍ" */}
          {targetType === "personal" && currentStep > 0 && currentStep < 5 && (
            <div className="space-y-4">
              {/* STEP 1 */}
              {currentStep === 1 && (
                <div className="space-y-3.5">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1 sm:col-span-2">
                      <Label htmlFor="applicantName" className={fieldErrors.applicantName ? "text-destructive" : ""}>
                        Nombre completo *
                      </Label>
                      <Input
                        id="applicantName"
                        placeholder="Ej. Juan Carlos Pérez"
                        value={applicantName}
                        onChange={(e) => {
                          setApplicantName(e.target.value);
                          clearFieldError("applicantName");
                        }}
                        className={`h-10 rounded-lg bg-card transition-colors ${
                          fieldErrors.applicantName
                            ? "border-destructive focus-visible:ring-destructive/30 bg-destructive/5"
                            : "border-input"
                        }`}
                      />
                      {fieldErrors.applicantName && (
                        <p className="text-[11px] font-medium text-destructive">
                          {fieldErrors.applicantName}
                        </p>
                      )}
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="cuit" className={fieldErrors.cuit ? "text-destructive" : ""}>
                        CUIT personal *
                      </Label>
                      <Input
                        id="cuit"
                        placeholder="20-XXXXXXXX-X"
                        value={formatCuit(cuit)}
                        onChange={(e) => handleCuitChange(e.target.value)}
                        className={`h-10 rounded-lg bg-card transition-colors ${
                          fieldErrors.cuit
                            ? "border-destructive focus-visible:ring-destructive/30 bg-destructive/5"
                            : "border-input"
                        }`}
                      />
                      {fieldErrors.cuit && (
                        <p className="text-[11px] font-medium text-destructive">
                          {fieldErrors.cuit}
                        </p>
                      )}
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="applicantDni" className={fieldErrors.applicantDni ? "text-destructive" : ""}>
                        DNI *
                      </Label>
                      <Input
                        id="applicantDni"
                        placeholder="Número de documento"
                        value={applicantDni}
                        onChange={(e) => {
                          setApplicantDni(e.target.value.replace(/\D/g, "").slice(0, 8));
                          clearFieldError("applicantDni");
                        }}
                        className={`h-10 rounded-lg bg-card transition-colors ${
                          fieldErrors.applicantDni
                            ? "border-destructive focus-visible:ring-destructive/30 bg-destructive/5"
                            : "border-input"
                        }`}
                      />
                      {fieldErrors.applicantDni && (
                        <p className="text-[11px] font-medium text-destructive">
                          {fieldErrors.applicantDni}
                        </p>
                      )}
                    </div>

                    <div className="space-y-1 sm:col-span-2">
                      <Label htmlFor="applicantMail" className={fieldErrors.applicantMail ? "text-destructive" : ""}>
                        Correo electrónico (Usuario para iniciar sesión) *
                      </Label>
                      <Input
                        id="applicantMail"
                        type="email"
                        placeholder="tu-correo@ejemplo.com"
                        value={applicantMail}
                        onChange={(e) => {
                          setApplicantMail(e.target.value);
                          clearFieldError("applicantMail");
                        }}
                        className={`h-10 rounded-lg bg-card transition-colors ${
                          fieldErrors.applicantMail
                            ? "border-destructive focus-visible:ring-destructive/30 bg-destructive/5"
                            : "border-input"
                        }`}
                      />
                      {fieldErrors.applicantMail && (
                        <p className="text-[11px] font-medium text-destructive">
                          {fieldErrors.applicantMail}
                        </p>
                      )}
                    </div>

                    <div className="space-y-1 sm:col-span-2">
                      <Label htmlFor="applicantPhone" className={fieldErrors.applicantPhone ? "text-destructive" : ""}>
                        Teléfono de contacto *
                      </Label>
                      <div className="flex gap-2">
                        <select
                          value={applicantCountryCode || "54"}
                          onChange={(e) => setApplicantCountryCode(e.target.value)}
                          className="h-10 w-24 rounded-lg border border-input bg-card px-2 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                        >
                          {(countries || [])
                            .filter((c) => c.country_code)
                            .map((c) => (
                              <option key={c.id || c.country_code} value={String(c.country_code).trim()}>
                                +{String(c.country_code).trim()}
                              </option>
                            ))}
                          {(!countries || countries.length === 0) && <option value="54">+54</option>}
                        </select>
                        <Input
                          id="applicantPhone"
                          placeholder="Ej. 11 4455-6677"
                          value={applicantPhone}
                          onChange={(e) => {
                            setApplicantPhone(e.target.value);
                            clearFieldError("applicantPhone");
                          }}
                          className={`h-10 flex-1 rounded-lg bg-card transition-colors ${
                            fieldErrors.applicantPhone
                              ? "border-destructive focus-visible:ring-destructive/30 bg-destructive/5"
                              : "border-input"
                          }`}
                        />
                      </div>
                      {fieldErrors.applicantPhone && (
                        <p className="text-[11px] font-medium text-destructive">
                          {fieldErrors.applicantPhone}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-border space-y-3">
                    <div className="flex items-center gap-2 text-xs font-semibold text-foreground uppercase tracking-wider">
                      <MapPin className="size-3.5 text-primary" />
                      Domicilio
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="space-y-1 sm:col-span-2">
                        <Label htmlFor="address" className={fieldErrors.address ? "text-destructive" : ""}>
                          Dirección (Calle y altura) *
                        </Label>
                        <Input
                          id="address"
                          placeholder="Ej. Av. Belgrano 1234, Piso 2"
                          value={address}
                          onChange={(e) => {
                            setAddress(e.target.value);
                            clearFieldError("address");
                          }}
                          className={`h-10 rounded-lg bg-card transition-colors ${
                            fieldErrors.address
                              ? "border-destructive focus-visible:ring-destructive/30 bg-destructive/5"
                              : "border-input"
                          }`}
                        />
                        {fieldErrors.address && (
                          <p className="text-[11px] font-medium text-destructive">
                            {fieldErrors.address}
                          </p>
                        )}
                      </div>

                      <div className="space-y-1">
                        <Label htmlFor="location" className={fieldErrors.location ? "text-destructive" : ""}>
                          Localidad *
                        </Label>
                        <Input
                          id="location"
                          placeholder="Localidad o Ciudad"
                          value={location}
                          onChange={(e) => {
                            setLocation(e.target.value);
                            clearFieldError("location");
                          }}
                          className={`h-10 rounded-lg bg-card transition-colors ${
                            fieldErrors.location
                              ? "border-destructive focus-visible:ring-destructive/30 bg-destructive/5"
                              : "border-input"
                          }`}
                        />
                        {fieldErrors.location && (
                          <p className="text-[11px] font-medium text-destructive">
                            {fieldErrors.location}
                          </p>
                        )}
                      </div>

                      <div className="space-y-1">
                        <Label htmlFor="province">Provincia *</Label>
                        <select
                          id="province"
                          value={province}
                          onChange={(e) => setProvince(e.target.value)}
                          className="h-10 w-full rounded-lg border border-input bg-card px-3 text-sm focus-visible:ring-2 focus-visible:ring-primary/30"
                        >
                          {provinceOptions.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2 */}
              {currentStep === 2 && (
                <div className="space-y-4">
                  <div className="rounded-xl border border-border bg-card p-4 space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-border">
                      <Receipt className="size-4 text-primary" />
                      <span className="text-sm font-semibold text-foreground">
                        Condiciones de Facturación
                      </span>
                    </div>

                    <label className="flex items-center gap-3 text-sm text-foreground cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={billingSameAsClient}
                        onChange={(e) => setBillingSameAsClient(e.target.checked)}
                        className="size-4 rounded border-input accent-[var(--cl-verde)] cursor-pointer"
                      />
                      <span>Facturar con los mismos datos del cliente (CUIT y Domicilio)</span>
                    </label>

                    {!billingSameAsClient && (
                      <div className="pt-2 grid gap-3 sm:grid-cols-2">
                        <div className="space-y-1 sm:col-span-2">
                          <Label htmlFor="billingCuit" className={fieldErrors.billingCuit ? "text-destructive" : ""}>
                            CUIT de Facturación *
                          </Label>
                          <Input
                            id="billingCuit"
                            placeholder="XX-XXXXXXXX-X"
                            value={formatCuit(billingCuit)}
                            onChange={(e) => {
                              setBillingCuit(e.target.value.replace(/\D/g, "").slice(0, 11));
                              clearFieldError("billingCuit");
                            }}
                            className={`h-10 rounded-lg bg-card transition-colors ${
                              fieldErrors.billingCuit
                                ? "border-destructive focus-visible:ring-destructive/30 bg-destructive/5"
                                : "border-input"
                            }`}
                          />
                          {fieldErrors.billingCuit && (
                            <p className="text-[11px] font-medium text-destructive">
                              {fieldErrors.billingCuit}
                            </p>
                          )}
                        </div>

                        <div className="space-y-1 sm:col-span-2">
                          <Label htmlFor="billingAddress" className={fieldErrors.billingAddress ? "text-destructive" : ""}>
                            Dirección fiscal *
                          </Label>
                          <Input
                            id="billingAddress"
                            placeholder="Dirección fiscal"
                            value={billingAddress}
                            onChange={(e) => {
                              setBillingAddress(e.target.value);
                              clearFieldError("billingAddress");
                            }}
                            className={`h-10 rounded-lg bg-card transition-colors ${
                              fieldErrors.billingAddress
                                ? "border-destructive focus-visible:ring-destructive/30 bg-destructive/5"
                                : "border-input"
                            }`}
                          />
                          {fieldErrors.billingAddress && (
                            <p className="text-[11px] font-medium text-destructive">
                              {fieldErrors.billingAddress}
                            </p>
                          )}
                        </div>

                        <div className="space-y-1">
                          <Label htmlFor="billingLocation" className={fieldErrors.billingLocation ? "text-destructive" : ""}>
                            Localidad *
                          </Label>
                          <Input
                            id="billingLocation"
                            placeholder="Localidad"
                            value={billingLocation}
                            onChange={(e) => {
                              setBillingLocation(e.target.value);
                              clearFieldError("billingLocation");
                            }}
                            className={`h-10 rounded-lg bg-card transition-colors ${
                              fieldErrors.billingLocation
                                ? "border-destructive focus-visible:ring-destructive/30 bg-destructive/5"
                                : "border-input"
                            }`}
                          />
                          {fieldErrors.billingLocation && (
                            <p className="text-[11px] font-medium text-destructive">
                              {fieldErrors.billingLocation}
                            </p>
                          )}
                        </div>

                        <div className="space-y-1">
                          <Label htmlFor="billingProvince">Provincia *</Label>
                          <select
                            id="billingProvince"
                            value={billingProvince}
                            onChange={(e) => setBillingProvince(e.target.value)}
                            className="h-10 w-full rounded-lg border border-input bg-card px-3 text-sm focus-visible:ring-2 focus-visible:ring-primary/30"
                          >
                            {provinceOptions.map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    )}

                    <div className="pt-2 border-t border-border">
                      <label className="flex items-center gap-3 text-sm text-foreground cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={billingPaysIva}
                          onChange={(e) => setBillingPaysIva(e.target.checked)}
                          className="size-4 rounded border-input accent-[var(--cl-verde)] cursor-pointer"
                        />
                        <span>Responsable Inscripto (Paga IVA)</span>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3 */}
              {currentStep === 3 && (
                <div className="space-y-4">
                  <div className="rounded-xl border border-border bg-card p-4 space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-border text-xs font-semibold text-foreground uppercase tracking-wider">
                      <Lock className="size-3.5 text-primary" />
                      Credenciales de acceso
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="password" className={fieldErrors.password ? "text-destructive" : ""}>
                        Contraseña *
                      </Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Mínimo 12 caracteres"
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
                      {fieldErrors.password ? (
                        <p className="text-[11px] font-medium text-destructive">
                          {fieldErrors.password}
                        </p>
                      ) : (
                        <p className="text-[11px] text-muted-foreground">
                          Debe contener entre 12 y 64 caracteres.
                        </p>
                      )}
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="confirmPassword" className={fieldErrors.confirmPassword ? "text-destructive" : ""}>
                        Confirmar contraseña *
                      </Label>
                      <Input
                        id="confirmPassword"
                        type={showPassword ? "text" : "password"}
                        placeholder="Repetí tu contraseña"
                        value={confirmPassword}
                        onChange={(e) => {
                          setConfirmPassword(e.target.value);
                          clearFieldError("confirmPassword");
                        }}
                        className={`h-11 rounded-lg px-3.5 bg-card transition-colors ${
                          fieldErrors.confirmPassword
                            ? "border-destructive focus-visible:ring-destructive/30 bg-destructive/5"
                            : "border-input"
                        }`}
                      />
                      {fieldErrors.confirmPassword && (
                        <p className="text-[11px] font-medium text-destructive">
                          {fieldErrors.confirmPassword}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 4 */}
              {currentStep === 4 && (
                <div className="rounded-xl border border-border bg-card p-4 sm:p-5 space-y-4 text-sm">
                  <div className="flex items-center justify-between pb-3 border-b border-border">
                    <span className="font-semibold text-foreground">
                      Resumen de registro
                    </span>
                    <span className="rounded bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                      Persona física
                    </span>
                  </div>

                  <div className="grid gap-2 text-xs">
                    <div className="flex justify-between py-1 border-b border-border/40">
                      <span className="text-muted-foreground">Nombre:</span>
                      <span className="font-medium text-foreground">{applicantName}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-border/40">
                      <span className="text-muted-foreground">CUIT:</span>
                      <span className="font-mono text-foreground">{formatCuit(cuit)}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-border/40">
                      <span className="text-muted-foreground">DNI:</span>
                      <span className="font-mono text-foreground">{applicantDni}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-border/40">
                      <span className="text-muted-foreground">Correo de acceso:</span>
                      <span className="font-medium text-primary">{applicantMail}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-border/40">
                      <span className="text-muted-foreground">Teléfono:</span>
                      <span className="text-foreground">
                        {applicantPhone ? `+${applicantCountryCode || "54"} ${applicantPhone}` : "—"}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-border/40">
                      <span className="text-muted-foreground">Domicilio:</span>
                      <span className="text-foreground">
                        {address}, {location}
                      </span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-muted-foreground">Condición IVA:</span>
                      <span className="text-foreground">
                        {billingPaysIva ? "Responsable Inscripto" : "No paga IVA"}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* FLOW "PARA UNA EMPRESA O PERSONA QUE REPRESENTO" */}
          {targetType === "business" && currentStep > 0 && currentStep < 5 && (
            <div className="space-y-4">
              {/* STEP 1: Empresa */}
              {currentStep === 1 && (
                <div className="space-y-3.5">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1 sm:col-span-2">
                      <Label htmlFor="bizCuit" className={fieldErrors.cuit ? "text-destructive" : ""}>
                        CUIT de la Empresa *
                      </Label>
                      <Input
                        id="bizCuit"
                        placeholder="30-XXXXXXXX-X"
                        value={formatCuit(cuit)}
                        onChange={(e) => handleCuitChange(e.target.value)}
                        className={`h-10 rounded-lg bg-card transition-colors ${
                          fieldErrors.cuit
                            ? "border-destructive focus-visible:ring-destructive/30 bg-destructive/5"
                            : "border-input"
                        }`}
                      />
                      {fieldErrors.cuit ? (
                        <p className="text-[11px] font-medium text-destructive">
                          {fieldErrors.cuit}
                        </p>
                      ) : isLegalEntityCuit(cuit) ? (
                        <span className="text-[11px] text-primary font-medium">
                          Persona Jurídica detectada (requiere representante legal)
                        </span>
                      ) : null}
                    </div>

                    <div className="space-y-1 sm:col-span-2">
                      <Label htmlFor="businessName" className={fieldErrors.businessName ? "text-destructive" : ""}>
                        Razón Social / Nombre de la empresa *
                      </Label>
                      <Input
                        id="businessName"
                        placeholder="Ej. Muebles Industriales S.A."
                        value={businessName}
                        onChange={(e) => {
                          setBusinessName(e.target.value);
                          clearFieldError("businessName");
                        }}
                        className={`h-10 rounded-lg bg-card transition-colors ${
                          fieldErrors.businessName
                            ? "border-destructive focus-visible:ring-destructive/30 bg-destructive/5"
                            : "border-input"
                        }`}
                      />
                      {fieldErrors.businessName && (
                        <p className="text-[11px] font-medium text-destructive">
                          {fieldErrors.businessName}
                        </p>
                      )}
                    </div>
                  </div>

                  {isLegalEntityCuit(cuit) && (
                    <div className="pt-3 border-t border-border space-y-3">
                      <div className="flex items-center gap-2 text-xs font-semibold text-foreground uppercase tracking-wider">
                        <UserCheck className="size-3.5 text-primary" />
                        Representante Legal
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="space-y-1 sm:col-span-2">
                          <Label htmlFor="representativeName" className={fieldErrors.representativeName ? "text-destructive" : ""}>
                            Nombre del representante *
                          </Label>
                          <Input
                            id="representativeName"
                            placeholder="Nombre completo"
                            value={representativeName}
                            onChange={(e) => {
                              setRepresentativeName(e.target.value);
                              clearFieldError("representativeName");
                            }}
                            className={`h-10 rounded-lg bg-card transition-colors ${
                              fieldErrors.representativeName
                                ? "border-destructive focus-visible:ring-destructive/30 bg-destructive/5"
                                : "border-input"
                            }`}
                          />
                          {fieldErrors.representativeName && (
                            <p className="text-[11px] font-medium text-destructive">
                              {fieldErrors.representativeName}
                            </p>
                          )}
                        </div>

                        <div className="space-y-1">
                          <Label htmlFor="representativeDni" className={fieldErrors.representativeDni ? "text-destructive" : ""}>
                            DNI del representante (8 dígitos) *
                          </Label>
                          <Input
                            id="representativeDni"
                            placeholder="12345678"
                            value={representativeDni}
                            onChange={(e) => {
                              setRepresentativeDni(e.target.value.replace(/\D/g, "").slice(0, 8));
                              clearFieldError("representativeDni");
                            }}
                            className={`h-10 rounded-lg bg-card transition-colors ${
                              fieldErrors.representativeDni
                                ? "border-destructive focus-visible:ring-destructive/30 bg-destructive/5"
                                : "border-input"
                            }`}
                          />
                          {fieldErrors.representativeDni && (
                            <p className="text-[11px] font-medium text-destructive">
                              {fieldErrors.representativeDni}
                            </p>
                          )}
                        </div>

                        <div className="space-y-1">
                          <Label htmlFor="representativePhone">Teléfono (opcional)</Label>
                          <div className="flex gap-2">
                            <select
                              value={representativeCountryCode || "54"}
                              onChange={(e) => setRepresentativeCountryCode(e.target.value)}
                              className="h-10 w-24 rounded-lg border border-input bg-card px-2 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                            >
                              {(countries || [])
                                .filter((c) => c.country_code)
                                .map((c) => (
                                  <option key={c.id || c.country_code} value={String(c.country_code).trim()}>
                                    +{String(c.country_code).trim()}
                                  </option>
                                ))}
                              {(!countries || countries.length === 0) && <option value="54">+54</option>}
                            </select>
                            <Input
                              id="representativePhone"
                              placeholder="Teléfono"
                              value={representativePhone}
                              onChange={(e) => setRepresentativePhone(e.target.value)}
                              className="h-10 flex-1 rounded-lg bg-card"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="pt-3 border-t border-border space-y-3">
                    <div className="flex items-center gap-2 text-xs font-semibold text-foreground uppercase tracking-wider">
                      <MapPin className="size-3.5 text-primary" />
                      Domicilio de la Empresa
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="space-y-1 sm:col-span-2">
                        <Label htmlFor="bizAddress" className={fieldErrors.address ? "text-destructive" : ""}>
                          Dirección *
                        </Label>
                        <Input
                          id="bizAddress"
                          placeholder="Calle, altura, piso"
                          value={address}
                          onChange={(e) => {
                            setAddress(e.target.value);
                            clearFieldError("address");
                          }}
                          className={`h-10 rounded-lg bg-card transition-colors ${
                            fieldErrors.address
                              ? "border-destructive focus-visible:ring-destructive/30 bg-destructive/5"
                              : "border-input"
                          }`}
                        />
                        {fieldErrors.address && (
                          <p className="text-[11px] font-medium text-destructive">
                            {fieldErrors.address}
                          </p>
                        )}
                      </div>

                      <div className="space-y-1">
                        <Label htmlFor="bizLocation" className={fieldErrors.location ? "text-destructive" : ""}>
                          Localidad *
                        </Label>
                        <Input
                          id="bizLocation"
                          placeholder="Localidad"
                          value={location}
                          onChange={(e) => {
                            setLocation(e.target.value);
                            clearFieldError("location");
                          }}
                          className={`h-10 rounded-lg bg-card transition-colors ${
                            fieldErrors.location
                              ? "border-destructive focus-visible:ring-destructive/30 bg-destructive/5"
                              : "border-input"
                          }`}
                        />
                        {fieldErrors.location && (
                          <p className="text-[11px] font-medium text-destructive">
                            {fieldErrors.location}
                          </p>
                        )}
                      </div>

                      <div className="space-y-1">
                        <Label htmlFor="bizProvince">Provincia *</Label>
                        <select
                          id="bizProvince"
                          value={province}
                          onChange={(e) => setProvince(e.target.value)}
                          className="h-10 w-full rounded-lg border border-input bg-card px-3 text-sm focus-visible:ring-2 focus-visible:ring-primary/30"
                        >
                          {provinceOptions.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-border space-y-3">
                    <div className="flex items-center gap-2 text-xs font-semibold text-foreground uppercase tracking-wider">
                      <Receipt className="size-3.5 text-primary" />
                      Condición de Facturación
                    </div>

                    <label className="flex items-center gap-3 text-sm text-foreground cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={billingSameAsClient}
                        onChange={(e) => setBillingSameAsClient(e.target.checked)}
                        className="size-4 rounded border-input accent-[var(--cl-verde)] cursor-pointer"
                      />
                      <span>Facturar con los mismos datos de la empresa</span>
                    </label>

                    {!billingSameAsClient && (
                      <div className="pt-2 grid gap-3 sm:grid-cols-2">
                        <div className="space-y-1 sm:col-span-2">
                          <Label htmlFor="bizBillingCuit" className={fieldErrors.billingCuit ? "text-destructive" : ""}>
                            CUIT de facturación *
                          </Label>
                          <Input
                            id="bizBillingCuit"
                            placeholder="XX-XXXXXXXX-X"
                            value={formatCuit(billingCuit)}
                            onChange={(e) => {
                              setBillingCuit(e.target.value.replace(/\D/g, "").slice(0, 11));
                              clearFieldError("billingCuit");
                            }}
                            className={`h-10 rounded-lg bg-card transition-colors ${
                              fieldErrors.billingCuit
                                ? "border-destructive focus-visible:ring-destructive/30 bg-destructive/5"
                                : "border-input"
                            }`}
                          />
                          {fieldErrors.billingCuit && (
                            <p className="text-[11px] font-medium text-destructive">
                              {fieldErrors.billingCuit}
                            </p>
                          )}
                        </div>
                        <div className="space-y-1 sm:col-span-2">
                          <Label htmlFor="bizBillingAddress" className={fieldErrors.billingAddress ? "text-destructive" : ""}>
                            Dirección fiscal *
                          </Label>
                          <Input
                            id="bizBillingAddress"
                            placeholder="Dirección fiscal"
                            value={billingAddress}
                            onChange={(e) => {
                              setBillingAddress(e.target.value);
                              clearFieldError("billingAddress");
                            }}
                            className={`h-10 rounded-lg bg-card transition-colors ${
                              fieldErrors.billingAddress
                                ? "border-destructive focus-visible:ring-destructive/30 bg-destructive/5"
                                : "border-input"
                            }`}
                          />
                          {fieldErrors.billingAddress && (
                            <p className="text-[11px] font-medium text-destructive">
                              {fieldErrors.billingAddress}
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    <label className="flex items-center gap-3 text-sm text-foreground cursor-pointer select-none pt-1">
                      <input
                        type="checkbox"
                        checked={billingPaysIva}
                        onChange={(e) => setBillingPaysIva(e.target.checked)}
                        className="size-4 rounded border-input accent-[var(--cl-verde)] cursor-pointer"
                      />
                      <span>Responsable Inscripto (Paga IVA)</span>
                    </label>
                  </div>
                </div>
              )}

              {/* STEP 2: Solicitante */}
              {currentStep === 2 && (
                <div className="rounded-xl border border-border bg-card p-4 space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-border text-xs font-semibold text-foreground uppercase tracking-wider">
                    <Mail className="size-3.5 text-primary" />
                    Operador / Solicitante de Ensayos
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Tus datos como solicitante serán los utilizados para iniciar sesión y coordinar los ensayos.
                  </p>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1 sm:col-span-2">
                      <Label htmlFor="appBizName" className={fieldErrors.applicantName ? "text-destructive" : ""}>
                        Tu nombre y apellido *
                      </Label>
                      <Input
                        id="appBizName"
                        placeholder="Nombre y apellido completo"
                        value={applicantName}
                        onChange={(e) => {
                          setApplicantName(e.target.value);
                          clearFieldError("applicantName");
                        }}
                        className={`h-10 rounded-lg bg-card transition-colors ${
                          fieldErrors.applicantName
                            ? "border-destructive focus-visible:ring-destructive/30 bg-destructive/5"
                            : "border-input"
                        }`}
                      />
                      {fieldErrors.applicantName && (
                        <p className="text-[11px] font-medium text-destructive">
                          {fieldErrors.applicantName}
                        </p>
                      )}
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="appBizDni" className={fieldErrors.applicantDni ? "text-destructive" : ""}>
                        Tu DNI *
                      </Label>
                      <Input
                        id="appBizDni"
                        placeholder="Número de DNI"
                        value={applicantDni}
                        onChange={(e) => {
                          setApplicantDni(e.target.value.replace(/\D/g, "").slice(0, 8));
                          clearFieldError("applicantDni");
                        }}
                        className={`h-10 rounded-lg bg-card transition-colors ${
                          fieldErrors.applicantDni
                            ? "border-destructive focus-visible:ring-destructive/30 bg-destructive/5"
                            : "border-input"
                        }`}
                      />
                      {fieldErrors.applicantDni && (
                        <p className="text-[11px] font-medium text-destructive">
                          {fieldErrors.applicantDni}
                        </p>
                      )}
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="appBizPhone" className={fieldErrors.applicantPhone ? "text-destructive" : ""}>
                        Tu teléfono de contacto *
                      </Label>
                      <div className="flex gap-2">
                        <select
                          value={applicantCountryCode || "54"}
                          onChange={(e) => setApplicantCountryCode(e.target.value)}
                          className="h-10 w-24 rounded-lg border border-input bg-card px-2 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                        >
                          {(countries || [])
                            .filter((c) => c.country_code)
                            .map((c) => (
                              <option key={c.id || c.country_code} value={String(c.country_code).trim()}>
                                +{String(c.country_code).trim()}
                              </option>
                            ))}
                          {(!countries || countries.length === 0) && <option value="54">+54</option>}
                        </select>
                        <Input
                          id="appBizPhone"
                          placeholder="Teléfono o celular"
                          value={applicantPhone}
                          onChange={(e) => {
                            setApplicantPhone(e.target.value);
                            clearFieldError("applicantPhone");
                          }}
                          className={`h-10 flex-1 rounded-lg bg-card transition-colors ${
                            fieldErrors.applicantPhone
                              ? "border-destructive focus-visible:ring-destructive/30 bg-destructive/5"
                              : "border-input"
                          }`}
                        />
                      </div>
                      {fieldErrors.applicantPhone && (
                        <p className="text-[11px] font-medium text-destructive">
                          {fieldErrors.applicantPhone}
                        </p>
                      )}
                    </div>

                    <div className="space-y-1 sm:col-span-2">
                      <Label htmlFor="appBizMail" className={fieldErrors.applicantMail ? "text-destructive" : ""}>
                        Tu correo electrónico (Usuario para iniciar sesión) *
                      </Label>
                      <Input
                        id="appBizMail"
                        type="email"
                        placeholder="tu-correo@empresa.com"
                        value={applicantMail}
                        onChange={(e) => {
                          setApplicantMail(e.target.value);
                          clearFieldError("applicantMail");
                        }}
                        className={`h-10 rounded-lg bg-card transition-colors ${
                          fieldErrors.applicantMail
                            ? "border-destructive focus-visible:ring-destructive/30 bg-destructive/5"
                            : "border-input"
                        }`}
                      />
                      {fieldErrors.applicantMail && (
                        <p className="text-[11px] font-medium text-destructive">
                          {fieldErrors.applicantMail}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: Contraseña */}
              {currentStep === 3 && (
                <div className="rounded-xl border border-border bg-card p-4 space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-border text-xs font-semibold text-foreground uppercase tracking-wider">
                    <Lock className="size-3.5 text-primary" />
                    Credenciales de acceso
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="bizPassword" className={fieldErrors.password ? "text-destructive" : ""}>
                      Contraseña *
                    </Label>
                    <div className="relative">
                      <Input
                        id="bizPassword"
                        type={showPassword ? "text" : "password"}
                        placeholder="Mínimo 12 caracteres"
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
                    {fieldErrors.password ? (
                      <p className="text-[11px] font-medium text-destructive">
                        {fieldErrors.password}
                      </p>
                    ) : (
                      <p className="text-[11px] text-muted-foreground">
                        Debe tener entre 12 y 64 caracteres.
                      </p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="bizConfirmPassword" className={fieldErrors.confirmPassword ? "text-destructive" : ""}>
                      Confirmar contraseña *
                    </Label>
                    <Input
                      id="bizConfirmPassword"
                      type={showPassword ? "text" : "password"}
                      placeholder="Repetí tu contraseña"
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        clearFieldError("confirmPassword");
                      }}
                      className={`h-11 rounded-lg px-3.5 bg-card transition-colors ${
                        fieldErrors.confirmPassword
                          ? "border-destructive focus-visible:ring-destructive/30 bg-destructive/5"
                          : "border-input"
                      }`}
                    />
                    {fieldErrors.confirmPassword && (
                      <p className="text-[11px] font-medium text-destructive">
                        {fieldErrors.confirmPassword}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* STEP 4: Resumen */}
              {currentStep === 4 && (
                <div className="rounded-xl border border-border bg-card p-4 sm:p-5 space-y-4 text-sm">
                  <div className="flex items-center justify-between pb-3 border-b border-border">
                    <span className="font-semibold text-foreground">
                      Resumen de registro corporativo
                    </span>
                    <span className="rounded bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                      Empresa / Representación
                    </span>
                  </div>

                  <div className="grid gap-2 text-xs">
                    <div className="flex justify-between py-1 border-b border-border/40">
                      <span className="text-muted-foreground">Empresa:</span>
                      <span className="font-semibold text-foreground">{businessName}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-border/40">
                      <span className="text-muted-foreground">CUIT Empresa:</span>
                      <span className="font-mono text-foreground">{formatCuit(cuit)}</span>
                    </div>
                    {isLegalEntityCuit(cuit) && (
                      <div className="flex justify-between py-1 border-b border-border/40">
                        <span className="text-muted-foreground">Representante legal:</span>
                        <span className="text-foreground">{representativeName} (DNI {representativeDni})</span>
                      </div>
                    )}
                    <div className="flex justify-between py-1 border-b border-border/40">
                      <span className="text-muted-foreground">Domicilio:</span>
                      <span className="text-foreground">
                        {address}, {location}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-border/40">
                      <span className="text-muted-foreground">Solicitante:</span>
                      <span className="font-medium text-foreground">{applicantName} (DNI {applicantDni})</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-border/40">
                      <span className="text-muted-foreground">Teléfono solicitante:</span>
                      <span className="text-foreground">
                        {applicantPhone ? `+${applicantCountryCode || "54"} ${applicantPhone}` : "—"}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-border/40">
                      <span className="text-muted-foreground">Correo de acceso:</span>
                      <span className="font-medium text-primary">{applicantMail}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-muted-foreground">Condición IVA:</span>
                      <span className="text-foreground">
                        {billingPaysIva ? "Responsable Inscripto" : "No paga IVA"}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ============================================================ */}
          {/* PASO 5: VERIFICACIÓN DE EMAIL CON CÓDIGO OTP (SI MAILING ON) */}
          {/* ============================================================ */}
          {currentStep === 5 && (
            <div className="space-y-5 animate-in fade-in">
              <div className="rounded-xl border border-border bg-card p-5 sm:p-6 shadow-sm space-y-4 text-center">
                <div className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary mx-auto">
                  <Mail className="size-7" />
                </div>

                <div>
                  <h3 className="text-base font-bold text-foreground">
                    Ingresá el código de 6 dígitos
                  </h3>
                  <p className="mt-1 text-xs text-muted-foreground max-w-sm mx-auto">
                    Revisá la bandeja de entrada o spam de{" "}
                    <strong className="text-foreground font-semibold">{applicantMail}</strong>.
                  </p>
                </div>

                {/* Input OTP Visual (1 cajita por dígito) */}
                <div className="py-2">
                  <OtpInput
                    length={6}
                    value={otpCode}
                    onChange={(val) => {
                      setOtpCode(val);
                      setOtpError("");
                    }}
                    hasError={Boolean(otpError)}
                    disabled={verifyingOtp}
                  />
                  {otpError && (
                    <p className="mt-2 text-xs font-semibold text-destructive animate-in fade-in">
                      {otpError}
                    </p>
                  )}
                </div>

                {/* Reenvío de código */}
                <div className="pt-2 flex flex-col items-center gap-1.5 text-xs text-muted-foreground">
                  <span>¿No recibiste el correo?</span>
                  <button
                    type="button"
                    disabled={resendCooldown > 0 || resendingCode}
                    onClick={handleResendCode}
                    className="font-semibold text-primary hover:underline disabled:opacity-50 disabled:no-underline inline-flex items-center gap-1.5"
                  >
                    {resendingCode ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : (
                      <RefreshCw className="size-3.5" />
                    )}
                    {resendCooldown > 0
                      ? `Reenviar código (${resendCooldown}s)`
                      : "Reenviar código"}
                  </button>
                </div>

                {/* Aviso */}
                <div className="pt-3 border-t border-border/60 text-xs text-muted-foreground leading-relaxed flex items-center justify-center gap-1.5">
                  <ExternalLink className="size-3.5 shrink-0 text-primary" />
                  <span>
                    Ingresá el código de 6 dígitos que te enviamos por correo para validar tu identidad y completar el registro.
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* BOTONES STICKY / FIJOS INFERIORES */}
        <div className="shrink-0 pt-3 pb-1 border-t border-border/60 bg-background/95 backdrop-blur-sm flex items-center justify-between gap-3">
          {currentStep === 0 ? (
            <>
              <div />
              <Button
                type="button"
                size="lg"
                disabled={!targetType}
                onClick={handleNext}
                className="h-11 px-6 text-sm font-semibold rounded-lg shadow-sm ml-auto"
              >
                Continuar
                <ArrowRight className="ml-2 size-4" />
              </Button>
            </>
          ) : currentStep === 5 ? (
            /* Botón para validar OTP */
            <>
              <div />
              <Button
                type="button"
                disabled={otpCode.length !== 6 || verifyingOtp}
                onClick={handleVerifyOtp}
                className="h-11 px-6 font-semibold ml-auto bg-primary text-primary-foreground hover:bg-primary/90 shadow"
              >
                {verifyingOtp ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
                Verificar y acceder
                <ArrowRight className="ml-2 size-4" />
              </Button>
            </>
          ) : (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                disabled={loading}
                className="h-10 px-4"
              >
                <ArrowLeft className="mr-2 size-4" />
                Atrás
              </Button>

              {currentStep < 4 ? (
                <Button
                  type="button"
                  onClick={handleNext}
                  className="h-10 px-6 font-medium ml-auto"
                >
                  Siguiente
                  <ArrowRight className="ml-2 size-4" />
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading}
                  className="h-11 px-6 font-semibold ml-auto bg-primary text-primary-foreground hover:bg-primary/90 shadow"
                >
                  {loading ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
                  Confirmar y crear cuenta
                </Button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
