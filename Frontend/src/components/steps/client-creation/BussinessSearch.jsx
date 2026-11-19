import { Building2, UserCheck } from "lucide-react";
import DataGrid from "../../DataGrid";

export function formatCuit(val) {
  if (!val) return "";
  const digits = String(val).replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 2) return digits;
  if (digits.length <= 10) return `${digits.slice(0, 2)}-${digits.slice(2)}`;
  return `${digits.slice(0, 2)}-${digits.slice(2, 10)}-${digits.slice(10)}`;
}

export function formatDni(val) {
  if (!val) return "";
  const digits = String(val).replace(/\D/g, "").slice(0, 8);
  if (!digits) return "";
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

export function isLegalEntityCuit(cuitValue) {
  const digits = String(cuitValue || "").replace(/\D/g, "");
  return (
    digits.startsWith("30") ||
    digits.startsWith("33") ||
    digits.startsWith("34")
  );
}

export function extractDniFromCuit(cuitValue) {
  const digits = String(cuitValue || "").replace(/\D/g, "");
  if (digits.length >= 4) {
    return digits.slice(2, -1);
  }
  return "";
}

export default function BussinessSearch({
  cuit,
  setCuit,
  businessName,
  setBusinessName,
  representativeName,
  setRepresentativeName,
  representativeDni,
  setRepresentativeDni,
  representativePhone,
  setRepresentativePhone,
  representativeMail,
  setRepresentativeMail,
  showValidation = false,
}) {
  const isLegalEntity = isLegalEntityCuit(cuit);

  return (
    <div className="divide-y divide-border">
      <div className="pb-4">
        <DataGrid
          title="Cliente"
          icon={Building2}
          showValidation={showValidation}
          data={[
            {
              label: "CUIT",
              value: cuit,
              format: formatCuit,
              forceInput: true,
              inputType: "text",
              placeholder: "XX-XXXXXXXX-X",
              realTimeChange: true,
              required: true,
              checkValidity: (val) =>
                String(val || "").replace(/\D/g, "").length === 11,
              onSave: (val) =>
                setCuit(String(val || "").replace(/\D/g, "").slice(0, 11)),
            },
            {
              label: isLegalEntity ? "Razón social" : "Nombre / Razón social",
              value: businessName,
              forceInput: true,
              inputType: "text",
              placeholder: isLegalEntity
                ? "Nombre de la empresa"
                : "Nombre y apellido / Razón social",
              realTimeChange: true,
              required: true,
              checkValidity: (val) => !!val && val.trim().length > 0,
              onSave: (val) => setBusinessName(val || ""),
            },
          ]}
        />
      </div>

      {isLegalEntity && (
        <div className="pt-4">
          <DataGrid
            title="Representante"
            icon={UserCheck}
            showValidation={showValidation}
            data={[
              {
                label: "Nombre",
                value: representativeName,
                forceInput: true,
                inputType: "text",
                placeholder: "Nombre del representante",
                realTimeChange: true,
                required: true,
                checkValidity: (val) => !!val && val.trim().length > 0,
                onSave: (val) => setRepresentativeName(val || ""),
              },
              {
                label: "DNI",
                value: representativeDni,
                forceInput: true,
                inputType: "text",
                placeholder: "DNI (8 dígitos)",
                realTimeChange: true,
                required: true,
                checkValidity: (val) =>
                  !!val && String(val).trim().length === 8,
                onSave: (val) => setRepresentativeDni(val || ""),
              },
              {
                label: "Teléfono",
                value: representativePhone,
                forceInput: true,
                inputType: "phone",
                placeholder: "Teléfono",
                realTimeChange: true,
                onSave: (val) => setRepresentativePhone(val || ""),
              },
              {
                label: "Mail",
                value: representativeMail,
                forceInput: true,
                inputType: "email",
                placeholder: "Mail",
                realTimeChange: true,
                checkValidity: (val) =>
                  !val || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val),
                onSave: (val) => setRepresentativeMail(val || ""),
              },
            ]}
          />
        </div>
      )}
    </div>
  );
}
