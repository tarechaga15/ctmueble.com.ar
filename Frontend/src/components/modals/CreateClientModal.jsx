import { useState, useEffect, useRef } from "react";
import { Building2, ClipboardCheck, MapPin, Receipt, UserRound } from "lucide-react";
import { clientsService } from "../../services/clientsService";
import { useAuth } from "../../context/AuthContext";
import { useDataCache } from "../../context/DataCacheContext";
import { useToast } from "../../context/ToastContext";
import AltaStepper from "../shared/alta-stepper";
import BussinessSearch, { isLegalEntityCuit, extractDniFromCuit } from "../steps/client-creation/BussinessSearch";
import AddressStep from "../steps/client-creation/AddressStep";
import ApplicantStep from "../steps/client-creation/ApplicantStep";
import BillingStep from "../steps/client-creation/BillingStep";
import SummaryStep from "../steps/client-creation/SummaryStep";

export default function CreateClientModal({ onCancel, onCreated }) {
  const { user } = useAuth();
  const isLaboratory = user?.profile === "LABORATORY";
  const { districts, loadDistricts, refreshClients } = useDataCache();
  const { success: showSuccessToast, error: showErrorToast } = useToast();

  const [step, setStep] = useState(0); // 0-based for Stepper

  const [cuit, setCuit] = useState("");
  const [businessName, setBusinessName] = useState("");

  const [address, setAddress] = useState({
    address: "",
    location: "",
    province: "",
  });

  const [representativeName, setRepresentativeName] = useState("");
  const [representativeDni, setRepresentativeDni] = useState("");
  const [representativePhone, setRepresentativePhone] = useState("");
  const [representativeMail, setRepresentativeMail] = useState("");

  const [applicantName, setApplicantName] = useState("");
  const [applicantDni, setApplicantDni] = useState("");
  const [applicantPhone, setApplicantPhone] = useState("");
  const [applicantMail, setApplicantMail] = useState("");
  const [applicantStreet, setApplicantStreet] = useState("");
  const [applicantLocation, setApplicantLocation] = useState("");
  const [applicantDistrict, setApplicantDistrict] = useState("");
  const [applicantSameAsClient, setApplicantSameAsClient] = useState(true);

  const [billingSameAsClient, setBillingSameAsClient] = useState(true);
  const [billingCuit, setBillingCuit] = useState("");
  const [billingAddress, setBillingAddress] = useState("");
  const [billingLocation, setBillingLocation] = useState("");
  const [billingProvince, setBillingProvince] = useState("");
  const [billingPaysIva, setBillingPaysIva] = useState(false);
  const [billingInitialized, setBillingInitialized] = useState(false);

  const [createError, setCreateError] = useState("");
  const [creating, setCreating] = useState(false);
  const [showValidation, setShowValidation] = useState(false);

  const selectedAddress = address;

  const handleAddressField = (key, value) => {
    setAddress((prev) => ({ ...prev, [key]: value }));
  };

  const steps = [];

  steps.push({
    id: "cliente",
    label: "Cliente",
    hint: "Datos del cliente",
    icon: Building2,
    component: (
      <BussinessSearch
        businessName={businessName}
        setBusinessName={setBusinessName}
        cuit={cuit}
        setCuit={setCuit}
        representativeName={representativeName}
        setRepresentativeName={setRepresentativeName}
        representativeDni={representativeDni}
        setRepresentativeDni={setRepresentativeDni}
        representativePhone={representativePhone}
        setRepresentativePhone={setRepresentativePhone}
        representativeMail={representativeMail}
        setRepresentativeMail={setRepresentativeMail}
        showValidation={showValidation}
      />
    ),
  });

  steps.push({
    id: "domicilio",
    label: "Domicilio",
    hint: "Dónde está el cliente",
    icon: MapPin,
    component: (
      <AddressStep
        address={address}
        onChangeField={handleAddressField}
        showValidation={showValidation}
      />
    ),
  });

  if (isLaboratory) {
    steps.push({
      id: "solicitante",
      label: "Solicitante",
      hint: "Quién pide el trabajo",
      icon: UserRound,
      component: (
        <ApplicantStep
          isNaturalPerson={!isLegalEntityCuit(cuit)}
          applicantSameAsClient={applicantSameAsClient}
          clientName={businessName}
          clientAddress={address}
          onToggleApplicantSameAsClient={(checked) => {
            setApplicantSameAsClient(checked);
            if (checked) {
              setApplicantName(businessName || "");
              setApplicantDni(extractDniFromCuit(cuit));
              setApplicantStreet(address.address || "");
              setApplicantLocation(address.location || "");
              setApplicantDistrict(address.province || "");
            }
          }}
          applicantName={applicantName}
          setApplicantName={setApplicantName}
          applicantDni={applicantDni}
          setApplicantDni={setApplicantDni}
          applicantPhone={applicantPhone}
          setApplicantPhone={setApplicantPhone}
          applicantMail={applicantMail}
          setApplicantMail={setApplicantMail}
          applicantStreet={applicantStreet}
          setApplicantStreet={setApplicantStreet}
          applicantLocation={applicantLocation}
          setApplicantLocation={setApplicantLocation}
          applicantDistrict={applicantDistrict}
          setApplicantDistrict={setApplicantDistrict}
          showValidation={showValidation}
        />
      ),
    });
  }

  steps.push({
    id: "facturacion",
    label: "Facturación",
    hint: "Cómo se factura",
    icon: Receipt,
    component: (
      <BillingStep
        isLaboratory={isLaboratory}
        billingSameAsClient={billingSameAsClient}
        setBillingSameAsClient={setBillingSameAsClient}
        billingCuit={billingCuit}
        setBillingCuit={setBillingCuit}
        billingAddress={billingAddress}
        setBillingAddress={setBillingAddress}
        billingLocation={billingLocation}
        setBillingLocation={setBillingLocation}
        billingProvince={billingProvince}
        setBillingProvince={setBillingProvince}
        billingPaysIva={billingPaysIva}
        setBillingPaysIva={setBillingPaysIva}
        cuit={cuit}
        selectedAddress={selectedAddress}
        showValidation={showValidation}
      />
    ),
  });

  steps.push({
    id: "resumen",
    label: "Resumen",
    hint: "Revisá y confirmá",
    icon: ClipboardCheck,
    component: (
      <SummaryStep
        isLaboratory={isLaboratory}
        cuit={cuit}
        businessName={businessName}
        selectedAddress={selectedAddress}
        representativeName={representativeName}
        representativeDni={representativeDni}
        representativePhone={representativePhone}
        representativeMail={representativeMail}
        applicantName={applicantName}
        applicantDni={applicantDni}
        applicantPhone={applicantPhone}
        applicantMail={applicantMail}
        applicantAddress={getApplicantFullAddress()}
        billingCuit={billingCuit}
        billingAddress={billingAddress}
        billingLocation={billingLocation}
        billingProvince={billingProvince}
        billingPaysIva={billingPaysIva}
      />
    ),
  });

  // Inicializar datos de facturación al entrar al paso de facturación
  useEffect(() => {
    const currentStep = steps[step];
    if (currentStep?.id !== "facturacion" || billingInitialized) return;
    const digits = cuit.replace(/\D/g, "");
    const cuitClean = digits.slice(0, 11);
    setBillingCuit(cuitClean);
    setBillingAddress(selectedAddress?.address ?? "");
    setBillingLocation(selectedAddress?.location ?? "");
    setBillingProvince(selectedAddress?.province ?? "");
    setBillingPaysIva(false);
    setBillingInitialized(true);
  }, [step, billingInitialized, cuit, selectedAddress, steps]);

  // Si se marca "El cliente es el solicitante", mantener sincronizados los datos con el cliente
  useEffect(() => {
    if (applicantSameAsClient) {
      setApplicantName(businessName || "");
      setApplicantDni(extractDniFromCuit(cuit));
      setApplicantStreet(address.address || "");
      setApplicantLocation(address.location || "");
      setApplicantDistrict(address.province || "");
    }
  }, [applicantSameAsClient, businessName, cuit, address]);

  // Si pasa a ser persona jurídica, desmarcar; si pasa a ser persona física, marcar por default
  const prevIsLegalRef = useRef(isLegalEntityCuit(cuit));
  useEffect(() => {
    const isLegal = isLegalEntityCuit(cuit);
    if (isLegal && applicantSameAsClient) {
      setApplicantSameAsClient(false);
    } else if (prevIsLegalRef.current && !isLegal) {
      setApplicantSameAsClient(true);
    }
    prevIsLegalRef.current = isLegal;
  }, [cuit, applicantSameAsClient]);

  useEffect(() => {
    if (!districts) {
      loadDistricts().catch(() => {});
    }
  }, [districts, loadDistricts]);

  function getApplicantDistrictName() {
    if (!applicantDistrict || !Array.isArray(districts)) return "";
    const id = applicantDistrict?.id ?? applicantDistrict;
    return (
      districts.find((d) => String(d.id) === String(id))?.name ??
      applicantDistrict?.name ??
      ""
    );
  }

  function getApplicantFullAddress() {
    const districtName = getApplicantDistrictName();
    return [applicantStreet, applicantLocation, districtName]
      .map((v) => (v || "").trim())
      .filter(Boolean)
      .join(", ");
  }

  const handleConfirmCreate = () => {
    setCreateError("");
    const digits = cuit.replace(/\D/g, "");
    const cuitClean = digits.slice(0, 11);
    if (cuitClean.length !== 11) {
      setCreateError("El CUIT debe tener 11 dígitos.");
      setStep(0);
      return;
    }
    if (!businessName.trim()) {
      setCreateError("El nombre de la empresa es requerido.");
      setStep(0);
      return;
    }

    const isLegal = isLegalEntityCuit(cuitClean);
    if (isLegal) {
      if (!representativeName.trim() || String(representativeDni || "").trim().length !== 8) {
        setCreateError(
          "El representante legal (Nombre y DNI de 8 dígitos) es requerido para personas jurídicas."
        );
        setStep(0);
        return;
      }
    }

    const provCode = String(
      address.province?.id ?? address.province ?? ""
    ).trim();
    const addressPayload = {
      address: (address.address || "").trim(),
      location: (address.location || "").trim(),
      province: provCode,
      district: provCode,
    };

    const representativePayload = isLegal
      ? {
          name: representativeName.trim(),
          dni: String(representativeDni || "").trim(),
          phone: representativePhone || undefined,
          mail: representativeMail || undefined,
        }
      : undefined;

    const contactPayload =
      isLaboratory && (applicantName.trim() || (applicantSameAsClient && businessName.trim()))
        ? {
            name: (applicantSameAsClient ? (applicantName || businessName) : applicantName).trim(),
            dni: (applicantSameAsClient ? (applicantDni || extractDniFromCuit(cuitClean)) : applicantDni)?.trim() || undefined,
            phone: applicantPhone || undefined,
            mail: applicantMail || undefined,
            address: (applicantSameAsClient ? (applicantStreet || address.address) : applicantStreet) || undefined,
            location: (applicantSameAsClient ? (applicantLocation || address.location) : applicantLocation) || undefined,
            district: (applicantSameAsClient ? (applicantDistrict?.id ?? applicantDistrict ?? address.province) : (applicantDistrict?.id ?? applicantDistrict)) || undefined,
          }
        : undefined;

    const billingProvCode = String(
      (billingSameAsClient ? (address?.province?.id ?? address?.province) : (billingProvince?.id ?? billingProvince)) ??
      address?.province?.id ??
      address?.province ??
      ""
    ).trim();

    const billingPayload = {
      cuit: (billingSameAsClient ? cuitClean : (billingCuit || cuitClean)),
      address: ((billingSameAsClient ? address?.address : (billingAddress || address?.address)) || "").trim(),
      location: ((billingSameAsClient ? address?.location : (billingLocation || address?.location)) || "").trim(),
      province: billingProvCode,
      paysIva: Boolean(billingPaysIva),
    };

    setCreating(true);
    clientsService
      .create({
        cuit: cuitClean,
        name: businessName.trim(),
        address: addressPayload,
        representative: representativePayload,
        contact: contactPayload,
        billing: billingPayload,
      })
      .then(async (created) => {
        await refreshClients().catch(() => {});
        showSuccessToast("Cliente creado correctamente.");
        onCreated?.(created);
        onCancel?.();
      })
      .catch((err) => {
        const message = err?.message ?? "Error al crear el cliente.";
        setCreateError(message);
        showErrorToast(message);
      })
      .finally(() => setCreating(false));
  };

  const normalizeCuit = (value) => (value || "").replace(/\D/g, "");

  const isBusinessStepValid = () => {
    const digits = normalizeCuit(cuit);
    if (digits.length !== 11) return false;
    if (!businessName.trim()) return false;
    if (isLegalEntityCuit(digits)) {
      const nameOk = representativeName.trim().length > 0;
      const dniOk = String(representativeDni || "").trim().length === 8;
      const mailOk =
        !representativeMail ||
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(representativeMail);
      if (!nameOk || !dniOk || !mailOk) return false;
    }
    return true;
  };

  const isAddressStepValid = () => {
    const addr = selectedAddress;
    if (!addr) return false;
    const address = (addr.address || "").trim();
    const location = (addr.location || "").trim();
    const province = String(addr.province?.id ?? addr.province ?? "").trim();
    return !!address && !!location && !!province;
  };

  const isApplicantStepValid = () => {
    if (!isLaboratory) return true;
    if (applicantSameAsClient) return !!businessName.trim();
    return applicantName.trim().length > 0;
  };

  const isBillingStepValid = () => {
    const rawBillingCuit = billingSameAsClient ? cuit : billingCuit;
    const digits = normalizeCuit(rawBillingCuit);
    if (digits.length !== 11) return false;

    const sourceAddress = billingSameAsClient
      ? selectedAddress
      : {
          address: billingAddress,
          location: billingLocation,
          province: billingProvince,
        };

    if (!sourceAddress) return false;

    const address = (sourceAddress.address || "").trim();
    const location = (sourceAddress.location || "").trim();
    const province = String(
      sourceAddress.province?.id ?? sourceAddress.province ?? ""
    ).trim();

    return !!address && !!location && !!province;
  };

  const isStepValid = (stepIndex) => {
    const currentStep = steps[stepIndex];
    if (!currentStep) return true;
    switch (currentStep.id) {
      case "cliente":
      case "empresa":
        return isBusinessStepValid();
      case "domicilio":
        return isAddressStepValid();
      case "solicitante":
        return isApplicantStepValid();
      case "facturacion":
        return isBillingStepValid();
      default:
        return true;
    }
  };

  const totalSteps = steps.length;

  return (
    <div className="h-full min-h-0">
      <AltaStepper
        kicker="Nuevo cliente"
        steps={steps}
        step={step}
        onStep={(index) => {
          setCreateError("");
          setShowValidation(false);
          setStep(index);
        }}
        error={createError}
        onBack={() => {
          setCreateError("");
          setShowValidation(false);
          setStep((current) => Math.max(0, current - 1));
        }}
        onNext={() => {
          if (step < totalSteps - 1) {
            if (!isStepValid(step)) {
              setShowValidation(true);
              return;
            }
            setCreateError("");
            setShowValidation(false);
            setStep(step + 1);
            return;
          }
          handleConfirmCreate();
        }}
        nextLabel={
          step < totalSteps - 1
            ? "Siguiente"
            : creating
            ? "Creando…"
            : "Confirmar alta"
        }
        backDisabled={step === 0 || creating}
        nextDisabled={creating && step === totalSteps - 1}
        submitting={creating}
      >
        {steps[step]?.component}
      </AltaStepper>
    </div>
  );
}
