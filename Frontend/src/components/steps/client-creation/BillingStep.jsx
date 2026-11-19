import { Receipt } from "lucide-react";
import DataGrid from "../../DataGrid";
import { useDataCache } from "../../../context/DataCacheContext";
import { formatCuit } from "./BussinessSearch";

export default function BillingStep({
  isLaboratory,
  billingSameAsClient,
  setBillingSameAsClient,
  billingCuit,
  setBillingCuit,
  billingAddress,
  setBillingAddress,
  billingLocation,
  setBillingLocation,
  billingProvince,
  setBillingProvince,
  billingPaysIva,
  setBillingPaysIva,
  cuit,
  selectedAddress,
  showValidation = false,
}) {
  const { districts, loadDistricts } = useDataCache();

  if (!isLaboratory) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Receipt className="size-5 text-[var(--primary)]" />
          <h2 className="text-xl font-bold text-gray-800">Facturación</h2>
        </div>
        <DataGrid
          showValidation={showValidation}
          data={[
            {
              label: "CUIT facturación",
              value: billingSameAsClient ? cuit : billingCuit,
              format: formatCuit,
              forceInput: true,
              inputType: "text",
              placeholder: "XX-XXXXXXXX-X",
              realTimeChange: true,
              required: true,
              checkValidity: (val) =>
                String(val || "").replace(/\D/g, "").length === 11,
              onSave: (val) =>
                setBillingCuit(String(val || "").replace(/\D/g, "").slice(0, 11)),
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
              realTimeChange: true,
              required: true,
              checkValidity: (val) => !!val && val.trim().length > 0,
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
              realTimeChange: true,
              required: true,
              checkValidity: (val) => !!val && val.trim().length > 0,
              onSave: (val) => setBillingLocation(val || ""),
            },
            {
              label: "Provincia de facturación",
              value:
                billingSameAsClient
                  ? selectedAddress?.province ?? ""
                  : billingProvince,
              forceInput: true,
              inputType: "select",
              placeholder: "Provincia de facturación",
              realTimeChange: true,
              required: true,
              options: districts || [],
              loadOptions: () => loadDistricts(),
              optionLabelKey: "name",
              optionValueKey: "id",
              checkValidity: (val) => !!val && String(val).trim().length > 0,
              onSave: (val) => setBillingProvince(val || ""),
            },
          ]}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Receipt className="size-5 text-[var(--primary)]" />
        <h2 className="text-xl font-bold text-gray-800">Facturación</h2>
      </div>
      <DataGrid
        showValidation={showValidation}
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
            realTimeChange: true,
            required: true,
            checkValidity: (val) => !!val && val.trim().length > 0,
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
            realTimeChange: true,
            required: true,
            checkValidity: (val) => !!val && val.trim().length > 0,
            onSave: (val) => setBillingLocation(val || ""),
          },
          {
            label: "Provincia de facturación",
            value:
              billingSameAsClient
                ? selectedAddress?.province ?? ""
                : billingProvince,
            forceInput: true,
            inputType: "select",
            placeholder: "Provincia de facturación",
            realTimeChange: true,
            required: true,
            options: districts || [],
            loadOptions: () => loadDistricts(),
            optionLabelKey: "name",
            optionValueKey: "id",
            checkValidity: (val) => !!val && String(val).trim().length > 0,
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
            value={formatCuit(billingSameAsClient ? cuit : billingCuit)}
            onChange={(e) =>
              setBillingCuit(String(e.target.value || "").replace(/\D/g, "").slice(0, 11))
            }
          />
        </div>
      </div>
    </div>
  );
}
