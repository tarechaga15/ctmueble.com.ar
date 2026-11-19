import { UserRound } from "lucide-react";
import DataGrid from "../../DataGrid";
import Data from "../../Data";
import { useDataCache } from "../../../context/DataCacheContext";

export default function ApplicantStep({
  isNaturalPerson = false,
  applicantSameAsClient = false,
  onToggleApplicantSameAsClient,
  clientName = "",
  clientAddress = {},
  applicantName,
  setApplicantName,
  applicantDni,
  setApplicantDni,
  applicantPhone,
  setApplicantPhone,
  applicantMail,
  setApplicantMail,
  applicantStreet,
  setApplicantStreet,
  applicantLocation,
  setApplicantLocation,
  applicantDistrict,
  setApplicantDistrict,
  showValidation = false,
}) {
  const { districts, loadDistricts } = useDataCache();

  return (
    <div className="space-y-4">
      {isNaturalPerson && (
        <div className="pb-1 border-b border-border">
          <Data
            label="El cliente es el solicitante"
            value={applicantSameAsClient}
            forceInput={true}
            inputType="checkbox"
            realTimeChange={true}
            onSave={(val) => onToggleApplicantSameAsClient?.(val)}
          />
        </div>
      )}

      <DataGrid
        title="Solicitante"
        icon={UserRound}
        showValidation={showValidation}
        data={[
          {
            label: "Nombre",
            value: applicantName,
            forceInput: true,
            inputType: "text",
            placeholder: "Nombre",
            realTimeChange: true,
            required: true,
            disabled: applicantSameAsClient && Boolean(clientName?.trim()),
            checkValidity: (val) => !val || val.trim().length > 0,
            onSave: (val) => setApplicantName(val || ""),
          },
          {
            label: "DNI",
            value: applicantDni,
            forceInput: true,
            inputType: "text",
            placeholder: "DNI",
            realTimeChange: true,
            required: !applicantSameAsClient,
            disabled: applicantSameAsClient && Boolean(applicantDni?.trim()),
            checkValidity: (val) => !val || /^\d{7,8}$/.test(String(val).trim()),
            onSave: (val) => setApplicantDni(val || ""),
          },
          {
            label: "Teléfono",
            value: applicantPhone,
            forceInput: true,
            inputType: "phone",
            placeholder: "Teléfono",
            realTimeChange: true,
            required: !applicantSameAsClient,
            disabled: false,
            checkValidity: (val) => !val || val.trim().length > 0,
            onSave: (val) => setApplicantPhone(val || ""),
          },
          {
            label: "Mail",
            value: applicantMail,
            forceInput: true,
            inputType: "email",
            placeholder: "Mail",
            realTimeChange: true,
            required: !applicantSameAsClient,
            disabled: false,
            checkValidity: (val) =>
              !val || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val),
            onSave: (val) => setApplicantMail(val || ""),
          },
          {
            label: "Dirección",
            value: applicantStreet,
            forceInput: true,
            inputType: "text",
            placeholder: "Dirección",
            realTimeChange: true,
            required: !applicantSameAsClient,
            disabled: applicantSameAsClient && Boolean(clientAddress?.address?.trim()),
            checkValidity: (val) => !val || val.trim().length > 0,
            onSave: (val) => setApplicantStreet(val || ""),
          },
          {
            label: "Localidad",
            value: applicantLocation,
            forceInput: true,
            inputType: "text",
            placeholder: "Localidad",
            realTimeChange: true,
            required: !applicantSameAsClient,
            disabled: applicantSameAsClient && Boolean(clientAddress?.location?.trim()),
            checkValidity: (val) => !val || val.trim().length > 0,
            onSave: (val) => setApplicantLocation(val || ""),
          },
          {
            label: "Provincia",
            value: applicantDistrict,
            forceInput: true,
            inputType: "select",
            placeholder: "Provincia",
            realTimeChange: true,
            options: districts || [],
            loadOptions: () => loadDistricts(),
            optionLabelKey: "name",
            optionValueKey: "id",
            required: !applicantSameAsClient,
            disabled: applicantSameAsClient && Boolean(clientAddress?.province),
            checkValidity: (val) => !val || String(val).trim().length > 0,
            onSave: (val) => setApplicantDistrict(val || ""),
          },
        ]}
      />
    </div>
  );
}
