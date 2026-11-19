import DataGrid from "../../DataGrid";

export default function RepresentativeStep({
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
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-gray-800">Representante</ h2>
      <DataGrid
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
            placeholder: "DNI",
            realTimeChange: true,
            required: true,
            checkValidity: (val) => !!val && val.trim().length === 8,
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
  );
}

