import { useState, useEffect } from "react";
import DataGrid from "../DataGrid";
import { clientsService } from "../../services/clientsService";
import { bussinessService } from "../../services/bussinessService";
import { useAuth } from "../../context/AuthContext";

export default function CreateClientModal({ onCancel, onCreated }) {
  const { user } = useAuth();
  const isLaboratory = user?.profile === "LABORATORY";

  const [step, setStep] = useState(1);

  const [cuit, setCuit] = useState("");
  const [cuitLoading, setCuitLoading] = useState(false);
  const [cuitError, setCuitError] = useState("");
  const [businessName, setBusinessName] = useState("");

  const [addresses, setAddresses] = useState([
    { id: "new", address: "", location: "", province: "" },
  ]);
  const [selectedAddressId, setSelectedAddressId] = useState("new");

  const [representativeName, setRepresentativeName] = useState("");
  const [representativeDni, setRepresentativeDni] = useState("");
  const [representativePhone, setRepresentativePhone] = useState("");
  const [representativeMail, setRepresentativeMail] = useState("");

  const [applicantName, setApplicantName] = useState("");
  const [applicantPhone, setApplicantPhone] = useState("");
  const [applicantMail, setApplicantMail] = useState("");
  const [applicantAddress, setApplicantAddress] = useState("");

  const [billingSameAsClient, setBillingSameAsClient] = useState(true);
  const [billingCuit, setBillingCuit] = useState("");
  const [billingAddress, setBillingAddress] = useState("");
  const [billingLocation, setBillingLocation] = useState("");
  const [billingProvince, setBillingProvince] = useState("");
  const [billingPaysIva, setBillingPaysIva] = useState(false);
  const [billingInitialized, setBillingInitialized] = useState(false);

  const [createError, setCreateError] = useState("");
  const [creating, setCreating] = useState(false);

  // Paso 1: consultar padrón por CUIT (si hay 11 dígitos)
  useEffect(() => {
    const digits = cuit.replace(/\D/g, "");
    if (digits.length !== 11) return;
    setCuitLoading(true);
    setCuitError("");
    const cuitClean = digits.slice(0, 11);
    bussinessService
      .get(cuitClean)
      .then((response) => {
        setBusinessName(response.name ?? "");
        const addrList = (response.addresses ?? []).map((a) => ({
          id: a.id,
          address: a.address ?? "",
          location: a.location ?? "",
          province: a.province ?? "",
        }));
        setAddresses([
          ...addrList,
          { id: "new", address: "", location: "", province: "" },
        ]);
        setSelectedAddressId(addrList.length > 0 ? addrList[0].id : "new");
        setCuitError("");
      })
      .catch((err) => {
        const msg =
          err?.response?.data?.message ??
          err?.message ??
          "CUIT no encontrado o error al consultar. Podés completar los datos manualmente.";
        setCuitError(msg);
        // Permitimos carga manual: mantenemos businessName editable
      })
      .finally(() => setCuitLoading(false));
  }, [cuit]);

  const selectedAddress =
    addresses.find((a) => a.id === selectedAddressId) ?? addresses[0];

  const handleAddressField = (key, value) => {
    setAddresses((prev) =>
      prev.map((addr) =>
        addr.id === selectedAddressId ? { ...addr, [key]: value } : addr
      )
    );
  };

  // Inicializar datos de facturación al entrar al paso de facturación
  useEffect(() => {
    const billingStep = isLaboratory ? 5 : 4;
    if (step !== billingStep || billingInitialized) return;
    const digits = cuit.replace(/\D/g, "");
    const cuitClean = digits.slice(0, 11);
    setBillingCuit(cuitClean);
    setBillingAddress(selectedAddress?.address ?? "");
    setBillingLocation(selectedAddress?.location ?? "");
    setBillingProvince(selectedAddress?.province ?? "");
    setBillingPaysIva(false);
    setBillingInitialized(true);
  }, [step, billingInitialized, cuit, selectedAddress, isLaboratory]);

  const totalSteps = isLaboratory ? 6 : 5;
  const canGoBack = step > 1;
  const canGoNext = step < totalSteps;

  const handleNext = () => {
    setCreateError("");
    const digits = cuit.replace(/\D/g, "");
    const cuitClean = digits.slice(0, 11);

    if (step === 1) {
      if (cuitClean.length !== 11) {
        setCreateError("El CUIT debe tener 11 dígitos.");
        return;
      }
      if (!businessName.trim()) {
        setCreateError("El nombre de la empresa es requerido.");
        return;
      }
    }
    if (step === 2) {
      const provStr = (() => {
        const p = selectedAddress?.province;
        if (p == null) return "";
        if (typeof p === "object" && p !== null) return String(p.id ?? p.name ?? "");
        return String(p);
      })();
      if (
        !selectedAddress?.address?.trim() &&
        !selectedAddress?.location?.trim() &&
        !provStr.trim()
      ) {
        setCreateError(
          "Debes completar al menos la dirección, localidad o provincia del domicilio."
        );
        return;
      }
    }
    if (step === 3) {
      if (!representativeName.trim()) {
        setCreateError("El nombre del representante es requerido.");
        return;
      }
    }
    if (step === 4 && isLaboratory) {
      if (!applicantName.trim()) {
        setCreateError("El nombre del solicitante es requerido.");
        return;
      }
    }
    const billingStep = isLaboratory ? 5 : 4;
    if (step === billingStep) {
      if (!billingCuit.trim()) {
        setCreateError("El CUIT de facturación es requerido.");
        return;
      }
    }

    if (canGoNext) setStep((s) => s + 1);
  };

  const handleBack = () => {
    setCreateError("");
    if (canGoBack) setStep((s) => s - 1);
  };

  const handleConfirmCreate = () => {
    setCreateError("");
    const digits = cuit.replace(/\D/g, "");
    const cuitClean = digits.slice(0, 11);
    if (cuitClean.length !== 11) {
      setCreateError("El CUIT debe tener 11 dígitos.");
      setStep(1);
      return;
    }
    if (!businessName.trim()) {
      setCreateError("El nombre de la empresa es requerido.");
      setStep(1);
      return;
    }

    const addressPayload =
      selectedAddressId === "new"
        ? {
            address: selectedAddress.address,
            location: selectedAddress.location,
            province: selectedAddress.province,
          }
        : selectedAddressId;

    const representativePayload = {
      name: representativeName.trim(),
      dni: String(representativeDni || ""),
      phone: representativePhone || undefined,
      mail: representativeMail || undefined,
    };

    const contactPayload =
      isLaboratory && applicantName.trim()
        ? {
            name: applicantName.trim(),
            phone: applicantPhone || undefined,
            mail: applicantMail || undefined,
            address: applicantAddress || undefined,
          }
        : undefined;

    const billingPayload = {
      cuit: billingCuit || cuitClean,
      address: billingAddress || selectedAddress?.address || "",
      location: billingLocation || selectedAddress?.location || "",
      province: billingProvince || selectedAddress?.province || "",
      paysIva: billingPaysIva,
    };

    setCreating(true);
    clientsService
      .create({
        cuit: cuitClean,
        address: addressPayload,
        representative: representativePayload,
        contact: contactPayload,
        billing: billingPayload,
      })
      .then((created) => {
        onCreated?.(created);
        onCancel?.();
      })
      .catch((err) => {
        setCreateError(err?.message ?? "Error al crear el cliente.");
      })
      .finally(() => setCreating(false));
  };

  const renderStep = () => {
    switch (step) {
      case 1: {
        const digits = cuit.replace(/\D/g, "");
        const cuitValue = digits.slice(0, 11);
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-800">
              Empresa
            </h2>
            <DataGrid
              data={[
                {
                  label: "CUIT (11 dígitos)",
                  value: cuitValue,
                  forceInput: true,
                  inputType: "text",
                  placeholder: "Ej: 20123456789",
                  onSave: (val) => setCuit(String(val || "").replace(/\D/g, "")),
                },
                {
                  label: "Razón social",
                  value: businessName,
                  forceInput: true,
                  inputType: "text",
                  placeholder: "Nombre de la empresa",
                  onSave: (val) => setBusinessName(val || ""),
                },
              ]}
            />
            {cuitLoading && (
              <p className="text-sm text-gray-500 mt-1">
                Consultando padrón…
              </p>
            )}
            {cuitError && (
              <p className="text-sm text-red-600 mt-1 bg-red-50 p-2 rounded">
                {cuitError}
              </p>
            )}
          </div>
        );
      }
      case 2:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-800">
              Domicilio
            </h2>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">
                Domicilio
              </label>
              <select
                className="select select-bordered w-full"
                value={selectedAddressId}
                onChange={(e) => setSelectedAddressId(e.target.value)}
              >
                {addresses.map((addr) =>
                  addr.id === "new" ? (
                    <option key="new" value="new">
                      Agregar nuevo domicilio
                    </option>
                  ) : (
                    <option key={addr.id} value={addr.id}>
                      {addr.address}, {addr.location}, {addr.province}
                    </option>
                  )
                )}
              </select>
            </div>
            <DataGrid
              data={[
                {
                  label: "Dirección",
                  value: selectedAddress?.address ?? "",
                  forceInput: true,
                  inputType: "text",
                  placeholder: "Dirección",
                  onSave: (val) => handleAddressField("address", val || ""),
                },
                {
                  label: "Localidad",
                  value: selectedAddress?.location ?? "",
                  forceInput: true,
                  inputType: "text",
                  placeholder: "Localidad",
                  onSave: (val) => handleAddressField("location", val || ""),
                },
                {
                  label: "Provincia",
                  value: selectedAddress?.province ?? "",
                  forceInput: true,
                  inputType: "text",
                  placeholder: "Provincia",
                  onSave: (val) => handleAddressField("province", val || ""),
                },
              ]}
            />
          </div>
        );
      case 3:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-800">
              Representante
            </h2>
            <DataGrid
              data={[
                {
                  label: "Nombre",
                  value: representativeName,
                  forceInput: true,
                  inputType: "text",
                  placeholder: "Nombre del representante",
                  onSave: (val) => setRepresentativeName(val || ""),
                },
                {
                  label: "DNI",
                  value: representativeDni,
                  forceInput: true,
                  inputType: "text",
                  placeholder: "DNI",
                  onSave: (val) => setRepresentativeDni(val || ""),
                },
                {
                  label: "Teléfono",
                  value: representativePhone,
                  forceInput: true,
                  inputType: "text",
                  placeholder: "Teléfono",
                  onSave: (val) => setRepresentativePhone(val || ""),
                },
                {
                  label: "Mail",
                  value: representativeMail,
                  forceInput: true,
                  inputType: "email",
                  placeholder: "Mail",
                  onSave: (val) => setRepresentativeMail(val || ""),
                },
              ]}
            />
          </div>
        );
      case 4:
        if (!isLaboratory) {
          return (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-800">
                Facturación
              </h2>
              <DataGrid
                data={[
                  {
                    label: "Usar mismos datos que el cliente",
                    value: billingSameAsClient,
                    forceInput: true,
                    inputType: "checkbox",
                    realTimeChange: true,
                    onSave: (val) => setBillingSameAsClient(!!val),
                  },
                  {
                    label: "El cliente paga IVA",
                    value: billingPaysIva,
                    forceInput: true,
                    inputType: "checkbox",
                    realTimeChange: true,
                    onSave: (val) => setBillingPaysIva(!!val),
                  },
                  {
                    label: "CUIT facturación",
                    value: billingSameAsClient ? cuit : billingCuit,
                    forceInput: true,
                    inputType: "text",
                    placeholder: "CUIT facturación",
                    onSave: (val) => setBillingCuit(val || ""),
                  },
                  {
                    label: "Dirección de facturación",
                    value:
                      billingSameAsClient
                        ? selectedAddress?.address ?? ""
                        : billingAddress,
                    forceInput: true,
                    inputType: "text",
                    placeholder: "Dirección de facturación",
                    onSave: (val) => setBillingAddress(val || ""),
                  },
                  {
                    label: "Localidad de facturación",
                    value:
                      billingSameAsClient
                        ? selectedAddress?.location ?? ""
                        : billingLocation,
                    forceInput: true,
                    inputType: "text",
                    placeholder: "Localidad de facturación",
                    onSave: (val) => setBillingLocation(val || ""),
                  },
                  {
                    label: "Provincia de facturación",
                    value:
                      billingSameAsClient
                        ? selectedAddress?.province ?? ""
                        : billingProvince,
                    forceInput: true,
                    inputType: "text",
                    placeholder: "Provincia de facturación",
                    onSave: (val) => setBillingProvince(val || ""),
                  },
                ]}
              />
            </div>
          );
        }
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-800">
              Solicitante
            </h2>
            <DataGrid
              data={[
                {
                  label: "Nombre",
                  value: applicantName,
                  forceInput: true,
                  inputType: "text",
                  placeholder: "Nombre",
                  onSave: (val) => setApplicantName(val || ""),
                },
                {
                  label: "Teléfono",
                  value: applicantPhone,
                  forceInput: true,
                  inputType: "text",
                  placeholder: "Teléfono",
                  onSave: (val) => setApplicantPhone(val || ""),
                },
                {
                  label: "Mail",
                  value: applicantMail,
                  forceInput: true,
                  inputType: "email",
                  placeholder: "Mail",
                  onSave: (val) => setApplicantMail(val || ""),
                },
                {
                  label: "Domicilio",
                  value: applicantAddress,
                  forceInput: true,
                  inputType: "text",
                  placeholder: "Domicilio",
                  onSave: (val) => setApplicantAddress(val || ""),
                },
              ]}
            />
          </div>
        );
      case 5:
        if (!isLaboratory) {
          const digits = cuit.replace(/\D/g, "");
          const cuitClean = digits.slice(0, 11);
          const summary = [
            { label: "CUIT cliente", value: cuitClean },
            { label: "Empresa", value: businessName },
            {
              label: "Domicilio cliente",
              value:
                [selectedAddress?.address, selectedAddress?.location, selectedAddress?.province]
                  .filter(Boolean)
                  .join(", ") || "—",
            },
            {
              label: "Representante",
              value: representativeName || "—",
            },
            {
              label: "DNI representante",
              value: representativeDni || "—",
            },
            {
              label: "Teléfono representante",
              value: representativePhone || "—",
            },
            {
              label: "Mail representante",
              value: representativeMail || "—",
            },
            { label: "CUIT facturación", value: billingCuit || cuitClean },
            {
              label: "Domicilio facturación",
              value:
                [billingAddress || selectedAddress?.address, billingLocation || selectedAddress?.location, billingProvince || selectedAddress?.province]
                  .filter(Boolean)
                  .join(", ") || "—",
            },
            {
              label: "Paga IVA",
              value: billingPaysIva ? "Sí" : "No",
            },
          ];

          return (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-800">
                Resumen y confirmación
              </h2>
              <DataGrid data={summary} />
            </div>
          );
        }
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-800">
              Facturación
            </h2>
            <DataGrid
              data={[
                {
                  label: "Usar mismos datos que el cliente",
                  value: billingSameAsClient,
                  forceInput: true,
                  inputType: "checkbox",
                  realTimeChange: true,
                  onSave: (val) => setBillingSameAsClient(!!val),
                },
                {
                  label: "El cliente paga IVA",
                  value: billingPaysIva,
                  forceInput: true,
                  inputType: "checkbox",
                  realTimeChange: true,
                  onSave: (val) => setBillingPaysIva(!!val),
                },
                {
                  label: "Dirección de facturación",
                  value:
                    billingSameAsClient
                      ? selectedAddress?.address ?? ""
                      : billingAddress,
                  forceInput: true,
                  inputType: "text",
                  placeholder: "Dirección de facturación",
                  onSave: (val) => setBillingAddress(val || ""),
                },
                {
                  label: "Localidad de facturación",
                  value:
                    billingSameAsClient
                      ? selectedAddress?.location ?? ""
                      : billingLocation,
                  forceInput: true,
                  inputType: "text",
                  placeholder: "Localidad de facturación",
                  onSave: (val) => setBillingLocation(val || ""),
                },
                {
                  label: "Provincia de facturación",
                  value:
                    billingSameAsClient
                      ? selectedAddress?.province ?? ""
                      : billingProvince,
                  forceInput: true,
                  inputType: "text",
                  placeholder: "Provincia de facturación",
                  onSave: (val) => setBillingProvince(val || ""),
                },
              ]}
            />
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  CUIT facturación
                </label>
                <input
                  type="text"
                  className="input input-bordered w-full"
                  disabled={billingSameAsClient}
                  value={billingSameAsClient ? cuit : billingCuit}
                  onChange={(e) => setBillingCuit(e.target.value)}
                />
              </div>
            </div>
          </div>
        );
      case 6: {
        const digits = cuit.replace(/\D/g, "");
        const cuitClean = digits.slice(0, 11);
        const summary = [
          { label: "CUIT cliente", value: cuitClean },
          { label: "Empresa", value: businessName },
          {
            label: "Domicilio cliente",
            value:
              [selectedAddress?.address, selectedAddress?.location, selectedAddress?.province]
                .filter(Boolean)
                .join(", ") || "—",
          },
          {
            label: "Representante",
            value: representativeName || "—",
          },
          {
            label: "DNI representante",
            value: representativeDni || "—",
          },
          {
            label: "Teléfono representante",
            value: representativePhone || "—",
          },
          {
            label: "Mail representante",
            value: representativeMail || "—",
          },
        ];
        if (isLaboratory) {
          summary.push(
            { label: "Solicitante", value: applicantName || "—" },
            { label: "Teléfono solicitante", value: applicantPhone || "—" },
            { label: "Mail solicitante", value: applicantMail || "—" },
            { label: "Domicilio solicitante", value: applicantAddress || "—" },
          );
        }
        summary.push(
          { label: "CUIT facturación", value: billingCuit || cuitClean },
          {
            label: "Domicilio facturación",
            value:
              [billingAddress || selectedAddress?.address, billingLocation || selectedAddress?.location, billingProvince || selectedAddress?.province]
                .filter(Boolean)
                .join(", ") || "—",
          },
          {
            label: "Paga IVA",
            value: billingPaysIva ? "Sí" : "No",
          }
        );

        return (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-800">
              Resumen y confirmación
            </h2>
            <DataGrid data={summary} />
          </div>
        );
      }
      default:
        return null;
    }
  };

  const stepLabels = isLaboratory
    ? [
        "CUIT y empresa",
        "Domicilio",
        "Representante",
        "Solicitante",
        "Facturación",
        "Resumen",
      ]
    : [
        "CUIT y empresa",
        "Domicilio",
        "Representante",
        "Facturación",
        "Resumen",
      ];

  return (
    <div className="max-w-2xl w-full flex flex-col min-h-0 flex-1">
      {/* Indicador de pasos - fijo */}
      <div className="flex-shrink-0 flex items-center justify-between mb-4">
        {stepLabels.map((label, index) => {
          const num = index + 1;
          const active = num === step;
          const completed = num < step;
          return (
            <div key={label} className="flex-1 flex items-center">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                  active
                    ? "bg-[var(--primary)] text-white"
                    : completed
                    ? "bg-green-500 text-white"
                    : "bg-gray-200 text-gray-700"
                }`}
              >
                {num}
              </div>
              <span className="ml-2 text-[11px] text-gray-700 hidden sm:inline">
                {label}
              </span>
              {num < totalSteps && (
                <div className="flex-1 h-px bg-gray-300 mx-1 hidden sm:block" />
              )}
            </div>
          );
        })}
      </div>

      {/* Contenido del paso - scrolleable */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        {renderStep()}
      </div>

      {/* Pie - error y botones fijos */}
      <div className="flex-shrink-0 mt-4 space-y-2">
        {createError && (
          <p className="text-sm text-red-600 bg-red-50 p-2 rounded">
            {createError}
          </p>
        )}
        <div className="flex justify-between gap-2">
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={onCancel}
          >
            Cancelar
          </button>
          <div className="flex gap-2">
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={handleBack}
              disabled={!canGoBack}
            >
              Atrás
            </button>
            {step < totalSteps && (
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={handleNext}
              >
                Siguiente
              </button>
            )}
            {step === totalSteps && (
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={handleConfirmCreate}
                disabled={creating}
              >
                {creating ? "Creando…" : "Confirmar"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
