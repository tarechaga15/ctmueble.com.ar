import { Building2, MapPin, Receipt, UserCheck, UserRound } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCuit, isLegalEntityCuit } from "./BussinessSearch";
import { useDataCache } from "../../../context/DataCacheContext";
import { getDistrictDisplay } from "@/lib/districtUtils";

function phoneDisplay(phone) {
  if (!phone) return "—";
  if (typeof phone === "object") {
    if (!phone.phone) return "—";
    return `+${phone.country_code || "54"} ${phone.phone}`;
  }
  return String(phone);
}

export default function SummaryStep({
  isLaboratory,
  cuit,
  businessName,
  selectedAddress,
  representativeName,
  representativeDni,
  representativePhone,
  representativeMail,
  applicantName,
  applicantDni,
  applicantPhone,
  applicantMail,
  applicantAddress,
  billingCuit,
  billingAddress,
  billingLocation,
  billingProvince,
  billingPaysIva,
}) {
  const { districts } = useDataCache();
  const digits = cuit.replace(/\D/g, "");
  const cuitClean = digits.slice(0, 11);
  const isLegal = isLegalEntityCuit(cuitClean);

  const addressProvinceName = getDistrictDisplay(
    selectedAddress?.province,
    districts
  );
  const billingProvinceName = getDistrictDisplay(
    billingProvince || selectedAddress?.province,
    districts
  );

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <Card size="sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            Cliente
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs text-muted-foreground">CUIT</p>
            <p className="font-medium">{formatCuit(cuitClean) || "—"}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Razón social</p>
            <p className="font-medium">{businessName || "—"}</p>
          </div>
        </CardContent>
      </Card>

      <Card size="sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            Domicilio
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <p className="text-xs text-muted-foreground">Dirección</p>
            <p className="font-medium">{selectedAddress?.address || "—"}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Localidad</p>
            <p className="font-medium">{selectedAddress?.location || "—"}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Provincia</p>
            <p className="font-medium">{addressProvinceName || "—"}</p>
          </div>
        </CardContent>
      </Card>

      {isLegal && (
        <Card size="sm" className="sm:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="h-4 w-4 text-muted-foreground" />
              Representante
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div>
              <p className="text-xs text-muted-foreground">Nombre</p>
              <p className="font-medium">{representativeName || "—"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">DNI</p>
              <p className="font-medium">{representativeDni || "—"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Teléfono</p>
              <p className="font-medium">{phoneDisplay(representativePhone)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Mail</p>
              <p className="font-medium">{representativeMail || "—"}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {isLaboratory && applicantName && (
        <Card size="sm" className="sm:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserRound className="h-4 w-4 text-muted-foreground" />
              Solicitante
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3 sm:grid-cols-5">
            <div>
              <p className="text-xs text-muted-foreground">Nombre</p>
              <p className="font-medium">{applicantName || "—"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">DNI</p>
              <p className="font-medium">{applicantDni || "—"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Teléfono</p>
              <p className="font-medium">{phoneDisplay(applicantPhone)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Mail</p>
              <p className="font-medium">{applicantMail || "—"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Domicilio</p>
              <p className="font-medium">{applicantAddress || "—"}</p>
            </div>
          </CardContent>
        </Card>
      )}

      <Card size="sm" className="sm:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-4 w-4 text-muted-foreground" />
            Facturación
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <div>
            <p className="text-xs text-muted-foreground">CUIT</p>
            <p className="font-medium">
              {formatCuit(billingCuit || cuitClean) || "—"}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Domicilio</p>
            <p className="font-medium">
              {[
                billingAddress || selectedAddress?.address,
                billingLocation || selectedAddress?.location,
                billingProvinceName !== "—" ? billingProvinceName : "",
              ]
                .filter(Boolean)
                .join(", ") || "—"}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Paga IVA</p>
            <p className="font-medium">{billingPaysIva ? "Sí" : "No"}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
