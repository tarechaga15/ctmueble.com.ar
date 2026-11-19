import { MapPin } from "lucide-react";
import DataGrid from "../../DataGrid";
import { useDataCache } from "../../../context/DataCacheContext";

export default function AddressStep({
  address,
  selectedAddress,
  onChangeField,
  showValidation = false,
}) {
  const currentAddress = address ?? selectedAddress;
  const { districts, loadDistricts } = useDataCache();

  return (
    <div className="space-y-4">
      <DataGrid
        title="Domicilio"
        icon={MapPin}
        showValidation={showValidation}
        data={[
          {
            label: "Dirección",
            value: currentAddress?.address ?? "",
            forceInput: true,
            inputType: "text",
            placeholder: "Dirección",
            realTimeChange: true,
            required: true,
            checkValidity: (val) => !!val && val.trim().length > 0,
            onSave: (val) => onChangeField("address", val || ""),
          },
          {
            label: "Localidad",
            value: currentAddress?.location ?? "",
            forceInput: true,
            inputType: "text",
            placeholder: "Localidad",
            realTimeChange: true,
            required: true,
            checkValidity: (val) => !!val && val.trim().length > 0,
            onSave: (val) => onChangeField("location", val || ""),
          },
          {
            label: "Provincia",
            value: currentAddress?.province ?? "",
            forceInput: true,
            inputType: "select",
            placeholder: "Provincia",
            realTimeChange: true,
            required: true,
            options: districts || [],
            loadOptions: () => loadDistricts(),
            optionLabelKey: "name",
            optionValueKey: "id",
            checkValidity: (val) => !!val && val.trim().length > 0,
            onSave: (val) => onChangeField("province", val || ""),
          },
        ]}
      />
    </div>
  );
}
